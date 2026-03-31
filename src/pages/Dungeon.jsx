import { useState, useEffect, useRef, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import Modal from '../components/Modal';
import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';

const PHASES = {
  idle: 'idle',
  running: 'running',
  paused: 'paused',
  done: 'done',
};

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function Dungeon() {
  const { routeTaxToVault, completeDungeon, playerStats } = useGame();

  const [durationMins, setDurationMins] = useState(90);
  const [draftDuration, setDraftDuration] = useState('90');
  const [phase, setPhase] = useState(PHASES.idle);
  const [secondsLeft, setSecondsLeft] = useState(90 * 60);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [fleeOpen, setFleeOpen] = useState(false);
  const [penaltyAmt, setPenaltyAmt] = useState('');
  const [fleeMsg, setFleeMsg] = useState('');
  const [editingDuration, setEditingDuration] = useState(false);

  const intervalRef = useRef(null);

  const totalSeconds = durationMins * 60;
  const progress = Math.min(100, (secondsElapsed / totalSeconds) * 100);

  const tick = useCallback(() => {
    setSecondsLeft(s => {
      if (s <= 1) {
        clearInterval(intervalRef.current);
        setPhase(PHASES.done);
        return 0;
      }
      return s - 1;
    });
    setSecondsElapsed(e => e + 1);
  }, []);

  useEffect(() => {
    if (phase === PHASES.done) {
      completeDungeon(durationMins);
    }
  }, [phase]);

  function startDungeon() {
    setSecondsLeft(durationMins * 60);
    setSecondsElapsed(0);
    setPhase(PHASES.running);
    intervalRef.current = setInterval(tick, 1000);
  }

  function pauseDungeon() {
    clearInterval(intervalRef.current);
    setPhase(PHASES.paused);
  }

  function resumeDungeon() {
    setPhase(PHASES.running);
    intervalRef.current = setInterval(tick, 1000);
  }

  function resetDungeon() {
    clearInterval(intervalRef.current);
    setPhase(PHASES.idle);
    setSecondsLeft(durationMins * 60);
    setSecondsElapsed(0);
  }

  function openFlee() {
    clearInterval(intervalRef.current);
    setPhase(PHASES.paused);
    setFleeOpen(true);
  }

  function executeFlee() {
    const amt = Number(penaltyAmt);
    if (isNaN(amt) || amt < 0) { setFleeMsg('Enter a valid amount.'); return; }
    if (amt > 0) {
      if (playerStats.gold < amt) { setFleeMsg('Insufficient Gold.'); return; }
      routeTaxToVault(amt);
    }
    setFleeOpen(false);
    resetDungeon();
    setPenaltyAmt('');
    setFleeMsg('');
  }

  function applyDuration() {
    const mins = Number(draftDuration);
    if (isNaN(mins) || mins < 1) return;
    setDurationMins(mins);
    setSecondsLeft(mins * 60);
    setSecondsElapsed(0);
    setEditingDuration(false);
  }

  const circumference = 2 * Math.PI * 120;
  const strokeDash = circumference - (progress / 100) * circumference;

  return (
    <PageTransition>
      <div className="page-wrap" style={{ maxWidth: '700px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div className="font-orbitron" style={{ fontSize: '10px', color: '#8892a0', letterSpacing: '0.3em', marginBottom: '6px' }}>
          DUNGEON // DEEP WORK PROTOCOL
        </div>
        <h1 className="font-orbitron" style={{ fontSize: '28px', fontWeight: 900, color: '#fff', margin: 0 }}>
          ENTER THE <span style={{ color: '#00f0ff' }}>DUNGEON</span>
        </h1>
        <div style={{ marginTop: '8px', fontSize: '13px', color: '#8892a0' }}>
          Full-focus work session. No escape without penalty.
        </div>
      </div>

      {/* Timer Circle — fluid, scales with screen */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}
      >
        <div className="dungeon-timer-wrap">
          <svg className="dungeon-timer-svg" viewBox="0 0 280 280">
            {/* Background circle */}
            <circle cx="140" cy="140" r="120" fill="none" stroke="#1e2030" strokeWidth="8" />
            {/* Progress circle */}
            <circle
              cx="140"
              cy="140"
              r="120"
              fill="none"
              stroke={phase === PHASES.done ? '#00ff88' : phase === PHASES.running ? '#00f0ff' : '#3a3f52'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDash}
              style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease' }}
            />
          </svg>

          {/* Center content */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {phase === PHASES.done ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'clamp(28px, 8vw, 40px)', marginBottom: '8px' }}>🏆</div>
                <div className="font-orbitron glow-green" style={{ fontSize: 'clamp(14px, 4vw, 18px)', fontWeight: 900, color: '#00ff88' }}>
                  CLEARED!
                </div>
              </div>
            ) : (
              <>
                <div
                  className="font-mono dungeon-timer-text"
                  style={{
                    fontWeight: 700,
                    color: phase === PHASES.running ? '#00f0ff' : '#e8eaf0',
                    textShadow: phase === PHASES.running ? '0 0 20px rgba(0,240,255,0.6)' : 'none',
                    letterSpacing: '0.05em',
                    lineHeight: 1,
                  }}
                >
                  {formatTime(secondsLeft)}
                </div>
                <div style={{ fontSize: 'clamp(9px, 2vw, 11px)', color: '#8892a0', fontFamily: 'Orbitron, monospace', letterSpacing: '0.2em', marginTop: '8px' }}>
                  {phase === PHASES.idle ? 'READY' : phase === PHASES.paused ? 'PAUSED' : 'ACTIVE'}
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Duration Editor */}
      {phase === PHASES.idle && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          {editingDuration ? (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                className="input-field"
                type="number"
                value={draftDuration}
                onChange={e => setDraftDuration(e.target.value)}
                style={{ width: '80px', textAlign: 'center', fontSize: '16px' }}
                min="1"
                autoFocus
              />
              <span style={{ color: '#8892a0', fontFamily: 'Share Tech Mono, monospace', fontSize: '13px' }}>MIN</span>
              <button className="btn btn-blue" style={{ padding: '6px 14px' }} onClick={applyDuration}>SET</button>
              <button className="btn" style={{ padding: '6px 12px', color: '#8892a0', border: '1px solid #1e2030' }} onClick={() => setEditingDuration(false)}>✕</button>
            </div>
          ) : (
            <button
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8892a0', fontFamily: 'Share Tech Mono, monospace', fontSize: '14px' }}
              onClick={() => { setDraftDuration(String(durationMins)); setEditingDuration(true); }}
            >
              ⏱ Duration: {durationMins} min — <span style={{ color: '#00f0ff' }}>EDIT</span>
            </button>
          )}
        </div>
      )}

      {/* Rewards Preview */}
      <div
        style={{
          background: 'rgba(0,240,255,0.04)',
          border: '1px solid rgba(0,240,255,0.15)',
          borderRadius: '4px',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          gap: '20px',
          justifyContent: 'center',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: '#8892a0', fontFamily: 'Orbitron, monospace', letterSpacing: '0.15em', marginBottom: '4px' }}>INT GAIN</div>
          <div className="font-mono glow-blue" style={{ fontSize: '22px', color: '#00f0ff', fontWeight: 700 }}>
            +{(durationMins / 10).toFixed(1)}
          </div>
        </div>
        <div style={{ width: '1px', background: '#1e2030' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: '#8892a0', fontFamily: 'Orbitron, monospace', letterSpacing: '0.15em', marginBottom: '4px' }}>GOLD GAIN</div>
          <div className="font-mono glow-gold" style={{ fontSize: '22px', color: '#ffd700', fontWeight: 700 }}>
            +{durationMins * 2}G
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        {phase === PHASES.idle && (
          <button id="enter-dungeon-btn" className="btn btn-solid-blue" style={{ fontSize: '16px', padding: '14px 40px', letterSpacing: '0.15em' }} onClick={startDungeon}>
            ⚔ ENTER DUNGEON
          </button>
        )}
        {phase === PHASES.running && (
          <>
            <button className="btn btn-blue" style={{ fontSize: '14px', padding: '12px 28px' }} onClick={pauseDungeon}>
              ⏸ PAUSE
            </button>
            <button id="flee-dungeon-btn" className="btn btn-solid-red" style={{ fontSize: '14px', padding: '12px 28px', letterSpacing: '0.1em' }} onClick={openFlee}>
              🏳 FLEE DUNGEON
            </button>
          </>
        )}
        {phase === PHASES.paused && (
          <>
            <button className="btn btn-solid-blue" style={{ fontSize: '14px', padding: '12px 28px' }} onClick={resumeDungeon}>
              ▶ RESUME
            </button>
            <button className="btn btn-red" style={{ fontSize: '14px', padding: '12px 28px' }} onClick={resetDungeon}>
              ABANDON
            </button>
          </>
        )}
        {phase === PHASES.done && (
          <button className="btn btn-solid-blue" style={{ fontSize: '14px', padding: '12px 28px' }} onClick={resetDungeon}>
            NEW SESSION
          </button>
        )}
      </div>

      {/* Flee Modal */}
      <Modal isOpen={fleeOpen} onClose={() => { setFleeOpen(false); setPenaltyAmt(''); setFleeMsg(''); }} title="COWARDICE DETECTED" variant="red">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '13px', color: '#ff6680', lineHeight: 1.6 }}>
            You fled the dungeon at <strong style={{ color: '#fff' }}>{formatTime(secondsElapsed)}</strong> elapsed.
            A cowardice penalty will be routed to your vault. Leave blank or 0 to escape without penalty.
          </div>
          <div>
            <label style={{ fontSize: '11px', color: '#ff003c', fontFamily: 'Orbitron, monospace', letterSpacing: '0.15em', display: 'block', marginBottom: '6px' }}>
              COWARDICE TAX (GOLD)
            </label>
            <input
              className="input-field"
              type="number"
              value={penaltyAmt}
              onChange={e => setPenaltyAmt(e.target.value)}
              placeholder="0"
              min="0"
              step="0.1"
              style={{ borderColor: 'rgba(255,0,60,0.4)' }}
              autoFocus
            />
          </div>
          {fleeMsg && <div style={{ color: '#ff003c', fontSize: '12px', fontFamily: 'Share Tech Mono, monospace' }}>{fleeMsg}</div>}
          <button className="btn btn-solid-red" style={{ width: '100%', padding: '12px' }} onClick={executeFlee}>
            CONFIRM RETREAT
          </button>
        </div>
      </Modal>
      </div>
    </PageTransition>
  );
}
