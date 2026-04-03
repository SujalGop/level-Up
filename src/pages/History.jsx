import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import PageTransition from '../components/PageTransition';
import Modal from '../components/Modal';

export default function History() {
  const { transactions, logExpense, undoManualExpense, editManualExpense, playerStats } = useGame();
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDesc, setExpenseDesc] = useState('');

  const [editTarget, setEditTarget] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // Sort transactions newest first
  const sortedTrans = [...(transactions || [])].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  function handleLogExpense(e) {
    e.preventDefault();
    const amt = Number(expenseAmount);
    if (!amt || amt <= 0) return;
    if (amt > playerStats.gold) {
      alert("Not enough gold to log this expense!");
      return;
    }
    logExpense(amt, expenseDesc || 'Miscellaneous');
    setExpenseAmount('');
    setExpenseDesc('');
  }

  function openEdit(tx) {
    setEditTarget(tx);
    setEditAmount(Math.abs(tx.amount).toString());
    setEditDesc(tx.details || '');
  }

  function handleEditSubmit(e) {
    e.preventDefault();
    const amt = Number(editAmount);
    if (!amt || amt <= 0) return;
    editManualExpense(editTarget.id, amt, editDesc);
    setEditTarget(null);
  }

  return (
    <PageTransition>
      <div className="page-wrap">
        <div style={{ marginBottom: '32px' }}>
          <div className="font-orbitron" style={{ fontSize: '10px', color: '#8892a0', letterSpacing: '0.3em', marginBottom: '6px' }}>
            ACCOUNTING PROTOCOL // OMNISCIENCE
          </div>
          <h1 className="font-orbitron" style={{ fontSize: '28px', fontWeight: 900, color: '#fff', margin: 0 }}>
            TRANSACTION <span style={{ color: '#00f0ff' }}>HISTORY</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
          
          {/* Left: Transaction List */}
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #1e2030', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="font-orbitron" style={{ fontSize: '14px', color: '#e8eaf0', letterSpacing: '0.1em' }}>
                SYSTEM REGISTRY
              </div>
              <div style={{ fontSize: '12px', color: '#8892a0', fontFamily: 'Share Tech Mono, monospace' }}>
                {sortedTrans.length} ENTRIES
              </div>
            </div>
            
            <div style={{ maxHeight: '65vh', overflowY: 'auto' }}>
              {sortedTrans.length === 0 ? (
                <div style={{ padding: '60px 40px', textAlign: 'center', color: '#3a3f52', fontSize: '14px', fontFamily: 'Share Tech Mono, monospace' }}>
                  No registry logs found. Commencing logging protocols now.
                </div>
              ) : (
                sortedTrans.map((tx) => {
                  const isPositive = tx.amount > 0;
                  const isZero = tx.amount === 0;
                  const txColor = isPositive ? '#00cc77' : (isZero ? '#8892a0' : '#ff003c');
                  const txSign = isPositive ? '+' : (isZero ? '' : '');
                  
                  return (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      style={{
                        padding: '16px 20px',
                        borderBottom: '1px solid rgba(255,255,255,0.03)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '16px'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', color: '#e8eaf0', fontWeight: 600, marginBottom: '6px' }}>
                          {tx.details || tx.type.toUpperCase()}
                        </div>
                        <div style={{ fontSize: '11px', color: '#8892a0', fontFamily: 'Share Tech Mono, monospace', display: 'flex', gap: '12px' }}>
                          <span>{format(parseISO(tx.timestamp), 'MMM do, yyyy')}</span>
                          <span>{format(parseISO(tx.timestamp), 'HH:mm:ss')}</span>
                          <span style={{ color: '#525b6e', textTransform: 'uppercase' }}>[{tx.type}]</span>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                        <div>
                          <div className="font-mono" style={{ fontSize: '16px', fontWeight: 700, color: txColor }}>
                            {txSign}{tx.amount}G
                          </div>
                          <div style={{ fontSize: '11px', color: '#525b6e', fontFamily: 'Share Tech Mono, monospace', marginTop: '4px' }}>
                            BAL: {tx.balanceAfter}G
                          </div>
                        </div>
                        {tx.type === 'manual_expense' && (
                          <div style={{ display: 'flex', gap: '8px', opacity: 0.8 }}>
                            <button className="btn btn-blue" style={{ padding: '4px 10px', fontSize: '10px' }} onClick={() => openEdit(tx)}>EDIT</button>
                            <button className="btn btn-red" style={{ padding: '4px 10px', fontSize: '10px' }} onClick={() => undoManualExpense(tx.id)}>UNDO</button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })
              )}
            </div>
          </div>

          {/* Right: Manual Expense Logger */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                background: 'rgba(255,0,60,0.04)',
                border: '1px solid rgba(255,0,60,0.3)',
                borderRadius: '4px',
                padding: '24px',
              }}
            >
              <div className="font-orbitron" style={{ fontSize: '12px', color: '#ff003c', letterSpacing: '0.2em', marginBottom: '8px' }}>
                📝 MANUAL EXPENSE
              </div>
              <div style={{ fontSize: '13px', color: '#8892a0', marginBottom: '24px', lineHeight: 1.6 }}>
                Record a real-life expense. This will forcefully deduct Gold and drop your Quota.
              </div>
              
              <form onSubmit={handleLogExpense} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '10px', color: '#ff003c', fontFamily: 'Share Tech Mono, monospace', display: 'block', marginBottom: '4px' }}>
                    GOLD DEDUCTION AMOUNT
                  </label>
                  <input
                    type="number"
                    className="input-field font-mono"
                    value={expenseAmount}
                    onChange={e => setExpenseAmount(e.target.value)}
                    placeholder="e.g. 150"
                    min="0.1"
                    step="0.1"
                    required
                    style={{ borderColor: 'rgba(255,0,60,0.3)', fontSize: '16px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '10px', color: '#8892a0', fontFamily: 'Share Tech Mono, monospace', display: 'block', marginBottom: '4px' }}>
                    REASON / DESCRIPTION (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={expenseDesc}
                    onChange={e => setExpenseDesc(e.target.value)}
                    placeholder="e.g. Ordered Pizza"
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-solid-red"
                  style={{ width: '100%', padding: '14px', marginTop: '8px', letterSpacing: '0.15em', fontWeight: 700 }}
                >
                  SUBMIT EXPENSE
                </button>
              </form>
            </motion.div>
          </div>

        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="EDIT MANUAL EXPENSE" variant="blue">
        {editTarget && (
          <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '10px', color: '#00f0ff', fontFamily: 'Share Tech Mono, monospace', display: 'block', marginBottom: '4px' }}>
                NEW DEDUCTION AMOUNT
              </label>
              <input
                type="number"
                className="input-field font-mono"
                value={editAmount}
                onChange={e => setEditAmount(e.target.value)}
                min="0.1"
                step="0.1"
                required
                style={{ borderColor: 'rgba(0,240,255,0.3)', fontSize: '16px', color: '#fff' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '10px', color: '#8892a0', fontFamily: 'Share Tech Mono, monospace', display: 'block', marginBottom: '4px' }}>
                NEW DESCRIPTION
              </label>
              <input
                type="text"
                className="input-field"
                value={editDesc}
                onChange={e => setEditDesc(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="btn btn-solid-blue"
              style={{ width: '100%', padding: '14px', marginTop: '8px', letterSpacing: '0.15em', fontWeight: 700 }}
            >
              SAVE CHANGES
            </button>
          </form>
        )}
      </Modal>

    </PageTransition>
  );
}
