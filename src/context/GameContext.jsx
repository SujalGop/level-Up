import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, onSnapshot, writeBatch } from 'firebase/firestore';
import { auth, db } from '../firebase';
import Login from '../components/Login';
import { getSystemNow, formatDateStr } from '../utils/schedule';

// ─── Default State ───────────────────────────────────────────────────────────
const DEFAULT_STATE = {
  playerStats: {
    name: 'Player',
    class: 'E-Rank',
    gold: 0,
    goldCap: 0,
    hp: 100,
    burnoutDebuff: false,
    STR: 0,
    INT: 0,
    VIT: 0,
    PER: 0,
    sbiSavingsMandate: 0,
    lastPerfectDayCheck: '',
    perfectDayAchieved: false,
    dayEndTime: '00:00',
  },
  masterTasks: [],
  shopItems: [],
  skillBooks: [],
  jobQuests: [],
  vaultGoals: [],
  celebration: null,
};

// ─── Context ──────────────────────────────────────────────────────────────────
export const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [state, setState] = useState(DEFAULT_STATE);
  const [isShaking, setIsShaking] = useState(false);
  const celebrationTimerRef = useRef(null);

  // Auto-clear celebration
  useEffect(() => {
    if (state.celebration) {
      if (celebrationTimerRef.current) clearTimeout(celebrationTimerRef.current);
      celebrationTimerRef.current = setTimeout(() => {
        setState(s => ({ ...s, celebration: null }));
      }, 3500);
    }
  }, [state.celebration]);

  // Auth & Migration
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const legacyData = localStorage.getItem('the-system-state');
        if (legacyData) {
          try {
            const parsed = JSON.parse(legacyData);
            const userDocRef = doc(db, 'users', currentUser.uid);
            const userDocSnap = await getDoc(userDocRef);
            
            if (!userDocSnap.exists()) {
              const batch = writeBatch(db);
              batch.set(userDocRef, { playerStats: parsed.playerStats || DEFAULT_STATE.playerStats });
              
              const moveCollection = (dataArr, colName) => {
                if (!Array.isArray(dataArr)) return;
                dataArr.forEach(item => {
                  batch.set(doc(db, `users/${currentUser.uid}/${colName}`, item.id.toString()), item);
                });
              };
              
              const masterData = parsed.masterTasks || (parsed.dailyQuests ? parsed.dailyQuests.map(q => ({
                ...q, hpPenalty: 20, recurrenceType: 'daily', recurrenceValue: 1, history: []
              })) : []);

              moveCollection(masterData, 'masterTasks');
              moveCollection(parsed.shopItems, 'shopItems');
              moveCollection(parsed.skillBooks, 'skillBooks');
              moveCollection(parsed.jobQuests, 'jobQuests');
              moveCollection(parsed.vaultGoals, 'vaultGoals');
              
              await batch.commit();
            }
            localStorage.removeItem('the-system-state');
          } catch (e) {
             console.error("Migration failed:", e);
          }
        }
      } else {
        setState(DEFAULT_STATE);
      }
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  // Firestore Listeners
  useEffect(() => {
    if (!user) return;
    const uid = user.uid;
    const unsubs = [];

    unsubs.push(onSnapshot(doc(db, 'users', uid), (docSnap) => {
      if (docSnap.exists() && docSnap.data().playerStats) {
        setState(prev => ({ ...prev, playerStats: docSnap.data().playerStats }));
      } else {
        setDoc(doc(db, 'users', uid), { playerStats: DEFAULT_STATE.playerStats }, { merge: true });
      }
    }));

    const createCollectionListener = (colName, stateKey) => {
      return onSnapshot(collection(db, `users/${uid}/${colName}`), (snapshot) => {
        const items = snapshot.docs.map(d => ({ ...d.data(), id: isNaN(Number(d.id)) ? d.id : Number(d.id) }));
        setState(prev => ({ ...prev, [stateKey]: items }));
      });
    };

    unsubs.push(createCollectionListener('masterTasks', 'masterTasks'));
    unsubs.push(createCollectionListener('shopItems', 'shopItems'));
    unsubs.push(createCollectionListener('skillBooks', 'skillBooks'));
    unsubs.push(createCollectionListener('jobQuests', 'jobQuests'));
    unsubs.push(createCollectionListener('vaultGoals', 'vaultGoals'));

    return () => unsubs.forEach(fn => fn());
  }, [user]);

  // Visual Triggers
  const triggerCelebration = useCallback((message, type = 'blue') => {
    setState(prev => ({ ...prev, celebration: { message, type } }));
  }, []);

  const triggerScreenShake = useCallback(() => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 400);
  }, []);

  // ─── Helpers for Distributing Vault Tax ──────────────────────────────────────
  function autoDistribute(goals, amount) {
    const remaining = goals
      .filter(g => !g.isAchieved)
      .sort((a, b) => a.priority - b.priority);

    if (remaining.length === 0) return goals;

    const target = { ...remaining[0] };
    const idx = goals.findIndex(g => g.id === target.id);
    const newCurrent = target.currentGold + amount;

    if (newCurrent >= target.targetGold) {
      const overflow = newCurrent - target.targetGold;
      goals[idx] = { ...target, currentGold: target.targetGold, isAchieved: true };
      goals._celebrateId = target.id;
      if (overflow > 0) {
        goals = autoDistribute(goals, overflow);
      }
    } else {
      goals[idx] = { ...target, currentGold: newCurrent };
    }
    return goals;
  }

  function distributeToGoal(goals, goalId, amount) {
    return goals.map(g => {
      if (g.id !== goalId) return g;
      const newCurrent = g.currentGold + amount;
      if (newCurrent >= g.targetGold) {
        const overflow = newCurrent - g.targetGold;
        return { ...g, currentGold: g.targetGold, isAchieved: true, _overflow: overflow };
      }
      return { ...g, currentGold: newCurrent };
    });
  }

  // ─── Core Financial Engine ──────────────────────────────────────────────────
  const routeTaxToVault = useCallback(async (amount, targetGoalId = null) => {
    if (!user) return;
    const batch = writeBatch(db);
    const currentStats = state.playerStats;
    let goals = state.vaultGoals.map(g => ({ ...g }));

    if (targetGoalId !== null) {
      goals = distributeToGoal(goals, targetGoalId, amount);
    } else {
      goals = autoDistribute(goals, amount);
    }

    const newStats = {
      ...currentStats,
      gold: currentStats.gold - amount,
      sbiSavingsMandate: currentStats.sbiSavingsMandate + amount,
    };

    if (currentStats.goldCap > 0) {
      newStats.goldCap = Math.max(0, currentStats.goldCap - amount);
    }

    batch.update(doc(db, 'users', user.uid), {
      playerStats: newStats
    });

    goals.forEach(g => {
      batch.set(doc(db, `users/${user.uid}/vaultGoals`, g.id.toString()), g);
    });

    await batch.commit();

    if (goals._celebrateId) {
      triggerCelebration('⚡ VAULT GOAL ACHIEVED!', 'gold');
    }
  }, [user, state.playerStats, state.vaultGoals, triggerCelebration]);

  const voluntaryDeposit = useCallback(async (goalId, amount) => {
    if (!user) return;
    if (state.playerStats.gold < amount) return;

    const batch = writeBatch(db);
    let goals = state.vaultGoals.map(g => ({ ...g }));
    let newCurrent = (goals.find(g => g.id === goalId)?.currentGold || 0) + amount;
    let celebrated = false;

    goals = goals.map(g => {
      if (g.id !== goalId) return g;
      if (newCurrent >= g.targetGold) {
        celebrated = true;
        return { ...g, currentGold: g.targetGold, isAchieved: true };
      }
      return { ...g, currentGold: newCurrent };
    });

    const newStats = {
      ...state.playerStats,
      gold: state.playerStats.gold - amount,
      sbiSavingsMandate: state.playerStats.sbiSavingsMandate + amount,
    };

    if (state.playerStats.goldCap > 0) {
      newStats.goldCap = Math.max(0, state.playerStats.goldCap - amount);
    }

    batch.update(doc(db, 'users', user.uid), {
      playerStats: newStats
    });

    goals.forEach(g => {
      batch.set(doc(db, `users/${user.uid}/vaultGoals`, g.id.toString()), g);
    });

    await batch.commit();

    if (celebrated) {
      triggerCelebration('⚡ VAULT GOAL ACHIEVED!', 'gold');
    }
  }, [user, state.playerStats, state.vaultGoals, triggerCelebration]);

  // ─── Master Task Actions ─────────────────────────────────────────────────────
  const resolveTask = useCallback(async (taskId, dateString, status) => {
    if (!user) return;
    const task = state.masterTasks.find(t => t.id === taskId);
    if (!task) return;

    const batch = writeBatch(db);
    const multiplier = state.playerStats.burnoutDebuff ? 0.5 : 1;
    const newStats = { ...state.playerStats };

    if (status === 'completed') {
      const goldGain = Number((task.goldReward * multiplier).toFixed(1));
      let nextGold = newStats.gold + goldGain;
      
      if (newStats.goldCap > 0 && nextGold > newStats.goldCap) {
        nextGold = newStats.goldCap;
      }
      
      newStats.gold = Number(nextGold.toFixed(1));
      Object.entries(task.statReward || {}).forEach(([stat, val]) => {
        newStats[stat] = Number(((newStats[stat] || 0) + val * multiplier).toFixed(1));
      });
      
      if (task.hpReward) {
        newStats.hp = Number(Math.min(100, newStats.hp + task.hpReward * multiplier).toFixed(1));
      }

      if (newStats.VIT >= 30 && newStats.hp >= 50) {
        newStats.burnoutDebuff = false;
      }
    } else if (status === 'failed') {
      const penalty = task.hpPenalty || 20;
      newStats.hp = Number(Math.max(0, newStats.hp - penalty).toFixed(1));
      if (newStats.hp < 50 && !newStats.burnoutDebuff) {
        newStats.burnoutDebuff = true;
        triggerCelebration('💀 BURNOUT DEBUFF ACTIVATED!', 'red');
      }
    }

    const newTaskData = {
      ...task,
      history: [...(task.history || []), { date: dateString, status }]
    };

    batch.update(doc(db, 'users', user.uid), { playerStats: newStats });
    batch.set(doc(db, `users/${user.uid}/masterTasks`, taskId.toString()), newTaskData);
    
    await batch.commit();
  }, [user, state.playerStats, state.masterTasks, triggerCelebration]);

  const undoTask = useCallback(async (taskId, dateString) => {
    if (!user) return;
    const task = state.masterTasks.find(t => t.id === taskId);
    if (!task || !task.history) return;

    // Find the last entry for this date
    const history = [...task.history];
    const logIndex = history.map((h, i) => ({ ...h, i })).filter(h => h.date === dateString).pop()?.i;
    
    if (logIndex === undefined) return;
    const [removedLog] = history.splice(logIndex, 1);
    
    const multiplier = state.playerStats.burnoutDebuff ? 0.5 : 1;
    const newStats = { ...state.playerStats };

    if (removedLog.status === 'completed') {
      const goldGain = Number((task.goldReward * multiplier).toFixed(1));
      newStats.gold = Number(Math.max(0, newStats.gold - goldGain).toFixed(1));
      
      Object.entries(task.statReward || {}).forEach(([stat, val]) => {
        newStats[stat] = Number(Math.max(0, (newStats[stat] || 0) - val * multiplier).toFixed(1));
      });
      
      if (task.hpReward) {
        newStats.hp = Number(Math.max(0, newStats.hp - task.hpReward * multiplier).toFixed(1));
      }
    } else if (removedLog.status === 'failed') {
      const penalty = task.hpPenalty || 20;
      newStats.hp = Number(Math.min(100, newStats.hp + penalty).toFixed(1));
    }

    const newTaskData = { ...task, history };
    const batch = writeBatch(db);
    batch.update(doc(db, 'users', user.uid), { playerStats: newStats });
    batch.set(doc(db, `users/${user.uid}/masterTasks`, taskId.toString()), newTaskData);
    await batch.commit();
  }, [user, state.masterTasks, state.playerStats]);

  const addMasterTask = useCallback(async (task) => {
    if (!user) return;
    const id = Date.now().toString();
    await setDoc(doc(db, `users/${user.uid}/masterTasks`, id), { ...task, id: Number(id), history: [] });
  }, [user]);

  const editMasterTask = useCallback(async (id, updates) => {
    if (!user) return;
    await updateDoc(doc(db, `users/${user.uid}/masterTasks`, id.toString()), updates);
  }, [user]);

  const deleteMasterTask = useCallback(async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, `users/${user.uid}/masterTasks`, id.toString()));
  }, [user]);

  const triggerPenalty = useCallback(async (amount) => {
    if (!user) return;
    await routeTaxToVault(amount); // This will handle gold & mandate via batch
    const newHP = Number(Math.max(0, state.playerStats.hp - (amount / 20)).toFixed(1));
    await updateDoc(doc(db, 'users', user.uid), { 'playerStats.hp': newHP });
  }, [user, routeTaxToVault, state.playerStats]);

  // ─── Skill Book Actions ──────────────────────────────────────────────────────
  const consumeSkillBook = useCallback(async (id) => {
    if (!user) return;
    const book = state.skillBooks.find(b => b.id === id);
    if (!book || book.isConsumed) return;

    const batch = writeBatch(db);
    batch.update(doc(db, 'users', user.uid), { 'playerStats.INT': state.playerStats.INT + 20 });
    batch.update(doc(db, `users/${user.uid}/skillBooks`, id.toString()), { isConsumed: true });
    
    await batch.commit();
    triggerCelebration('📖 SKILL MASTERED! +20 INT', 'blue');
  }, [user, state.skillBooks, state.playerStats, triggerCelebration]);

  const addSkillBook = useCallback(async (book) => {
    if (!user) return;
    const id = Date.now().toString();
    await setDoc(doc(db, `users/${user.uid}/skillBooks`, id), { ...book, id: Number(id), isConsumed: false });
  }, [user]);

  const deleteSkillBook = useCallback(async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, `users/${user.uid}/skillBooks`, id.toString()));
  }, [user]);

  // ─── Dungeon Actions ─────────────────────────────────────────────────────────
  const completeDungeon = useCallback(async (minutes) => {
    if (!user) return;
    const intGain = Number((minutes / 10).toFixed(1));
    const goldGain = minutes * 2;
    
    let nextGold = state.playerStats.gold + goldGain;
    if (state.playerStats.goldCap > 0 && nextGold > state.playerStats.goldCap) {
      nextGold = state.playerStats.goldCap;
    }

    await updateDoc(doc(db, 'users', user.uid), {
      'playerStats.INT': Number((state.playerStats.INT + intGain).toFixed(1)),
      'playerStats.gold': Number(nextGold.toFixed(1)),
    });
    triggerCelebration(`⚔️ DUNGEON CLEARED! +${intGain} INT +${goldGain}G`, 'blue');
  }, [user, state.playerStats, triggerCelebration]);

  // ─── Shop Actions ────────────────────────────────────────────────────────────
  const purchaseItem = useCallback(async (itemId) => {
    if (!user) return;
    const item = state.shopItems.find(i => i.id === itemId);
    if (!item || state.playerStats.gold <= 0) return;

    const totalCost = item.isLuxury ? item.baseCost * 2 : item.baseCost;
    if (state.playerStats.gold < totalCost) return;

    if (item.isHealing) {
      const batch = writeBatch(db);
      batch.update(doc(db, 'users', user.uid), {
        'playerStats.gold': state.playerStats.gold - item.baseCost,
        'playerStats.hp': Math.min(100, state.playerStats.hp + (item.hpAmount || 0))
      });
      await batch.commit();
      triggerCelebration(`🧪 POTION CONSUMED! +${item.hpAmount} HP`, 'green');
      return;
    }

    const batch = writeBatch(db);
    let newGold = state.playerStats.gold;
    let newMandate = state.playerStats.sbiSavingsMandate;
    let newVaultGoals = state.vaultGoals.map(g => ({ ...g }));

    if (item.isLuxury) {
      newGold -= item.baseCost; // sunk cost
      newGold -= item.baseCost; // vault match cost
      newMandate += item.baseCost;
      newVaultGoals = autoDistribute(newVaultGoals, item.baseCost);
    } else {
      newGold -= item.baseCost;
      newMandate += item.baseCost;
      newVaultGoals = autoDistribute(newVaultGoals, item.baseCost);
    }

    const newStatsForDoc = { ...state.playerStats, gold: newGold, sbiSavingsMandate: newMandate };
    
    if (state.playerStats.goldCap > 0) {
      const spentTotal = state.playerStats.gold - newGold;
      newStatsForDoc.goldCap = Math.max(0, state.playerStats.goldCap - spentTotal);
    }

    batch.update(doc(db, 'users', user.uid), {
      playerStats: newStatsForDoc
    });

    newVaultGoals.forEach(g => {
      batch.set(doc(db, `users/${user.uid}/vaultGoals`, g.id.toString()), g);
    });

    await batch.commit();
  }, [user, state.shopItems, state.playerStats, state.vaultGoals]);

  const addShopItem = useCallback(async (item) => {
    if (!user) return;
    const id = Date.now().toString();
    await setDoc(doc(db, `users/${user.uid}/shopItems`, id), { ...item, id: Number(id) });
  }, [user]);

  const deleteShopItem = useCallback(async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, `users/${user.uid}/shopItems`, id.toString()));
  }, [user]);

  // ─── Milestone Actions ───────────────────────────────────────────────────────
  const completeMilestone = useCallback(async (id) => {
    if (!user) return;
    const milestone = state.jobQuests.find(j => j.id === id);
    if (!milestone || milestone.status !== 'Active') return;

    const newStats = { ...state.playerStats };
    Object.entries(milestone.statReward).forEach(([stat, val]) => {
      newStats[stat] = Number(((newStats[stat] || 0) + val).toFixed(1));
    });
    const goldGain = 500;
    let nextGold = newStats.gold + goldGain;
    if (newStats.goldCap > 0 && nextGold > newStats.goldCap) {
      nextGold = newStats.goldCap;
    }
    newStats.gold = Number(nextGold.toFixed(1));

    const batch = writeBatch(db);
    batch.update(doc(db, 'users', user.uid), { playerStats: newStats });
    batch.update(doc(db, `users/${user.uid}/jobQuests`, id.toString()), { status: 'Completed' });
    
    await batch.commit();

    const rewardStr = Object.entries(milestone.statReward).map(([s, v]) => `+${v} ${s}`).join(' ');
    triggerCelebration(`🏆 BOSS DEFEATED! ${rewardStr} +500G`, 'gold');
  }, [user, state.jobQuests, state.playerStats, triggerCelebration]);

  const addMilestone = useCallback(async (ms) => {
    if (!user) return;
    const id = Date.now().toString();
    await setDoc(doc(db, `users/${user.uid}/jobQuests`, id), { ...ms, id: Number(id), status: 'Active' });
  }, [user]);

  const editMilestone = useCallback(async (id, updates) => {
    if (!user) return;
    await updateDoc(doc(db, `users/${user.uid}/jobQuests`, id.toString()), updates);
  }, [user]);

  const deleteMilestone = useCallback(async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, `users/${user.uid}/jobQuests`, id.toString()));
  }, [user]);

  // ─── Vault Goal Actions ──────────────────────────────────────────────────────
  const addVaultGoal = useCallback(async (goal) => {
    if (!user) return;
    const id = Date.now().toString();
    await setDoc(doc(db, `users/${user.uid}/vaultGoals`, id), { ...goal, id: Number(id), currentGold: 0, isAchieved: false });
  }, [user]);

  const editVaultGoal = useCallback(async (id, updates) => {
    if (!user) return;
    await updateDoc(doc(db, `users/${user.uid}/vaultGoals`, id.toString()), updates);
  }, [user]);

  const deleteVaultGoal = useCallback(async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, `users/${user.uid}/vaultGoals`, id.toString()));
  }, [user]);

  // ─── HP & Burnout ────────────────────────────────────────────────────────────
  const updateHP = useCallback(async (delta) => {
    if (!user) return;
    const newHP = Number(Math.max(0, Math.min(100, state.playerStats.hp + delta)).toFixed(1));
    const burnout = newHP < 50;

    await updateDoc(doc(db, 'users', user.uid), {
      'playerStats.hp': newHP,
      'playerStats.burnoutDebuff': burnout
    });

    if (burnout && !state.playerStats.burnoutDebuff) {
      triggerCelebration('💀 BURNOUT DEBUFF ACTIVATED!', 'red');
    }
  }, [user, state.playerStats, triggerCelebration]);

  const evaluatePerfectDay = useCallback(async () => {
    if (!user) return;
    const { dayEndTime, lastPerfectDayCheck, hp } = state.playerStats;
    const systemNow = getSystemNow(dayEndTime);
    const todayStr = formatDateStr(systemNow);
    
    if (lastPerfectDayCheck === todayStr) return;

    // Get yesterday's date string in system time
    const systemYesterday = new Date(systemNow);
    systemYesterday.setDate(systemYesterday.getDate() - 1);
    const yesterdayStr = formatDateStr(systemYesterday);

    // Identify tasks considered "pending" for yesterday (Daily or Once-Deadline-Yesterday)
    const dailyMissions = state.masterTasks.filter(t => {
      const isDaily = t.recurrenceType === 'daily';
      const isOnceYesterday = t.recurrenceType === 'once' && t.recurrenceValue === yesterdayStr;
      return isDaily || isOnceYesterday;
    });
    if (dailyMissions.length === 0) {
      await updateDoc(doc(db, 'users', user.uid), { 'playerStats.lastPerfectDayCheck': todayStr });
      return;
    }

    // Check if 100% were completed yesterday
    const allDone = dailyMissions.every(task => {
      const history = task.history || [];
      return history.some(h => h.date === yesterdayStr && h.status === 'completed');
    });

    const updates = { 'playerStats.lastPerfectDayCheck': todayStr };
    if (allDone) {
      updates['playerStats.hp'] = Number(Math.min(100, hp + 15).toFixed(1));
      updates['playerStats.perfectDayAchieved'] = true;
      triggerCelebration('🌟 PERFECT DAY BUFF: +15 HP!', 'gold');
    } else {
       updates['playerStats.perfectDayAchieved'] = false;
    }

    await updateDoc(doc(db, 'users', user.uid), updates);
  }, [user, state.playerStats, state.masterTasks, triggerCelebration]);

  const setDayEndTime = useCallback(async (time) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), { 'playerStats.dayEndTime': time });
  }, [user]);

  // Run perfect day check on mount/user change
  useEffect(() => {
    if (user && state.masterTasks.length > 0) {
      evaluatePerfectDay();
    }
  }, [user, state.masterTasks.length]);

  const dismissNotification = useCallback(async () => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), { 'playerStats.perfectDayAchieved': false });
  }, [user]);

  // ─── System Overrides ────────────────────────────────────────────────────────
  const setPlayerName = useCallback(async (newName) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), { 'playerStats.name': newName });
  }, [user]);

  const setManualGold = useCallback(async (amount) => {
    if (!user) return;
    const updates = { 'playerStats.gold': amount };
    // Optionally also set cap to accommodate if cap is enable but lower
    if (state.playerStats.goldCap > 0 && amount > state.playerStats.goldCap) {
      updates['playerStats.goldCap'] = amount;
    }
    await updateDoc(doc(db, 'users', user.uid), updates);
  }, [user, state.playerStats.goldCap]);

  const setGoldCap = useCallback(async (amount) => {
    if (!user) return;
    const updates = { 'playerStats.goldCap': amount };
    // If setting a cap that is lower than current gold, clamp current gold
    if (amount > 0 && state.playerStats.gold > amount) {
      updates['playerStats.gold'] = amount;
    }
    await updateDoc(doc(db, 'users', user.uid), updates);
  }, [user, state.playerStats.gold]);

  const executeProtocolZero = useCallback(async () => {
    if (!user) return;
    const batch = writeBatch(db);
    
    // We cannot easily delete all subcollection documents without querying them all,
    // so we wipe them by querying and deleting in the batch.
    const collections = ['masterTasks', 'shopItems', 'skillBooks', 'jobQuests', 'vaultGoals'];
    
    // Warning: To delete fully we'd need getDocs but since state is synced, we can use state arrays!
    state.masterTasks.forEach(item => batch.delete(doc(db, `users/${user.uid}/masterTasks`, item.id.toString())));
    state.shopItems.forEach(item => batch.delete(doc(db, `users/${user.uid}/shopItems`, item.id.toString())));
    state.skillBooks.forEach(item => batch.delete(doc(db, `users/${user.uid}/skillBooks`, item.id.toString())));
    state.jobQuests.forEach(item => batch.delete(doc(db, `users/${user.uid}/jobQuests`, item.id.toString())));
    state.vaultGoals.forEach(item => batch.delete(doc(db, `users/${user.uid}/vaultGoals`, item.id.toString())));

    batch.set(doc(db, 'users', user.uid), { playerStats: DEFAULT_STATE.playerStats });
    await batch.commit();

    triggerCelebration('⚠️ PROTOCOL ZERO EXECUTED. SYSTEM RESET.', 'red');
  }, [user, state, triggerCelebration]);

  const logout = useCallback(() => {
    signOut(auth);
  }, []);

  // ─── Render Wrapping ─────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="fixed inset-0 bg-[#0B0C10] flex items-center justify-center font-orbitron text-[00f0ff] uppercase tracking-widest text-sm z-[9999]">
        Initializing System...
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const value = {
    ...state,
    routeTaxToVault,
    voluntaryDeposit,
    resolveTask,
    undoTask,
    addMasterTask,
    editMasterTask,
    deleteMasterTask,
    triggerPenalty,
    consumeSkillBook,
    addSkillBook,
    deleteSkillBook,
    completeDungeon,
    purchaseItem,
    addShopItem,
    deleteShopItem,
    completeMilestone,
    addMilestone,
    editMilestone,
    deleteMilestone,
    addVaultGoal,
    editVaultGoal,
    deleteVaultGoal,
    updateHP,
    setManualGold,
    setGoldCap,
    setPlayerName,
    evaluatePerfectDay,
    dismissNotification,
    logout,
    executeProtocolZero,
    triggerCelebration,
    triggerScreenShake,
    setDayEndTime,
    isShaking,
    setState, // Expose raw setState for optimistic UI or edge cases if needed
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  return ctx;
}
