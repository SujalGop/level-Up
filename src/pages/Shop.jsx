import { useState } from 'react';
import { useGame } from '../context/GameContext';
import Modal from '../components/Modal';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../components/PageTransition';

export default function Shop() {
  const { shopItems, playerStats, purchaseItem, addShopItem, deleteShopItem } = useGame();
  const { gold } = playerStats;
  const isBankrupt = gold <= 0;

  const [addOpen, setAddOpen] = useState(false);
  const [confirmItem, setConfirmItem] = useState(null);
  const [newItem, setNewItem] = useState({ title: '', description: '', baseCost: 100, isLuxury: false, isHealing: false, hpAmount: 20 });

  function handlePurchase() {
    if (!confirmItem) return;
    purchaseItem(confirmItem.id);
    setConfirmItem(null);
  }

  function handleAdd() {
    if (!newItem.title.trim() || !newItem.baseCost) return;
    addShopItem({ ...newItem, baseCost: Number(newItem.baseCost), hpAmount: newItem.isHealing ? Number(newItem.hpAmount) : 0 });
    setNewItem({ title: '', description: '', baseCost: 100, isLuxury: false, isHealing: false, hpAmount: 20 });
    setAddOpen(false);
  }

  const canAfford = (item) => {
    const cost = item.isLuxury ? item.baseCost * 2 : item.baseCost;
    return gold >= cost;
  };

  return (
    <PageTransition>
      <div className="page-wrap" style={{ maxWidth: '900px', position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <div className="font-orbitron" style={{ fontSize: '10px', color: '#8892a0', letterSpacing: '0.3em', marginBottom: '6px' }}>
            MERCHANT // SAVINGS ENGINE
          </div>
          <h1 className="font-orbitron" style={{ fontSize: '28px', fontWeight: 900, color: '#fff', margin: 0 }}>
            THE <span style={{ color: '#ffd700' }}>SHOP</span>
          </h1>
          <div style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span className="stat-badge tag-gold">{gold.toLocaleString()}G AVAILABLE</span>
            {isBankrupt && (
              <span style={{ fontSize: '11px', color: '#ff003c', fontFamily: 'Share Tech Mono, monospace', fontWeight: 700, animation: 'pulse-red 1.5s ease-in-out infinite' }}>
                ⚠ BANKRUPT
              </span>
            )}
          </div>
        </div>
        <button className="btn btn-gold" id="add-shop-item-btn" onClick={() => setAddOpen(true)}>
          + ADD ITEM
        </button>
      </div>

      {/* Bankruptcy Overlay */}
      <AnimatePresence>
        {isBankrupt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(11,12,16,0.92)',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
              backdropFilter: 'blur(2px)',
            }}
          >
            <div style={{ textAlign: 'center', maxWidth: '400px', padding: '32px' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔒</div>
              <div
                className="font-orbitron"
                style={{
                  fontSize: '22px',
                  fontWeight: 900,
                  color: '#ff003c',
                  textShadow: '0 0 20px rgba(255,0,60,0.8)',
                  marginBottom: '12px',
                  letterSpacing: '0.1em',
                }}
              >
                BANKRUPT
              </div>
              <div style={{ fontSize: '15px', color: '#8892a0', lineHeight: 1.6 }}>
                Grind Quests to Restore Liquidity.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shop Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
        {shopItems.map((item, i) => {
          const totalCost = item.isLuxury ? item.baseCost * 2 : item.baseCost;
          const affordable = canAfford(item);

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`card ${item.isLuxury ? 'card-red' : ''}`}
              style={{
                padding: '24px',
                borderColor: item.isLuxury ? 'rgba(191,95,255,0.3)' : undefined,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Luxury badge */}
              {item.isLuxury && (
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'rgba(191,95,255,0.2)',
                    border: '1px solid rgba(191,95,255,0.4)',
                    borderRadius: '2px',
                    padding: '2px 8px',
                    fontSize: '9px',
                    fontFamily: 'Orbitron, monospace',
                    letterSpacing: '0.15em',
                    color: '#bf5fff',
                  }}
                >
                  LUXURY
                </div>
              )}

              <div style={{ fontSize: '32px', marginBottom: '12px' }}>
                {item.isHealing ? '🧪' : item.isLuxury ? '💎' : '🛒'}
              </div>

              <div style={{ fontSize: '15px', fontWeight: 700, color: item.isHealing ? '#00ff88' : '#e8eaf0', marginBottom: '4px', lineHeight: 1.4, paddingRight: item.isLuxury ? '60px' : 0 }}>
                {item.title} {item.isHealing && `(+${item.hpAmount} HP)`}
              </div>

              {item.description && (
                <div style={{ fontSize: '13px', color: '#8892a0', marginBottom: '16px', lineHeight: 1.4, paddingRight: item.isLuxury ? '60px' : 0 }}>
                  {item.description}
                </div>
              )}
              {!item.description && <div style={{ marginBottom: '12px' }} />}

              {/* Cost breakdown */}
              <div style={{ marginBottom: '16px' }}>
                {item.isLuxury ? (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#8892a0', marginBottom: '4px' }}>
                      <span>Sunk Cost</span>
                      <span className="font-mono" style={{ color: '#ffd700' }}>{item.baseCost.toLocaleString()}G</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#8892a0', marginBottom: '4px' }}>
                      <span>Savings Match</span>
                      <span className="font-mono" style={{ color: '#bf5fff' }}>{item.baseCost.toLocaleString()}G</span>
                    </div>
                    <div style={{ height: '1px', background: '#1e2030', margin: '8px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 700 }}>
                      <span style={{ color: '#e8eaf0' }}>TOTAL</span>
                      <span className="font-mono" style={{ color: '#ffd700' }}>{totalCost.toLocaleString()}G</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 700 }}>
                    <span style={{ color: '#8892a0' }}>COST</span>
                    <span className="font-mono" style={{ color: '#ffd700' }}>{item.baseCost.toLocaleString()}G</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  id={`buy-${item.id}`}
                  className={`btn ${affordable && !isBankrupt ? 'btn-solid-blue' : 'btn-blue'}`}
                  style={{ flex: 1, fontSize: '13px' }}
                  disabled={!affordable || isBankrupt}
                  onClick={() => setConfirmItem(item)}
                >
                  {affordable ? 'PURCHASE' : 'INSUFFICIENT'}
                </button>
                <button
                  className="btn btn-red"
                  style={{ padding: '8px 10px', fontSize: '11px' }}
                  onClick={() => deleteShopItem(item.id)}
                >
                  ✕
                </button>
              </div>

              {!affordable && (
                <div style={{ marginTop: '8px', fontSize: '11px', color: '#8892a0', fontFamily: 'Share Tech Mono, monospace' }}>
                  Need {(totalCost - gold).toLocaleString()}G more
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Savings Rule Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        style={{
          marginTop: '32px',
          padding: '16px 20px',
          background: 'rgba(0,240,255,0.03)',
          border: '1px solid rgba(0,240,255,0.1)',
          borderRadius: '4px',
        }}
      >
        <div className="font-orbitron" style={{ fontSize: '10px', color: '#8892a0', letterSpacing: '0.2em', marginBottom: '8px' }}>
          SYSTEM RULES
        </div>
        <div style={{ display: 'flex', gap: '24px', fontSize: '12px', color: '#8892a0' }}>
          <div>🔵 <strong style={{ color: '#00f0ff' }}>Standard items:</strong> Full cost routed to vault</div>
          <div>💜 <strong style={{ color: '#bf5fff' }}>Luxury items:</strong> 100% match rule — sunk cost + equal savings deposit</div>
        </div>
      </motion.div>

      {/* Confirm Purchase Modal */}
      <Modal isOpen={!!confirmItem} onClose={() => setConfirmItem(null)} title="CONFIRM PURCHASE">
        {confirmItem && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#e8eaf0' }}>{confirmItem.title}</div>
            {confirmItem.isHealing ? (
              <div style={{ fontSize: '13px', color: '#00ff88', lineHeight: 1.6, padding: '12px', background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: '3px' }}>
                <strong style={{ color: '#00ff88' }}>APOTHECARY PROTOCOL:</strong> This potion will restore <strong style={{ color: '#fff' }}>{confirmItem.hpAmount} HP</strong> immediately. Gold is consumed by the merchant.
              </div>
            ) : confirmItem.isLuxury ? (
              <div style={{ fontSize: '13px', color: '#8892a0', lineHeight: 1.6, padding: '12px', background: 'rgba(191,95,255,0.06)', border: '1px solid rgba(191,95,255,0.2)', borderRadius: '3px' }}>
                <strong style={{ color: '#bf5fff' }}>100% MATCH RULE:</strong> {confirmItem.baseCost.toLocaleString()}G sunk cost + {confirmItem.baseCost.toLocaleString()}G mandatory savings deposit = <strong style={{ color: '#ffd700' }}>{(confirmItem.baseCost * 2).toLocaleString()}G total</strong>
              </div>
            ) : (
              <div style={{ fontSize: '13px', color: '#8892a0', lineHeight: 1.6 }}>
                <strong style={{ color: '#ffd700' }}>{confirmItem.baseCost.toLocaleString()}G</strong> will be deducted and routed to your SBI savings vault.
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-solid-blue" style={{ flex: 1, padding: '12px' }} onClick={handlePurchase}>
                CONFIRM PURCHASE
              </button>
              <button className="btn btn-red" onClick={() => setConfirmItem(null)}>CANCEL</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Item Modal */}
      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="ADD SHOP ITEM">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '11px', color: '#8892a0', fontFamily: 'Orbitron, monospace', letterSpacing: '0.15em', display: 'block', marginBottom: '6px' }}>ITEM NAME</label>
            <input
              className="input-field"
              value={newItem.title}
              onChange={e => setNewItem(n => ({ ...n, title: e.target.value }))}
              placeholder="e.g., Movie Night"
            />
          </div>
          <div>
            <label style={{ fontSize: '11px', color: '#8892a0', fontFamily: 'Orbitron, monospace', letterSpacing: '0.15em', display: 'block', marginBottom: '6px' }}>DESCRIPTION (OPTIONAL)</label>
            <textarea
              className="input-field"
              value={newItem.description || ''}
              onChange={e => setNewItem(n => ({ ...n, description: e.target.value }))}
              placeholder="Enter item details..."
              style={{ minHeight: '60px', resize: 'vertical' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '11px', color: '#8892a0', fontFamily: 'Orbitron, monospace', letterSpacing: '0.15em', display: 'block', marginBottom: '6px' }}>BASE COST (GOLD)</label>
            <input
              className="input-field"
              type="number"
              value={newItem.baseCost}
              onChange={e => setNewItem(n => ({ ...n, baseCost: e.target.value }))}
              min="1"
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="checkbox"
                id="is-luxury"
                disabled={newItem.isHealing}
                checked={newItem.isLuxury}
                onChange={e => setNewItem(n => ({ ...n, isLuxury: e.target.checked }))}
                style={{ accentColor: '#bf5fff', width: '16px', height: '16px' }}
              />
              <label htmlFor="is-luxury" style={{ fontSize: '14px', color: newItem.isHealing ? '#3a3f52' : '#bf5fff', cursor: 'pointer', fontWeight: 600 }}>
                Luxury Item (100% Match Rule)
              </label>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid #1e2030', paddingTop: '12px' }}>
              <input
                type="checkbox"
                id="is-healing"
                disabled={newItem.isLuxury}
                checked={newItem.isHealing}
                onChange={e => setNewItem(n => ({ ...n, isHealing: e.target.checked }))}
                style={{ accentColor: '#00ff88', width: '16px', height: '16px' }}
              />
              <label htmlFor="is-healing" style={{ fontSize: '14px', color: newItem.isLuxury ? '#3a3f52' : '#00ff88', cursor: 'pointer', fontWeight: 600 }}>
                Healing Item (Apothecary Potion)
              </label>
            </div>

            {newItem.isHealing && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <label style={{ fontSize: '11px', color: '#00ff88', fontFamily: 'Orbitron, monospace', letterSpacing: '0.15em', display: 'block', marginBottom: '6px' }}>RECOVERY AMOUNT (HP)</label>
                <input
                  className="input-field"
                  type="number"
                  value={newItem.hpAmount}
                  onChange={e => setNewItem(n => ({ ...n, hpAmount: e.target.value }))}
                  min="1"
                  max="100"
                />
              </motion.div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button className="btn btn-solid-blue" style={{ flex: 1 }} onClick={handleAdd}>ADD ITEM</button>
            <button className="btn btn-red" onClick={() => setAddOpen(false)}>CANCEL</button>
          </div>
        </div>
      </Modal>
      </div>
    </PageTransition>
  );
}
