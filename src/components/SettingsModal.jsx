import React, { useState } from 'react';
import Modal from './Modal';
import { useGame } from '../context/GameContext';

export default function SettingsModal({ isOpen, onClose }) {
  const { playerStats, setManualGold, executeProtocolZero, triggerScreenShake, logout } = useGame();
  
  const [goldInput, setGoldInput] = useState(playerStats?.gold || 0);
  const [goldSuccess, setGoldSuccess] = useState(false);
  
  const [wipeMode, setWipeMode] = useState(false);
  const [wipeInput, setWipeInput] = useState('');

  // Sync when opened
  React.useEffect(() => {
    if (isOpen) {
      setGoldInput(playerStats?.gold || 0);
      setWipeMode(false);
      setWipeInput('');
      setGoldSuccess(false);
    }
  }, [isOpen, playerStats?.gold]);

  function handleUpdateGold() {
    const val = Number(goldInput);
    if (!isNaN(val)) {
      setManualGold(val);
      setGoldSuccess(true);
      setTimeout(() => setGoldSuccess(false), 2000);
    }
  }

  function handleProtocolZero() {
    if (wipeInput === 'ERASE SYSTEM') {
      triggerScreenShake();
      executeProtocolZero();
      setTimeout(() => {
        window.location.reload();
      }, 500); // give it a short delay for the shake effect
    }
  }

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="SYSTEM OVERRIDE" variant="red">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Memory Injection (Gold) */}
        <div style={{ background: '#0a0b10', padding: '16px', borderRadius: '4px', border: '1px solid #1e2030' }}>
          <div className="font-orbitron" style={{ fontSize: '11px', color: '#00f0ff', letterSpacing: '0.15em', marginBottom: '12px' }}>
            MANUAL GOLD INJECTION
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '10px', color: '#8892a0', display: 'block', marginBottom: '6px', fontFamily: 'Share Tech Mono, monospace' }}>
                CURRENT BALANCE (G)
              </label>
              <input
                className="input-field font-mono"
                type="number"
                value={goldInput}
                onChange={e => setGoldInput(e.target.value)}
                style={{ 
                  borderColor: goldSuccess ? '#00ff88' : '#1e2030',
                  boxShadow: goldSuccess ? '0 0 10px rgba(0,255,136,0.3)' : 'none',
                  transition: 'all 0.3s'
                }}
              />
            </div>
            <button 
              className="btn btn-solid-blue"
              onClick={handleUpdateGold}
              style={{ background: goldSuccess ? '#00ff88' : undefined, color: goldSuccess ? '#000' : undefined, padding: '10px 16px' }}
            >
              {goldSuccess ? 'UPDATED' : 'UPDATE BALANCE'}
            </button>
          </div>
        </div>

        {/* Protocol Zero (Total Wipe) */}
        <div style={{ background: '#0a0b10', padding: '16px', borderRadius: '4px', border: '1px solid rgba(255,0,60,0.3)' }}>
          <div className="font-orbitron" style={{ fontSize: '11px', color: '#ff003c', letterSpacing: '0.15em', marginBottom: '8px' }}>
            ⚠ PROTOCOL ZERO
          </div>
          <div style={{ fontSize: '12px', color: '#ff6680', lineHeight: 1.5, marginBottom: '16px' }}>
            WARNING: This will completely wipe all local storage data—including history, gold, stats, missions, and shop items. The system will be reset to an absolute zero state.
          </div>

          {!wipeMode ? (
            <button 
              className="btn btn-solid-red" 
              style={{ width: '100%', padding: '12px', letterSpacing: '0.1em' }}
              onClick={() => setWipeMode(true)}
            >
              INITIATE PROTOCOL ZERO (WIPE ALL DATA)
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '10px', color: '#ff003c', display: 'block', fontFamily: 'Share Tech Mono, monospace' }}>
                TYPE "ERASE SYSTEM" TO CONFIRM
              </label>
              <input
                className="input-field font-mono"
                type="text"
                value={wipeInput}
                onChange={e => setWipeInput(e.target.value)}
                placeholder="ERASE SYSTEM"
                style={{ borderColor: '#ff003c', color: '#ff003c' }}
                autoFocus
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button 
                  className="btn btn-solid-red" 
                  style={{ flex: 1, opacity: wipeInput === 'ERASE SYSTEM' ? 1 : 0.5 }}
                  disabled={wipeInput !== 'ERASE SYSTEM'}
                  onClick={handleProtocolZero}
                >
                  EXECUTE WIPE
                </button>
                <button className="btn" style={{ padding: '8px 16px', border: '1px solid #1e2030' }} onClick={() => { setWipeMode(false); setWipeInput(''); }}>
                  ABORT
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Auth Actions */}
        <div style={{ padding: '12px 16px', border: '1px solid #1e2030', borderRadius: '4px', textAlign: 'center' }}>
          <button 
            className="btn" 
            style={{ color: '#8892a0', fontSize: '12px', letterSpacing: '0.15em', fontWeight: 700 }}
            onClick={() => {
              onClose();
              logout();
            }}
          >
            ← SIGN OUT OF SYSTEM
          </button>
        </div>

      </div>
    </Modal>
  );
}
