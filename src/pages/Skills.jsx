import { useState } from 'react';
import { useGame } from '../context/GameContext';
import Modal from '../components/Modal';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../components/PageTransition';

export default function Skills() {
  const { skillBooks, addSkillBook, deleteSkillBook, consumeSkillBook, playerStats } = useGame();
  const [addOpen, setAddOpen] = useState(false);
  const [newItem, setNewItem] = useState({ title: '', description: '' });
  const [confirmId, setConfirmId] = useState(null);

  function handleAdd() {
    if (!newItem.title.trim()) return;
    addSkillBook({ title: newItem.title.trim(), description: newItem.description });
    setNewItem({ title: '', description: '' });
    setAddOpen(false);
  }

  function handleConsume(id) {
    consumeSkillBook(id);
    setConfirmId(null);
  }

  const active = skillBooks.filter(b => !b.isConsumed);
  const mastered = skillBooks.filter(b => b.isConsumed);

  return (
    <PageTransition>
      <div className="page-wrap" style={{ maxWidth: '800px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <div className="font-orbitron" style={{ fontSize: '10px', color: '#8892a0', letterSpacing: '0.3em', marginBottom: '6px' }}>
            CODEX // KNOWLEDGE ARCHIVE
          </div>
          <h1 className="font-orbitron" style={{ fontSize: '28px', fontWeight: 900, color: '#fff', margin: 0 }}>
            SKILL <span style={{ color: '#00f0ff' }}>BOOKS</span>
          </h1>
          <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
            <span className="stat-badge tag-int">INT: {playerStats.INT}</span>
            <span style={{ fontSize: '12px', color: '#8892a0', fontFamily: 'Share Tech Mono, monospace', padding: '2px 8px' }}>
              {mastered.length}/{skillBooks.length} MASTERED
            </span>
          </div>
        </div>
        <button className="btn btn-blue" id="add-skill-btn" onClick={() => setAddOpen(true)}>
          + ADD RUNE
        </button>
      </div>

      {/* Active Skill Books */}
      <div style={{ marginBottom: '32px' }}>
        <div className="section-title">ACTIVE SKILL BOOKS</div>
        {active.length === 0 && (
          <div style={{ color: '#8892a0', fontSize: '13px', fontFamily: 'Share Tech Mono, monospace', padding: '20px 0' }}>
            No active skill books. Add new runes to study.
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <AnimatePresence>
            {active.map((book, i) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.06 }}
                className="card"
                style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}
              >
                {/* Book icon */}
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    background: 'rgba(0,240,255,0.08)',
                    border: '1px solid rgba(0,240,255,0.3)',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px',
                    flexShrink: 0,
                  }}
                >
                  📖
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#e8eaf0', marginBottom: '4px' }}>
                    {book.title}
                  </div>
                  {book.description && (
                    <div style={{ fontSize: '13px', color: '#8892a0', marginBottom: '8px', lineHeight: 1.4 }}>
                      {book.description}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span className="stat-badge tag-int">+20 INT ON MASTER</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    id={`consume-${book.id}`}
                    className="btn btn-solid-blue"
                    style={{ fontSize: '12px', padding: '8px 16px' }}
                    onClick={() => setConfirmId(book.id)}
                  >
                    CONSUME RUNE
                  </button>
                  <button
                    className="btn btn-red"
                    style={{ fontSize: '12px', padding: '8px 12px' }}
                    onClick={() => deleteSkillBook(book.id)}
                  >
                    ✕
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Mastered Books */}
      {mastered.length > 0 && (
        <div>
          <div className="section-title">MASTERED RUNES</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {mastered.map(book => (
              <div
                key={book.id}
                className="card"
                style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px', opacity: 0.5 }}
              >
                <span style={{ fontSize: '18px' }}>✅</span>
                <div style={{ flex: 1, fontSize: '14px', color: '#8892a0', textDecoration: 'line-through' }}>
                  {book.title}
                </div>
                <span className="stat-badge" style={{ background: 'rgba(0,255,136,0.1)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.2)' }}>
                  MASTERED
                </span>
                <button
                  className="btn btn-red"
                  style={{ fontSize: '11px', padding: '4px 8px' }}
                  onClick={() => deleteSkillBook(book.id)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="ADD SKILL RUNE">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '11px', color: '#8892a0', fontFamily: 'Orbitron, monospace', letterSpacing: '0.15em', display: 'block', marginBottom: '6px' }}>
              RUNE TITLE
            </label>
            <input
              className="input-field"
              value={newItem.title}
              onChange={e => setNewItem({ ...newItem, title: e.target.value })}
              placeholder="e.g., System Design Patterns"
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              autoFocus
            />
          </div>
          <div>
            <label style={{ fontSize: '11px', color: '#8892a0', fontFamily: 'Orbitron, monospace', letterSpacing: '0.15em', display: 'block', marginBottom: '6px' }}>
              DESCRIPTION (OPTIONAL)
            </label>
            <textarea
              className="input-field"
              value={newItem.description}
              onChange={e => setNewItem({ ...newItem, description: e.target.value })}
              placeholder="e.g., Read chapters 1-3..."
              style={{ minHeight: '60px', resize: 'vertical' }}
            />
          </div>
          <div style={{ fontSize: '12px', color: '#8892a0', padding: '8px 12px', background: 'rgba(0,240,255,0.04)', borderRadius: '3px', border: '1px solid rgba(0,240,255,0.1)' }}>
            Consuming this rune will grant <strong style={{ color: '#00f0ff' }}>+20 INT</strong>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-solid-blue" style={{ flex: 1 }} onClick={handleAdd}>
              INSCRIBE RUNE
            </button>
            <button className="btn btn-red" onClick={() => setAddOpen(false)}>
              CANCEL
            </button>
          </div>
        </div>
      </Modal>

      {/* Consume Confirm Modal */}
      <Modal isOpen={!!confirmId} onClose={() => setConfirmId(null)} title="CONSUME RUNE?" variant="blue">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '14px', color: '#8892a0', lineHeight: 1.6 }}>
            Consuming this rune will mark it as <strong style={{ color: '#00ff88' }}>Mastered</strong> and permanently grant{' '}
            <strong style={{ color: '#00f0ff' }}>+20 INT</strong>. This action cannot be undone.
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-solid-blue"
              style={{ flex: 1, padding: '12px' }}
              onClick={() => handleConsume(confirmId)}
            >
              ⚡ CONSUME
            </button>
            <button className="btn btn-red" onClick={() => setConfirmId(null)}>
              CANCEL
            </button>
          </div>
        </div>
      </Modal>
      </div>
    </PageTransition>
  );
}
