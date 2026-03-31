import { useState } from 'react';
import { useGame } from '../context/GameContext';
import Modal from '../components/Modal';
import { motion, AnimatePresence } from 'framer-motion';
import Calendar from 'react-calendar';
import { format } from 'date-fns';
import { isTaskActiveOnDate, isTaskPendingForDate, formatDateStr, getTaskProgress } from '../utils/schedule';
import PageTransition from '../components/PageTransition';

const STAT_COLORS = { INT: '#00f0ff', STR: '#ff003c', VIT: '#00ff88', PER: '#bf5fff' };
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const QuestCard = ({ task, selectedDate, onComplete, onFail, onUndo, onEdit, onDelete, isSecondary = false, isDone = false }) => (
  <motion.div
    key={task.id}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, x: 100, scale: 0.98 }}
    transition={{ duration: 0.3 }}
    className="card"
    style={{
      padding: isSecondary ? '16px' : '20px',
      borderColor: isSecondary ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 240, 255, 0.15)',
      background: isSecondary 
        ? 'rgba(13, 14, 20, 0.7)' 
        : 'linear-gradient(90deg, #0d0e14, #111318)',
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
      
      {/* Left: Info */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <span style={{
            background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.3)', borderRadius: '2px',
            padding: '2px 6px', fontSize: '9px', fontWeight: 700, color: '#00f0ff', fontFamily: 'Share Tech Mono, monospace', textTransform: 'uppercase'
          }}>
            {task.recurrenceType}
          </span>
          <div style={{ fontSize: isSecondary ? '16px' : '17px', fontWeight: 700, color: '#e8eaf0' }}>
            {task.title}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span className="stat-badge tag-gold">+{task.goldReward}G</span>
          {task.hpReward > 0 && <span className="stat-badge tag-vit" style={{ background: 'rgba(0,255,136,0.15)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.3)' }}>+{task.hpReward} HP</span>}
          {Object.entries(task.statReward || {}).map(([stat, val]) => (
            <span key={stat} className={`stat-badge tag-${stat.toLowerCase()}`}>
              +{val} {stat}
            </span>
          ))}
          <span style={{ fontSize: '10px', color: '#ff003c', fontFamily: 'Share Tech Mono, monospace', background: 'rgba(255,0,60,0.1)', padding: '2px 6px', borderRadius: '2px', border: '1px solid rgba(255,0,60,0.3)' }}>
            FAIL: -{task.hpPenalty || 20} HP
          </span>
        </div>

        {/* Progress Bar */}
        {(() => {
          const progress = getTaskProgress(task, selectedDate);
          if (progress.type === 'percent') {
            return (
              <div style={{ marginTop: '16px', maxWidth: '300px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#8892a0', marginBottom: '4px', fontFamily: 'Share Tech Mono, monospace', letterSpacing: '0.1em' }}>
                  <span>PROTOCOL PROGRESS</span>
                  <span style={{ color: '#00f0ff' }}>{progress.current} / {progress.total}</span>
                </div>
                <div style={{ height: '3px', background: 'rgba(255,255,255,0.05)', borderRadius: '1px', overflow: 'hidden' }}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (progress.current / progress.total) * 100)}%` }}
                    style={{ height: '100%', background: '#00f0ff', boxShadow: '0 0 10px rgba(0,240,255,0.5)' }}
                  />
                </div>
              </div>
            );
          } else {
            return (
              <div style={{ marginTop: '12px', fontSize: '10px', color: '#00f0ff', fontFamily: 'Share Tech Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                ⚡ LIFETIME SUCCESSES: {progress.current}
              </div>
            );
          }
        })()}

        {task.description && (
          <div style={{ fontSize: '13px', color: '#8892a0', marginTop: '12px', lineHeight: 1.4, borderLeft: '2px solid rgba(0,240,255,0.3)', paddingLeft: '8px' }}>
            {task.description}
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {isDone ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
             <button
              className="btn btn-blue"
              style={{
                background: 'rgba(0,240,255,0.1)', color: '#00f0ff', border: '1px solid #00f0ff', padding: '8px 16px', fontSize: '12px',
              }}
              onClick={() => onUndo(task)}
            >
              ↩ UNDO action
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              className="btn btn-solid-blue"
              style={{
                background: '#00ff88', color: '#000', padding: '8px 16px', fontSize: '12px',
                boxShadow: '0 0 10px rgba(0,255,136,0.3)'
              }}
              onClick={(e) => onComplete(e, task)}
            >
              ✔ COMPLETE
            </button>
            <button
              className="btn"
              style={{
                background: 'rgba(255,0,60,0.1)', color: '#ff003c', border: '1px solid #ff003c', padding: '6px 16px', fontSize: '11px',
              }}
              onClick={() => onFail(task)}
            >
              ✖ FAIL
            </button>
          </div>
        )}
        
        {/* Secondary Actions (Edit/Delete) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderLeft: '1px solid #1e2030', paddingLeft: '8px', marginLeft: '4px' }}>
          <button className="btn btn-blue" style={{ flex: 1, padding: '4px 8px', fontSize: '10px' }} onClick={() => onEdit(task)}>EDIT</button>
          <button className="btn btn-red" style={{ flex: 1, padding: '4px 8px', fontSize: '10px' }} onClick={() => onDelete(task.id)}>DEL</button>
        </div>
      </div>

    </div>
  </motion.div>
);

export default function Quests() {
  const {
    masterTasks, playerStats, resolveTask, undoTask,
    addMasterTask, editMasterTask, deleteMasterTask, triggerPenalty, triggerScreenShake,
  } = useGame();

  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const [penaltyOpen, setPenaltyOpen] = useState(false);
  const [penaltyAmount, setPenaltyAmount] = useState('');
  const [penaltyMsg, setPenaltyMsg] = useState('');

  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [floatingTexts, setFloatingTexts] = useState([]);

  const [formData, setFormData] = useState({
    title: '', description: '', goldReward: 50, hpPenalty: 20, hpReward: 0,
    INT: 0, STR: 0, VIT: 0, PER: 0,
    recurrenceType: 'once',
    recurrenceValue: formatDateStr(new Date()),
    frequency: 1,
  });
  const [newYearlyDate, setNewYearlyDate] = useState('01-01');

  const { burnoutDebuff } = playerStats;
  const selectedDateStr = formatDateStr(selectedDate);
  const todayStr = formatDateStr(new Date());
  const isToday = selectedDateStr === todayStr;

  // Split tasks into Active and Done
  const allActiveTasks = (masterTasks || []).filter(task => isTaskActiveOnDate(task, selectedDate));
  const doneTasks = (masterTasks || []).filter(task => {
    // A task is "done" if it has any logs today, and is either finished (not active) OR we just want to see it in log
    // User asked for "tasks that are done" in a different section.
    // Let's show tasks that have at least one log entry for selected date.
    return (task.history || []).some(h => h.date === selectedDateStr);
  });

  const pendingTasks = allActiveTasks.filter(task => isTaskPendingForDate(task, selectedDate));
  const otherActiveTasks = allActiveTasks.filter(task => !isTaskPendingForDate(task, selectedDate));

  // Group other active tasks by recurrenceType
  const groupedOtherTasks = otherActiveTasks.reduce((acc, task) => {
    const type = task.recurrenceType || 'other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(task);
    return acc;
  }, {});

  const RECURRENCE_LABELS = {
    weekly: 'WEEKLY MISSIONS',
    weekly_count: 'WEEKLY QUOTA',
    monthly: 'MONTHLY MISSIONS',
    yearly: 'YEARLY MISSIONS',
    continuous: 'CONTINUOUS TARGETS',
    other: 'OTHER PROTOCOLS'
  };

  const activeTasks = isToday ? pendingTasks : allActiveTasks;

  // Count how many tasks total were done today (for the top counter)
  const completedTodayCount = (masterTasks || []).reduce((acc, t) => {
    return acc + (t.history || []).filter(h => h.date === todayStr && h.status === 'completed').length;
  }, 0);

  const handleTaskComplete = (e, task) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top;
    
    let floatStr = `+${task.goldReward}G`;
    if (task.hpReward) floatStr += ` / +${task.hpReward} HP`;
    Object.entries(task.statReward || {}).forEach(([stat, val]) => {
      floatStr += ` / +${val} ${stat}`;
    });

    const newFloat = { id: Date.now() + Math.random(), text: floatStr, x, y };
    setFloatingTexts(prev => [...prev, newFloat]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(f => f.id !== newFloat.id));
    }, 1200);

    resolveTask(task.id, formatDateStr(selectedDate), 'completed');
  };

  const handleTaskFail = (task) => {
    triggerScreenShake();
    resolveTask(task.id, formatDateStr(selectedDate), 'failed');
  };

  const handleTaskUndo = (task) => {
    undoTask(task.id, formatDateStr(selectedDate));
  };

  function openAdd() {
    setFormData({
      title: '', description: '', goldReward: 50, hpPenalty: 20, hpReward: 0,
      INT: 0, STR: 0, VIT: 0, PER: 0,
      recurrenceType: 'once', recurrenceValue: formatDateStr(selectedDate),
      frequency: 1,
    });
    setAddOpen(true);
  }

  function openEdit(task) {
    const sr = task.statReward || {};
    setFormData({
      title: task.title,
      description: task.description || '',
      goldReward: task.goldReward || 0,
      hpPenalty: task.hpPenalty || 20,
      hpReward: task.hpReward || 0,
      INT: sr.INT || 0,
      STR: sr.STR || 0,
      VIT: sr.VIT || 0,
      PER: sr.PER || 0,
      recurrenceType: task.recurrenceType || 'daily',
      recurrenceValue: task.recurrenceValue || 1,
      frequency: task.frequency || (['daily', 'weekly_count'].includes(task.recurrenceType) ? Number(task.recurrenceValue) || 1 : 1),
    });
    setEditTarget(task);
  }

  function handleFormSubmit() {
    if (!formData.title.trim()) return;

    const statReward = {};
    if (formData.INT > 0) statReward.INT = Number(formData.INT);
    if (formData.STR > 0) statReward.STR = Number(formData.STR);
    if (formData.VIT > 0) statReward.VIT = Number(formData.VIT);
    if (formData.PER > 0) statReward.PER = Number(formData.PER);

    const taskData = {
      title: formData.title,
      description: formData.description,
      goldReward: Number(formData.goldReward),
      hpPenalty: Number(formData.hpPenalty),
      hpReward: Number(formData.hpReward),
      statReward,
      recurrenceType: formData.recurrenceType,
      recurrenceValue: formData.recurrenceValue,
      frequency: Number(formData.frequency),
    };

    if (editTarget) {
      editMasterTask(editTarget.id, taskData);
      setEditTarget(null);
    } else {
      addMasterTask(taskData);
      setAddOpen(false);
    }
  }

  function toggleWeeklyDay(dayIndex) {
    const curr = Array.isArray(formData.recurrenceValue) ? formData.recurrenceValue : [];
    if (curr.includes(dayIndex)) {
      setFormData({ ...formData, recurrenceValue: curr.filter(d => d !== dayIndex) });
    } else {
      setFormData({ ...formData, recurrenceValue: [...curr, dayIndex].sort() });
    }
  }

  function handlePenalty() {
    const amt = Number(penaltyAmount);
    if (isNaN(amt) || amt <= 0) { setPenaltyMsg('Enter a valid amount.'); return; }
    if (playerStats.gold < amt) { setPenaltyMsg('Insufficient Gold for penalty.'); return; }
    triggerScreenShake();
    triggerPenalty(amt);
    setPenaltyOpen(false);
    setPenaltyAmount('');
    setPenaltyMsg('');
  }

  // Custom UI for handling Recurrence Value input based on Type
  const renderRecurrenceInput = () => {
    switch (formData.recurrenceType) {
      case 'once':
        return (
          <div>
            <label style={{ fontSize: '10px', color: '#8892a0', display: 'block', marginBottom: '4px', fontFamily: 'Share Tech Mono, monospace' }}>TARGET DATE (YYYY-MM-DD)</label>
            <input className="input-field" type="text" placeholder="e.g. 2024-12-25" value={formData.recurrenceValue} onChange={e => setFormData({ ...formData, recurrenceValue: e.target.value })} />
          </div>
        );
      case 'daily':
        return (
          <div>
            <label style={{ fontSize: '10px', color: '#8892a0', display: 'block', marginBottom: '4px', fontFamily: 'Share Tech Mono, monospace' }}>FREQUENCY (TIMES PER DAY)</label>
            <input className="input-field" type="number" min="1" value={formData.recurrenceValue} onChange={e => setFormData({ ...formData, recurrenceValue: Number(e.target.value) })} />
          </div>
        );
      case 'weekly':
        return (
          <div>
            <label style={{ fontSize: '10px', color: '#8892a0', display: 'block', marginBottom: '4px', fontFamily: 'Share Tech Mono, monospace' }}>ACTIVE DAYS</label>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {WEEKDAYS.map((day, idx) => {
                const isActive = Array.isArray(formData.recurrenceValue) && formData.recurrenceValue.includes(idx);
                return (
                  <button
                    key={day}
                    onClick={() => toggleWeeklyDay(idx)}
                    className="font-mono"
                    style={{
                      flex: 1, minWidth: '36px', padding: '6px 0', fontSize: '12px',
                      background: isActive ? 'rgba(0, 240, 255, 0.15)' : '#0a0b10',
                      border: `1px solid ${isActive ? '#00f0ff' : '#1e2030'}`,
                      color: isActive ? '#00f0ff' : '#8892a0',
                      borderRadius: '3px', cursor: 'pointer'
                    }}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        );
      case 'weekly_count':
        return (
          <div>
            <label style={{ fontSize: '10px', color: '#8892a0', display: 'block', marginBottom: '4px', fontFamily: 'Share Tech Mono, monospace' }}>TIMES PER WEEK (QUOTA)</label>
            <input className="input-field" type="number" min="1" max="7" value={formData.recurrenceValue} onChange={e => setFormData({ ...formData, recurrenceValue: Number(e.target.value) })} />
          </div>
        );
      case 'monthly':
        return (
          <div>
            <label style={{ fontSize: '10px', color: '#8892a0', display: 'block', marginBottom: '4px', fontFamily: 'Share Tech Mono, monospace' }}>DATE OF MONTH (1-31)</label>
            <input className="input-field" type="number" min="1" max="31" value={formData.recurrenceValue} onChange={e => setFormData({ ...formData, recurrenceValue: Number(e.target.value) })} />
          </div>
        );
      case 'yearly':
        return (
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: '10px', color: '#8892a0', display: 'block', marginBottom: '4px', fontFamily: 'Share Tech Mono, monospace' }}>TARGET DATES (MM-DD)</label>
            <div style={{ fontSize: '9px', color: '#3a3f52', marginBottom: '8px', fontFamily: 'Share Tech Mono, monospace', textTransform: 'uppercase' }}>
              TIP: Leave dates empty to enable <span style={{ color: '#00f0ff' }}>YEARLY QUOTA</span> (Total successes across the year)
            </div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input 
                className="input-field" 
                type="text" 
                placeholder="MM-DD (e.g. 10-31)" 
                value={newYearlyDate} 
                onChange={e => setNewYearlyDate(e.target.value)} 
                style={{ flex: 1 }}
              />
              <button 
                className="btn btn-blue" 
                style={{ padding: '0 16px', fontSize: '18px' }}
                onClick={() => {
                  const current = Array.isArray(formData.recurrenceValue) ? formData.recurrenceValue : [formData.recurrenceValue].filter(Boolean);
                  if (!current.includes(newYearlyDate)) {
                    setFormData({ ...formData, recurrenceValue: [...current, newYearlyDate].sort() });
                  }
                }}
              >+</button>
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {(Array.isArray(formData.recurrenceValue) ? formData.recurrenceValue : [formData.recurrenceValue].filter(Boolean)).map(d => (
                <div key={d} style={{ 
                  background: 'rgba(0, 240, 255, 0.1)', border: '1px solid #00f0ff', borderRadius: '3px',
                  padding: '4px 8px', fontSize: '11px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                  {d}
                  <span 
                    style={{ cursor: 'pointer', color: '#ff003c', fontWeight: 'bold' }} 
                    onClick={() => setFormData({ ...formData, recurrenceValue: formData.recurrenceValue.filter(v => v !== d) })}
                  >×</span>
                </div>
              ))}
            </div>
          </div>
        );
      case 'continuous':
        return null;
      default:
        return null;
    }
  };

  const QuestForm = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <label style={{ fontSize: '11px', color: '#8892a0', fontFamily: 'Orbitron, monospace', letterSpacing: '0.15em', display: 'block', marginBottom: '6px' }}>TASK TITLE</label>
        <input className="input-field" value={formData.title} onChange={e => setFormData(f => ({ ...f, title: e.target.value }))} placeholder="Enter task logic..." />
      </div>
      <div>
        <label style={{ fontSize: '11px', color: '#8892a0', fontFamily: 'Orbitron, monospace', letterSpacing: '0.15em', display: 'block', marginBottom: '6px' }}>DESCRIPTION (OPTIONAL)</label>
        <textarea className="input-field" value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} placeholder="Enter quest details..." style={{ minHeight: '60px', resize: 'vertical' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={{ fontSize: '11px', color: '#8892a0', fontFamily: 'Orbitron, monospace', letterSpacing: '0.15em', display: 'block', marginBottom: '6px' }}>GOLD REWARD</label>
          <input className="input-field" type="number" min="0" step="0.1" value={formData.goldReward} onChange={e => setFormData(f => ({ ...f, goldReward: e.target.value }))} style={{ borderColor: 'rgba(255,215,0,0.3)' }} />
        </div>
        <div>
          <label style={{ fontSize: '11px', color: '#00ff88', fontFamily: 'Orbitron, monospace', letterSpacing: '0.15em', display: 'block', marginBottom: '6px' }}>HP RECOVERY</label>
          <input className="input-field" type="number" min="0" step="0.1" value={formData.hpReward} onChange={e => setFormData(f => ({ ...f, hpReward: e.target.value }))} style={{ borderColor: 'rgba(0,255,136,0.3)' }} />
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <label style={{ fontSize: '11px', color: '#ff003c', fontFamily: 'Orbitron, monospace', letterSpacing: '0.15em', display: 'block', marginBottom: '6px' }}>HP PENALTY</label>
          <input className="input-field" type="number" min="0" step="0.1" value={formData.hpPenalty} onChange={e => setFormData(f => ({ ...f, hpPenalty: e.target.value }))} style={{ borderColor: 'rgba(255,0,60,0.3)' }} />
        </div>
      </div>

      <div>
        <label style={{ fontSize: '11px', color: '#8892a0', fontFamily: 'Orbitron, monospace', letterSpacing: '0.15em', display: 'block', marginBottom: '8px' }}>STAT REWARDS &nbsp; <span style={{fontSize:'9px',color:'#3a3f52'}}>(LEAVE AS 0 TO SKIP)</span></label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
          {['INT', 'STR', 'VIT', 'PER'].map(stat => (
            <div key={stat}>
              <label style={{ fontSize: '10px', color: STAT_COLORS[stat], fontFamily: 'Share Tech Mono, monospace', display: 'block', marginBottom: '4px' }}>{stat}</label>
              <input className="input-field" type="number" min="0" step="0.1" value={formData[stat]} onChange={e => setFormData(f => ({ ...f, [stat]: e.target.value }))} style={{ padding: '6px 4px', textAlign: 'center' }} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#0d0e14', padding: '16px', borderRadius: '4px', border: '1px solid #1e2030' }}>
        <div style={{ fontSize: '11px', color: '#8892a0', fontFamily: 'Orbitron, monospace', letterSpacing: '0.15em', marginBottom: '12px' }}>SCHEDULING PROTOCOL</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '10px', color: '#8892a0', display: 'block', marginBottom: '4px', fontFamily: 'Share Tech Mono, monospace' }}>RECURRENCE TYPE</label>
            <select
              className="input-field"
              value={formData.recurrenceType}
              onChange={e => {
                const rt = e.target.value;
                let rv = 1;
                if (rt === 'weekly') rv = [];
                if (rt === 'yearly') rv = '01-01';
                if (rt === 'once') rv = formatDateStr(selectedDate);
                setFormData(f => ({ ...f, recurrenceType: rt, recurrenceValue: rv }));
              }}
            >
              <option value="once">Once only</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly (Days)</option>
              <option value="weekly_count">Weekly (Quota)</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="continuous">Continuous</option>
            </select>
          </div>
          {renderRecurrenceInput()}
        </div>

        {formData.recurrenceType !== 'continuous' && (
          <div style={{ marginTop: '16px', borderTop: '1px solid #1e2030', paddingTop: '16px' }}>
            <label style={{ fontSize: '10px', color: '#8892a0', display: 'block', marginBottom: '4px', fontFamily: 'Share Tech Mono, monospace' }}>
              PROTOCOL FREQUENCY (SUCCESSES PER CYCLE)
            </label>
            <input 
              className="input-field" 
              type="number" 
              min="1" 
              value={formData.frequency} 
              onChange={e => setFormData({ ...formData, frequency: e.target.value })} 
              placeholder="Times to complete..."
            />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        <button className="btn btn-solid-blue" style={{ flex: 1, padding: '12px' }} onClick={handleFormSubmit}>
          {editTarget ? 'SAVE LOGIC' : 'DEPLOY TASK'}
        </button>
        <button className="btn btn-red" onClick={() => { setAddOpen(false); setEditTarget(null); }}>CANCEL</button>
      </div>
    </div>
  );

  return (
    <PageTransition>
      <AnimatePresence>
        {floatingTexts.map(f => (
          <motion.div
            key={f.id}
            initial={{ opacity: 0, y: f.y, x: f.x - 50, scale: 0.8 }}
            animate={{ opacity: 1, y: f.y - 60, scale: 1.2 }}
            exit={{ opacity: 0, y: f.y - 100 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              position: 'fixed',
              pointerEvents: 'none',
              zIndex: 9999,
              color: '#00f0ff',
              fontWeight: 'bold',
              fontFamily: 'Orbitron, monospace',
              textShadow: '0 0 10px #00f0ff',
              fontSize: '18px'
            }}
          >
            {f.text}
          </motion.div>
        ))}
      </AnimatePresence>
      <div className="page-wrap">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <div className="font-orbitron" style={{ fontSize: '10px', color: '#8892a0', letterSpacing: '0.3em', marginBottom: '6px' }}>
            SCHEDULING ENGINE // CALENDAR PROTOCOL
          </div>
          <h1 className="font-orbitron" style={{ fontSize: '28px', fontWeight: 900, color: '#fff', margin: 0 }}>
            DYNAMIC <span style={{ color: '#00f0ff' }}>MISSIONS</span>
          </h1>
          <div style={{ fontSize: '13px', color: '#ffb300', marginTop: '6px', fontFamily: 'Share Tech Mono, monospace' }}>
            {completedTodayCount} MISSIONS ACCOMPLISHED TODAY
            {burnoutDebuff && <span style={{ color: '#ff003c', marginLeft: '12px' }}>⚠ BURNOUT: REWARDS×0.5</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-blue" onClick={openAdd} id="add-quest-btn">+ CREATE LOGIC</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8">
        
        {/* Left Column: Calendar & Manual Penalty */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              className="react-calendar-custom"
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              background: 'rgba(255,0,60,0.04)',
              border: '1px solid rgba(255,0,60,0.3)',
              borderRadius: '4px',
              padding: '24px',
            }}
          >
            <div className="font-orbitron" style={{ fontSize: '12px', color: '#ff003c', letterSpacing: '0.2em', marginBottom: '8px' }}>
              ⚠ MANUAL PENALTY
            </div>
            <div style={{ fontSize: '13px', color: '#8892a0', marginBottom: '16px' }}>
              Execute manual punishment. Routes Gold to vault directly.
            </div>
            <button
              id="trigger-penalty-btn"
              className="btn btn-solid-red"
              style={{ fontSize: '13px', padding: '10px 16px', width: '100%', letterSpacing: '0.15em' }}
              onClick={() => setPenaltyOpen(true)}
            >
              ⚡ TRIGGER PENALTY
            </button>
          </motion.div>
        </div>

        {/* Right Column: Task Board */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px', borderBottom: '1px solid #1e2030', paddingBottom: '12px' }}>
            <div className="font-orbitron" style={{ fontSize: '18px', fontWeight: 600, color: '#e8eaf0' }}>
              TARGET DATE: <span style={{ color: '#00f0ff' }}>{format(selectedDate, 'MMM do, yyyy')}</span>
            </div>
            <div style={{ fontSize: '13px', color: '#8892a0', fontFamily: 'Share Tech Mono, monospace' }}>
              {activeTasks.length} PENDING TARGETS
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <AnimatePresence>
              {activeTasks.length === 0 ? (
                <motion.div 
                  key="no-quests"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ color: '#3a3f52', fontSize: '14px', fontFamily: 'Share Tech Mono, monospace', padding: '40px 0', textAlign: 'center' }}
                >
                  No active targets designated for this date cycle.
                </motion.div>
              ) : (
                activeTasks.map((task) => (
                  <QuestCard
                    key={task.id}
                    task={task}
                    selectedDate={selectedDate}
                    onComplete={handleTaskComplete}
                    onFail={handleTaskFail}
                    onEdit={openEdit}
                    onDelete={deleteMasterTask}
                  />
                ))
              )}
            </AnimatePresence>

            {/* Grouped Other Active Tasks Sections (Today only) */}
            {isToday && Object.entries(groupedOtherTasks).map(([type, tasks]) => (
              <div key={type} style={{ marginTop: '24px' }}>
                <div style={{ 
                  fontSize: '11px', color: '#8892a0', fontFamily: 'Orbitron, monospace', letterSpacing: '0.2em', 
                  marginBottom: '12px', paddingLeft: '4px', borderLeft: '2px solid rgba(136,146,160,0.3)' 
                }}>
                  {RECURRENCE_LABELS[type] || 'OTHER QUESTS'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {tasks.map((task) => (
                    <QuestCard
                      key={task.id}
                      task={task}
                      selectedDate={selectedDate}
                      onComplete={handleTaskComplete}
                      onFail={handleTaskFail}
                      onEdit={openEdit}
                      onDelete={deleteMasterTask}
                      isSecondary={true}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* DONE TASKS SECTION */}
            {doneTasks.length > 0 && (
              <div style={{ marginTop: '48px' }}>
                <div style={{ 
                  fontSize: '11px', color: '#00ff88', fontFamily: 'Orbitron, monospace', letterSpacing: '0.2em', 
                  marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px'
                }}>
                  <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(0,255,136,0.3))' }} />
                  MISSION LOGS
                  <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(0,255,136,0.3), transparent)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', opacity: 0.8 }}>
                  {doneTasks.map((task) => (
                    <QuestCard
                      key={`${task.id}-done`}
                      task={task}
                      selectedDate={selectedDate}
                      onUndo={handleTaskUndo}
                      onEdit={openEdit}
                      onDelete={deleteMasterTask}
                      isDone={true}
                      isSecondary={true}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Add/Edit Quest Modal */}
      <Modal isOpen={addOpen || !!editTarget} onClose={() => { setAddOpen(false); setEditTarget(null); }} title={editTarget ? 'CONFIG MISSION' : 'NEW MISSION PROTOCOL'} variant="blue">
        {QuestForm}
      </Modal>

      {/* Penalty Modal */}
      <Modal isOpen={penaltyOpen} onClose={() => { setPenaltyOpen(false); setPenaltyMsg(''); }} title="MANUAL PENALTY" variant="red">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '13px', color: '#8892a0', lineHeight: 1.5 }}>
            Enter penalty amount. This Gold will be deducted and routed to your SBI savings mandate.
          </div>
          <div>
            <label style={{ fontSize: '11px', color: '#ff003c', fontFamily: 'Orbitron, monospace', letterSpacing: '0.15em', display: 'block', marginBottom: '6px' }}>
              PENALTY AMOUNT (GOLD)
            </label>
            <input
              className="input-field"
              type="number"
              value={penaltyAmount}
              onChange={e => setPenaltyAmount(e.target.value)}
              placeholder="e.g. 100"
              min="0"
              step="0.1"
              style={{ borderColor: 'rgba(255,0,60,0.4)' }}
            />
          </div>
          {penaltyMsg && (
            <div style={{ color: '#ff003c', fontSize: '12px', fontFamily: 'Share Tech Mono, monospace' }}>{penaltyMsg}</div>
          )}
          <button className="btn btn-solid-red" onClick={handlePenalty} style={{ width: '100%', padding: '12px' }}>
            EXECUTE PENALTY
          </button>
        </div>
      </Modal>

    </div>
    </PageTransition>

  );
}
