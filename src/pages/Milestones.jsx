import { useState } from 'react';
import { useGame } from '../context/GameContext';
import Modal from '../components/Modal';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../components/PageTransition';

const STAT_COLORS = { INT: '#00f0ff', STR: '#ff003c', VIT: '#00ff88', PER: '#bf5fff' };

export default function Milestones() {
  const { jobQuests, completeMilestone, addMilestone, editMilestone, deleteMilestone } = useGame();
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [clearedMilestone, setClearedMilestone] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', INT: 0, STR: 0, VIT: 0, PER: 0 });

  function openAdd() {
    setForm({ title: '', description: '', INT: 0, STR: 0, VIT: 0, PER: 0 });
    setAddOpen(true);
  }

  function openEdit(ms) {
    const sr = ms.statReward || {};
    setForm({ title: ms.title, description: ms.description || '', INT: sr.INT || 0, STR: sr.STR || 0, VIT: sr.VIT || 0, PER: sr.PER || 0 });
    setEditTarget(ms);
  }

  function handleSubmit() {
    const statReward = {};
    ['INT', 'STR', 'VIT', 'PER'].forEach(stat => {
      if (Number(form[stat]) > 0) statReward[stat] = Number(form[stat]);
    });

    if (editTarget) {
      editMilestone(editTarget.id, { title: form.title, description: form.description, statReward });
      setEditTarget(null);
    } else {
      addMilestone({ title: form.title, description: form.description, statReward });
      setAddOpen(false);
    }
  }

  const active = jobQuests.filter(j => j.status === 'Active');
  const completed = jobQuests.filter(j => j.status === 'Completed');

  const MilestoneForm = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div>
        <label style={{ fontSize: '11px', color: '#8892a0', fontFamily: 'Orbitron, monospace', letterSpacing: '0.15em', display: 'block', marginBottom: '6px' }}>
          MILESTONE TITLE
        </label>
        <input
          className="input-field"
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          placeholder="e.g., Get First Internship"
        />
      </div>
      <div>
        <label style={{ fontSize: '11px', color: '#8892a0', fontFamily: 'Orbitron, monospace', letterSpacing: '0.15em', display: 'block', marginBottom: '6px' }}>
          DESCRIPTION (OPTIONAL)
        </label>
        <textarea
          className="input-field"
          value={form.description || ''}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="e.g., Apply to 50 locations..."
          style={{ minHeight: '60px', resize: 'vertical' }}
        />
      </div>
      <div>
        <label style={{ fontSize: '11px', color: '#8892a0', fontFamily: 'Orbitron, monospace', letterSpacing: '0.15em', display: 'block', marginBottom: '8px' }}>
          STAT REWARDS ON CLEAR
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {['INT', 'STR', 'VIT', 'PER'].map(stat => (
            <div key={stat}>
              <label style={{ fontSize: '10px', color: STAT_COLORS[stat], fontFamily: 'Share Tech Mono, monospace', display: 'block', marginBottom: '4px' }}>{stat}</label>
              <input
                className="input-field"
                type="number"
                value={form[stat]}
                onChange={e => setForm(f => ({ ...f, [stat]: e.target.value }))}
                min="0"
                style={{ padding: '6px 10px' }}
              />
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        <button className="btn btn-solid-blue" style={{ flex: 1 }} onClick={handleSubmit}>
          {editTarget ? 'SAVE' : 'CREATE MILESTONE'}
        </button>
        <button className="btn btn-red" onClick={() => { setAddOpen(false); setEditTarget(null); }}>CANCEL</button>
      </div>
    </div>
  );

  return (
    <PageTransition>
      {/* Massive Rank Up Overlay */}
      <AnimatePresence>
        {clearedMilestone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 1.2, filter: 'blur(10px)' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'fixed', inset: 0, zIndex: 10000,
              background: 'radial-gradient(circle, #1a1c29 0%, #000 100%)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '24px'
            }}
          >
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.4 } }
              }}
              style={{ textAlign: 'center' }}
            >
              <motion.div variants={{ hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0 } }}>
                <div style={{ fontSize: '80px', marginBottom: '20px' }}>🏆</div>
                <div className="font-orbitron" style={{ fontSize: '48px', fontWeight: 900, color: '#ffd700', textShadow: '0 0 30px rgba(255,215,0,0.8)', letterSpacing: '0.1em' }}>
                  MILESTONE ACHIEVED
                </div>
                <div style={{ fontSize: '24px', color: '#e8eaf0', marginTop: '16px', marginBottom: '40px' }}>
                  {clearedMilestone.title}
                </div>
              </motion.div>

              <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <motion.div 
                  variants={{ hidden: { opacity: 0, scale: 0.5 }, visible: { opacity: 1, scale: 1 } }}
                  className="font-mono" style={{ fontSize: '32px', color: '#ffd700', textShadow: '0 0 20px rgba(255,215,0,0.5)' }}
                >
                  +500G Bonus
                </motion.div>
                {Object.entries(clearedMilestone.statReward || {}).map(([stat, val]) => (
                  <motion.div
                    key={stat}
                    variants={{ hidden: { opacity: 0, scale: 0.5 }, visible: { opacity: 1, scale: 1 } }}
                    className="font-mono"
                    style={{ fontSize: '32px', color: STAT_COLORS[stat], textShadow: `0 0 20px ${STAT_COLORS[stat]}88` }}
                  >
                    +{val} {stat}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="page-wrap" style={{ maxWidth: '900px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <div className="font-orbitron" style={{ fontSize: '10px', color: '#8892a0', letterSpacing: '0.3em', marginBottom: '6px' }}>
            JOB CHANGE // BOSS RAID BOARD
          </div>
          <h1 className="font-orbitron" style={{ fontSize: '28px', fontWeight: 900, color: '#fff', margin: 0 }}>
            MILESTONE <span style={{ color: '#ffd700' }}>BOSSES</span>
          </h1>
          <div style={{ marginTop: '8px', fontSize: '13px', color: '#8892a0', fontFamily: 'Share Tech Mono, monospace' }}>
            {active.length} ACTIVE — {completed.length} DEFEATED
          </div>
        </div>
        <button className="btn btn-gold" id="add-milestone-btn" onClick={openAdd}>+ NEW BOSS</button>
      </div>

      {/* Active Milestones */}
      <div style={{ marginBottom: '32px' }}>
        <div className="section-title">ACTIVE RAIDS</div>
        {active.length === 0 && (
          <div style={{ color: '#8892a0', fontSize: '13px', fontFamily: 'Share Tech Mono, monospace', padding: '20px 0' }}>
            No active bosses. Add a milestone to begin.
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <AnimatePresence>
            {active.map((ms, i) => (
              <motion.div
                key={ms.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ delay: i * 0.08 }}
                className="card"
                style={{
                  padding: '28px',
                  borderColor: 'rgba(255,215,0,0.2)',
                  background: 'linear-gradient(135deg, #111318 0%, #131520 100%)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Boss glow */}
                <div style={{
                  position: 'absolute',
                  top: 0, right: 0,
                  width: '200px', height: '200px',
                  background: 'radial-gradient(circle at top right, rgba(255,215,0,0.05), transparent 70%)',
                  pointerEvents: 'none',
                }} />

                <div className="boss-card-inner">
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <span style={{ fontSize: '28px' }}>💀</span>
                      <div>
                        <div style={{ fontSize: '11px', color: '#ffd700', fontFamily: 'Orbitron, monospace', letterSpacing: '0.15em', marginBottom: '4px' }}>
                          BOSS RAID
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: 700, color: '#e8eaf0', lineHeight: 1.3 }}>
                          {ms.title}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                      {Object.entries(ms.statReward || {}).map(([stat, val]) => (
                        <span key={stat} className={`stat-badge tag-${stat.toLowerCase()}`}>
                          +{val} {stat}
                        </span>
                      ))}
                      <span className="stat-badge tag-gold">+500G BONUS</span>
                    </div>

                    {ms.description && (
                      <div style={{ fontSize: '13px', color: '#8892a0', marginBottom: '16px', lineHeight: 1.4, borderLeft: '2px solid rgba(255,215,0,0.3)', paddingLeft: '8px' }}>
                        {ms.description}
                      </div>
                    )}
                  </div>

                  <div className="boss-card-actions">
                    <button
                      id={`complete-${ms.id}`}
                      className="btn btn-solid-blue"
                      style={{ fontSize: '13px', padding: '10px 20px', whiteSpace: 'nowrap' }}
                      onClick={() => setConfirmId(ms.id)}
                    >
                      🏆 CLEAR BOSS
                    </button>
                    <button
                      className="btn btn-blue"
                      style={{ fontSize: '11px', padding: '6px 12px' }}
                      onClick={() => openEdit(ms)}
                    >
                      EDIT
                    </button>
                    <button
                      className="btn btn-red"
                      style={{ fontSize: '11px', padding: '6px 12px' }}
                      onClick={() => deleteMilestone(ms.id)}
                    >
                      DELETE
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Completed Milestones */}
      {completed.length > 0 && (
        <div>
          <div className="section-title">DEFEATED BOSSES</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {completed.map(ms => (
              <div
                key={ms.id}
                className="card"
                style={{ padding: '16px 20px', opacity: 0.5, display: 'flex', alignItems: 'center', gap: '12px' }}
              >
                <span style={{ fontSize: '22px' }}>✅</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', color: '#8892a0', textDecoration: 'line-through', marginBottom: '4px' }}>{ms.title}</div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {Object.entries(ms.statReward || {}).map(([stat, val]) => (
                      <span key={stat} className={`stat-badge tag-${stat.toLowerCase()}`} style={{ opacity: 0.6 }}>
                        +{val} {stat}
                      </span>
                    ))}
                  </div>
                </div>
                <button className="btn btn-red" style={{ fontSize: '11px', padding: '4px 8px' }} onClick={() => deleteMilestone(ms.id)}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={addOpen || !!editTarget} onClose={() => { setAddOpen(false); setEditTarget(null); }} title={editTarget ? 'EDIT MILESTONE' : 'NEW MILESTONE'}>
        {MilestoneForm}
      </Modal>

      {/* Confirm Clear Modal */}
      <Modal isOpen={!!confirmId} onClose={() => setConfirmId(null)} title="BOSS DEFEATED?" variant="blue">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '14px', color: '#8892a0', lineHeight: 1.6 }}>
            Mark this boss as defeated? Massive stat and Gold rewards will be granted. This cannot be undone.
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-solid-blue"
              style={{ flex: 1, padding: '12px' }}
              onClick={() => {
                const ms = active.find(m => m.id === confirmId);
                completeMilestone(confirmId);
                setConfirmId(null);
                setClearedMilestone(ms);
                setTimeout(() => setClearedMilestone(null), 4000);
              }}
            >
              🏆 CONFIRM CLEAR
            </button>
            <button className="btn btn-red" onClick={() => setConfirmId(null)}>CANCEL</button>
          </div>
        </div>
      </Modal>
    </div>
    </PageTransition>
  );
}
