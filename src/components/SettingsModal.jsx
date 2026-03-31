import React, { useState } from 'react';
import Modal from './Modal';
import { useGame } from '../context/GameContext';

export default function SettingsModal({ isOpen, onClose }) {
  const { playerStats, setManualGold, setGoldCap, executeProtocolZero, triggerScreenShake, logout, setDayEndTime } = useGame();
  
  const [goldInput, setGoldInput] = useState(playerStats?.gold || 0);
  const [goldSuccess, setGoldSuccess] = useState(false);
  
  const [goldCapInput, setGoldCapInput] = useState(playerStats?.goldCap || 0);
  const [capSuccess, setCapSuccess] = useState(false);

  const [dayEndTimeInput, setDayEndTimeInput] = useState(playerStats?.dayEndTime || '00:00');
  const [timeSuccess, setTimeSuccess] = useState(false);
  
  const [wipeMode, setWipeMode] = useState(false);
  const [wipeInput, setWipeInput] = useState('');

  // Sync when opened
  React.useEffect(() => {
    if (isOpen) {
      setGoldInput(playerStats?.gold || 0);
      setGoldCapInput(playerStats?.goldCap || 0);
      setDayEndTimeInput(playerStats?.dayEndTime || '00:00');
      setWipeMode(false);
      setWipeInput('');
      setGoldSuccess(false);
      setCapSuccess(false);
      setTimeSuccess(false);
    }
  }, [isOpen, playerStats?.gold, playerStats?.goldCap, playerStats?.dayEndTime]);

  function handleUpdateGold() {
    const val = Number(goldInput);
    if (!isNaN(val)) {
      setManualGold(val);
      setGoldSuccess(true);
      setTimeout(() => setGoldSuccess(false), 2000);
    }
  }

  function handleUpdateCap() {
    const val = Number(goldCapInput);
    if (!isNaN(val)) {
      setGoldCap(val);
      setCapSuccess(true);
      setTimeout(() => setCapSuccess(false), 2000);
    }
  }

  function handleUpdateTime() {
    setDayEndTime(dayEndTimeInput);
    setTimeSuccess(true);
    setTimeout(() => setTimeSuccess(false), 2000);
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
                step="0.1"
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

        {/* System Quota (Gold Cap) */}
        <div style={{ background: '#0a0b10', padding: '16px', borderRadius: '4px', border: '1px solid #1e2030' }}>
          <div className="font-orbitron" style={{ fontSize: '11px', color: '#ffd700', letterSpacing: '0.15em', marginBottom: '12px' }}>
            SYSTEM QUOTA INJECTION
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '10px', color: '#8892a0', display: 'block', marginBottom: '6px', fontFamily: 'Share Tech Mono, monospace' }}>
                TOTAL EARNABLE GOLD (CAP)
              </label>
              <input
                className="input-field font-mono"
                type="number"
                value={goldCapInput}
                onChange={e => setGoldCapInput(e.target.value)}
                placeholder="Set 0 for No Limit"
                step="0.1"
                style={{ 
                  borderColor: capSuccess ? '#ffd700' : '#1e2030',
                  boxShadow: capSuccess ? '0 0 10px rgba(255,215,0,0.3)' : 'none',
                  transition: 'all 0.3s'
                }}
              />
            </div>
            <button 
              className="btn btn-solid-gold"
              onClick={handleUpdateCap}
              style={{ 
                background: capSuccess ? '#ffd700' : 'rgba(255,215,0,0.1)', 
                border: '1px solid #ffd700',
                color: capSuccess ? '#000' : '#ffd700', 
                padding: '10px 16px' 
              }}
            >
              {capSuccess ? 'INJECTED' : 'UPDATE QUOTA'}
            </button>
          </div>
          <div style={{ fontSize: '10px', color: '#555', marginTop: '8px', fontFamily: 'Share Tech Mono, monospace' }}>
            * Setting a cap limits further earnings. Spending gold shrinks the cap.
          </div>
        </div>

        {/* Circadian Override (Day End Time) */}
        <div style={{ background: '#0a0b10', padding: '16px', borderRadius: '4px', border: '1px solid #1e2030' }}>
          <div className="font-orbitron" style={{ fontSize: '11px', color: '#00f0ff', letterSpacing: '0.15em', marginBottom: '12px' }}>
            CIRCADIAN OVERRIDE
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '10px', color: '#8892a0', display: 'block', marginBottom: '6px', fontFamily: 'Share Tech Mono, monospace' }}>
                PROTOCOL DAY END TIME ({(() => {
                  const [h, m] = dayEndTimeInput.split(':');
                  const hh = parseInt(h);
                  const suffix = hh >= 12 ? 'PM' : 'AM';
                  const h12 = hh % 12 || 12;
                  return `${h12}:${m} ${suffix}`;
                })()})
              </label>
              <input
                className="input-field font-mono"
                type="time"
                value={dayEndTimeInput}
                onChange={e => setDayEndTimeInput(e.target.value)}
                style={{ 
                  borderColor: timeSuccess ? '#00f0ff' : '#1e2030',
                  boxShadow: timeSuccess ? '0 0 10px rgba(0,240,255,0.3)' : 'none',
                  transition: 'all 0.3s',
                  color: '#00f0ff'
                }}
              />
            </div>
            <button 
              className="btn btn-solid-blue"
              onClick={handleUpdateTime}
              style={{ background: timeSuccess ? '#00f0ff' : undefined, color: timeSuccess ? '#000' : undefined, padding: '10px 16px' }}
            >
              {timeSuccess ? 'SYNCHRONIZED' : 'UPDATE CLOCK'}
            </button>
          </div>
          <div style={{ fontSize: '10px', color: '#555', marginTop: '8px', fontFamily: 'Share Tech Mono, monospace' }}>
            * Defines when daily missions reset. Recommended for late-night operators.
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
