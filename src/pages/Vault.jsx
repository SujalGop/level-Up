import { useState } from 'react';
import { useGame } from '../context/GameContext';
import Modal from '../components/Modal';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import AnimatedCounter from '../components/AnimatedCounter';

export default function Vault() {
  const { vaultGoals, playerStats, voluntaryDeposit, addVaultGoal, editVaultGoal, deleteVaultGoal } = useGame();
  const { gold, sbiSavingsMandate } = playerStats;

  const [depositGoalId, setDepositGoalId] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositMsg, setDepositMsg] = useState('');

  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', targetGold: 1000, priority: 1 });

  function openAdd() {
    const maxPriority = vaultGoals.length > 0 ? Math.max(...vaultGoals.map(g => g.priority)) + 1 : 1;
    setForm({ title: '', description: '', targetGold: 1000, priority: maxPriority });
    setAddOpen(true);
  }

  function openEdit(goal) {
    setForm({ title: goal.title, description: goal.description || '', targetGold: goal.targetGold, priority: goal.priority });
    setEditTarget(goal);
  }

  function handleSubmit() {
    if (!form.title.trim()) return;
    if (editTarget) {
      editVaultGoal(editTarget.id, { title: form.title, description: form.description, targetGold: Number(form.targetGold), priority: Number(form.priority) });
      setEditTarget(null);
    } else {
      addVaultGoal({ title: form.title, description: form.description, targetGold: Number(form.targetGold), priority: Number(form.priority) });
      setAddOpen(false);
    }
  }

  function handleDeposit() {
    const amt = Number(depositAmount);
    if (isNaN(amt) || amt <= 0) { setDepositMsg('Enter a valid amount.'); return; }
    if (gold < amt) { setDepositMsg('Insufficient Gold.'); return; }
    voluntaryDeposit(depositGoalId, amt);
    setDepositGoalId(null);
    setDepositAmount('');
    setDepositMsg('');
  }

  const sorted = [...vaultGoals].sort((a, b) => a.priority - b.priority);
  const totalSaved = vaultGoals.reduce((s, g) => s + g.currentGold, 0);
  const totalTarget = vaultGoals.reduce((s, g) => s + g.targetGold, 0);

  const depositTarget = vaultGoals.find(g => g.id === depositGoalId);

  return (
    <PageTransition>
      <div className="page-wrap" style={{ maxWidth: '900px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <div className="font-orbitron" style={{ fontSize: '10px', color: '#8892a0', letterSpacing: '0.3em', marginBottom: '6px' }}>
            GUILD VAULT // SAVINGS LEDGER
          </div>
          <h1 className="font-orbitron" style={{ fontSize: '28px', fontWeight: 900, color: '#fff', margin: 0 }}>
            THE <span style={{ color: '#00ff88' }}>VAULT</span>
          </h1>
        </div>
        <button className="btn btn-green" id="add-vault-goal-btn" onClick={openAdd}>+ NEW GOAL</button>
      </div>

      {/* Overall summary */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid-3col"
        style={{ marginBottom: '32px' }}
      >
        {[
          { label: 'TOTAL SAVED', value: `${totalSaved.toLocaleString()}G`, color: '#00ff88' },
          { label: 'TOTAL TARGET', value: `${totalTarget.toLocaleString()}G`, color: '#8892a0' },
          { label: 'SBI MANDATE', value: `₹${sbiSavingsMandate.toLocaleString()}`, color: '#ff003c', sub: 'TRANSFER TO BANK' },
        ].map(item => (
          <div
            key={item.label}
            className="card"
            style={{ padding: '20px', textAlign: 'center' }}
          >
            <div style={{ fontSize: '10px', fontFamily: 'Orbitron, monospace', letterSpacing: '0.15em', color: '#8892a0', marginBottom: '8px' }}>
              {item.label}
            </div>
            <div className="font-mono" style={{ fontSize: '26px', fontWeight: 700, color: item.color, textShadow: `0 0 12px ${item.color}66` }}>
              {item.value}
            </div>
            {item.sub && (
              <div style={{ fontSize: '10px', color: '#ff003c', fontFamily: 'Share Tech Mono, monospace', marginTop: '4px' }}>
                {item.sub}
              </div>
            )}
          </div>
        ))}
      </motion.div>

      {/* Overall progress */}
      {totalTarget > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', color: '#8892a0', fontFamily: 'Orbitron, monospace', letterSpacing: '0.15em' }}>OVERALL PROGRESS</span>
            <span style={{ fontSize: '11px', color: '#00ff88', fontFamily: 'Share Tech Mono, monospace' }}>
              {Math.floor((totalSaved / totalTarget) * 100)}%
            </span>
          </div>
          <div style={{ height: '6px', background: '#111318', border: '1px solid #1e2030', borderRadius: '3px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${Math.min(100, (totalSaved / totalTarget) * 100)}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #00664d, #00ff88)',
                transition: 'width 0.6s ease',
                boxShadow: '0 0 8px rgba(0,255,136,0.5)',
              }}
            />
          </div>
        </div>
      )}

      {/* Goal Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <AnimatePresence>
          {sorted.map((goal, i) => {
            const pct = Math.min(100, goal.targetGold > 0 ? (goal.currentGold / goal.targetGold) * 100 : 0);
            const barColor = goal.isAchieved ? '#00ff88' : pct > 66 ? '#00f0ff' : pct > 33 ? '#ffd700' : '#ff8800';

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.07 }}
                className="card"
                style={{
                  padding: '24px',
                  borderColor: goal.isAchieved ? 'rgba(0,255,136,0.3)' : undefined,
                  opacity: goal.isAchieved ? 0.7 : 1,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span
                        style={{
                          background: 'rgba(0,240,255,0.1)',
                          border: '1px solid rgba(0,240,255,0.3)',
                          borderRadius: '2px',
                          padding: '1px 8px',
                          fontSize: '10px',
                          fontFamily: 'Share Tech Mono, monospace',
                          color: '#00f0ff',
                        }}
                      >
                        P{goal.priority}
                      </span>
                      {goal.isAchieved && (
                        <span style={{ fontSize: '11px', color: '#00ff88', fontFamily: 'Orbitron, monospace', letterSpacing: '0.1em' }}>
                          ✓ ACHIEVED
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '17px', fontWeight: 600, color: '#e8eaf0' }}>{goal.title}</div>
                    {goal.description && (
                      <div style={{ fontSize: '13px', color: '#8892a0', marginTop: '6px', lineHeight: 1.4 }}>
                        {goal.description}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {!goal.isAchieved && (
                      <button
                        id={`deposit-${goal.id}`}
                        className="btn btn-green"
                        style={{ fontSize: '12px', padding: '6px 14px' }}
                        onClick={() => { setDepositGoalId(goal.id); setDepositAmount(''); setDepositMsg(''); }}
                      >
                        DEPOSIT
                      </button>
                    )}
                    <button
                      className="btn btn-blue"
                      style={{ fontSize: '11px', padding: '6px 10px' }}
                      onClick={() => openEdit(goal)}
                    >
                      EDIT
                    </button>
                    <button
                      className="btn btn-red"
                      style={{ fontSize: '11px', padding: '6px 10px' }}
                      onClick={() => deleteVaultGoal(goal.id)}
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Progress */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="font-mono" style={{ fontSize: '14px', color: barColor, fontWeight: 700 }}>
                    {goal.currentGold.toLocaleString()}G
                  </span>
                  <span className="font-mono" style={{ fontSize: '14px', color: '#8892a0' }}>
                    / {goal.targetGold.toLocaleString()}G &nbsp;
                    <span style={{ color: barColor }}>{Math.floor(pct)}%</span>
                  </span>
                </div>

                <div style={{ height: '12px', background: '#0a0b10', border: '1px solid #1e2030', borderRadius: '3px', overflow: 'hidden', position: 'relative' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{
                      height: '100%',
                      background: `linear-gradient(90deg, ${barColor}88, ${barColor})`,
                      boxShadow: `0 0 10px ${barColor}66`,
                      borderRadius: '3px',
                    }}
                  />
                  {goal.isAchieved && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '9px', color: '#000', fontFamily: 'Orbitron, monospace', fontWeight: 700, letterSpacing: '0.1em',
                    }}>
                      COMPLETE
                    </div>
                  )}
                </div>

                {!goal.isAchieved && (
                  <div style={{ marginTop: '8px', fontSize: '11px', color: '#8892a0', fontFamily: 'Share Tech Mono, monospace' }}>
                    {(goal.targetGold - goal.currentGold).toLocaleString()}G remaining
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Deposit Modal */}
      <Modal isOpen={!!depositGoalId} onClose={() => { setDepositGoalId(null); setDepositMsg(''); }} title="VOLUNTARY DEPOSIT" variant="blue">
        {depositTarget && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#00ff88' }}>{depositTarget.title}</div>
            <div style={{ fontSize: '12px', color: '#8892a0' }}>
              Current: <strong style={{ color: '#e8eaf0' }}>{depositTarget.currentGold.toLocaleString()}G</strong> / {depositTarget.targetGold.toLocaleString()}G
            </div>
            <div style={{ fontSize: '12px', color: '#8892a0' }}>
              Available Gold: <strong className="font-mono" style={{ color: '#ffd700' }}><AnimatedCounter value={gold} suffix="G" /></strong>
            </div>
            <div>
              <label style={{ fontSize: '11px', color: '#8892a0', fontFamily: 'Orbitron, monospace', letterSpacing: '0.15em', display: 'block', marginBottom: '6px' }}>
                DEPOSIT AMOUNT
              </label>
              <input
                className="input-field"
                type="number"
                value={depositAmount}
                onChange={e => setDepositAmount(e.target.value)}
                placeholder="Enter Gold amount..."
                min="1"
                autoFocus
              />
            </div>
            {depositMsg && <div style={{ color: '#ff003c', fontSize: '12px', fontFamily: 'Share Tech Mono, monospace' }}>{depositMsg}</div>}
            <button className="btn btn-solid-blue" style={{ width: '100%', padding: '12px' }} onClick={handleDeposit}>
              CONFIRM DEPOSIT
            </button>
          </div>
        )}
      </Modal>

      {/* Add/Edit Goal Modal */}
      <Modal isOpen={addOpen || !!editTarget} onClose={() => { setAddOpen(false); setEditTarget(null); }} title={editTarget ? 'EDIT GOAL' : 'NEW VAULT GOAL'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '11px', color: '#8892a0', fontFamily: 'Orbitron, monospace', letterSpacing: '0.15em', display: 'block', marginBottom: '6px' }}>
              GOAL TITLE
            </label>
            <input className="input-field" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g., RTX 5090 Fund" />
          </div>
          <div>
            <label style={{ fontSize: '11px', color: '#8892a0', fontFamily: 'Orbitron, monospace', letterSpacing: '0.15em', display: 'block', marginBottom: '6px' }}>
              DESCRIPTION (OPTIONAL)
            </label>
            <textarea
              className="input-field"
              value={form.description || ''}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="e.g., For building a master setup..."
              style={{ minHeight: '60px', resize: 'vertical' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '11px', color: '#8892a0', fontFamily: 'Orbitron, monospace', letterSpacing: '0.15em', display: 'block', marginBottom: '6px' }}>
              TARGET GOLD
            </label>
            <input className="input-field" type="number" value={form.targetGold} onChange={e => setForm(f => ({ ...f, targetGold: e.target.value }))} min="1" />
          </div>
          <div>
            <label style={{ fontSize: '11px', color: '#8892a0', fontFamily: 'Orbitron, monospace', letterSpacing: '0.15em', display: 'block', marginBottom: '6px' }}>
              PRIORITY (1 = HIGHEST)
            </label>
            <input className="input-field" type="number" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} min="1" />
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button className="btn btn-solid-blue" style={{ flex: 1 }} onClick={handleSubmit}>
              {editTarget ? 'SAVE CHANGES' : 'CREATE GOAL'}
            </button>
            <button className="btn btn-red" onClick={() => { setAddOpen(false); setEditTarget(null); }}>CANCEL</button>
          </div>
        </div>
      </Modal>
      </div>
    </PageTransition>
  );
}
