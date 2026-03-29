import { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import StatBar from '../components/StatBar';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import AnimatedCounter from '../components/AnimatedCounter';
import BossCountdown from '../components/BossCountdown';
import QuickReview from '../components/QuickReview';

const CLASS_THRESHOLDS = [
  { total: 0, class: 'E-Rank' },
  { total: 100, class: 'D-Rank' },
  { total: 250, class: 'C-Rank' },
  { total: 500, class: 'B-Rank' },
  { total: 900, class: 'A-Rank' },
  { total: 1500, class: 'S-Rank' },
  { total: 2500, class: 'National-Level' },
];

function deriveClass(stats) {
  const total = stats.STR + stats.INT + stats.VIT + stats.PER;
  let cls = 'E-Rank';
  for (const t of CLASS_THRESHOLDS) {
    if (total >= t.total) cls = t.class;
  }
  return { cls, total };
}

export default function Dashboard() {
  const { playerStats, updateHP, setPlayerName, dismissNotification } = useGame();
  const { name, gold, hp, burnoutDebuff, STR, INT, VIT, PER, sbiSavingsMandate, perfectDayAchieved } = playerStats;
  const { cls, total: totalStats } = deriveClass(playerStats);

  const [hpFlash, setHpFlash] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  const prevHpRef = useRef(hp);
  useEffect(() => {
    if (hp < prevHpRef.current) {
      setHpFlash(true);
      setTimeout(() => setHpFlash(false), 300);
    }
    prevHpRef.current = hp;
  }, [hp]);

  const completedTodayCount = 0; // would track daily

  return (
    <PageTransition>
      <div className="page-wrap" style={{ maxWidth: '100%', width: '100%', padding: '0 24px' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '32px' }}
      >
        <div className="font-orbitron" style={{ fontSize: '10px', color: '#8892a0', letterSpacing: '0.3em', marginBottom: '6px' }}>
          PLAYER STATUS // SYSTEM INTERFACE v1.0
        </div>
        <h1 className="font-orbitron glow-blue" style={{ fontSize: '32px', fontWeight: 900, color: '#00f0ff', margin: 0, display: 'flex', alignItems: 'center' }}>
          {isEditingName ? (
            <input 
              autoFocus
              value={tempName}
              onChange={e => setTempName(e.target.value)}
              onBlur={() => {
                const trimmed = tempName.trim();
                if (trimmed && trimmed !== name) {
                  setPlayerName(trimmed);
                }
                setIsEditingName(false);
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  const trimmed = tempName.trim();
                  if (trimmed && trimmed !== name) {
                    setPlayerName(trimmed);
                  }
                  setIsEditingName(false);
                }
                if (e.key === 'Escape') setIsEditingName(false);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: '2px dashed #00f0ff',
                color: '#00f0ff',
                outline: 'none',
                maxWidth: '400px',
                textTransform: 'uppercase',
                fontFamily: 'inherit',
                fontSize: 'inherit',
                fontWeight: 'inherit',
                textShadow: 'inherit',
                padding: 0,
                margin: 0
              }}
            />
          ) : (
            <span 
              onClick={() => {
                setTempName(name);
                setIsEditingName(true);
              }}
              style={{ cursor: 'pointer', borderBottom: '2px dashed transparent' }}
              onMouseEnter={(e) => e.target.style.borderBottom = '2px dashed #00f0ff'}
              onMouseLeave={(e) => e.target.style.borderBottom = '2px dashed transparent'}
              title="Click to edit name"
            >
              {name.toUpperCase()}
            </span>
          )}
        </h1>
      </motion.div>

      {/* Burnout Warning */}
      {burnoutDebuff && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            background: 'rgba(255,0,60,0.08)',
            border: '2px solid #ff003c',
            borderRadius: '4px',
            padding: '20px 24px',
            marginBottom: '24px',
            animation: 'pulse-red 2s ease-in-out infinite',
          }}
        >
          <div className="font-orbitron" style={{ fontSize: '16px', fontWeight: 900, color: '#ff003c', letterSpacing: '0.1em', marginBottom: '8px' }}>
            ☠ BURNOUT DEBUFF ACTIVE
          </div>
          <div style={{ color: '#ff6680', fontSize: '14px', lineHeight: 1.5 }}>
            All XP/Gold gains <strong>HALVED</strong> until HP is restored above 50.
            Complete Vitality quests to recover.
          </div>
        </motion.div>
      )}

      {/* Perfect Day Notification */}
      <AnimatePresence>
        {perfectDayAchieved && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="card"
            style={{
              background: 'rgba(255,215,0,0.05)',
              border: '2px solid #ffd700',
              padding: '20px 24px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 0 20px rgba(255,215,0,0.2)',
            }}
          >
            {/* Animated background flare */}
            <motion.div 
              animate={{ opacity: [0.1, 0.3, 0.1], x: ['-100%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.2), transparent)', pointerEvents: 'none' }}
            />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="font-orbitron" style={{ fontSize: '18px', fontWeight: 900, color: '#ffd700', letterSpacing: '0.15em', marginBottom: '4px' }}>
                  🌟 PERFECT DAY ACHIEVED
                </div>
                <div style={{ color: '#fff', fontSize: '14px', fontFamily: 'Share Tech Mono, monospace' }}>
                  SYSTEM EVALUATION: ALL DAILY MISSIONS ACCOMPLISHED. <span style={{ color: '#00ff88' }}>+15 HP RECOVERED.</span>
                </div>
              </div>
              <button 
                className="btn btn-gold" 
                onClick={dismissNotification}
                style={{ padding: '8px 16px', background: '#ffd700', color: '#000', fontSize: '11px', fontWeight: 900 }}
              >
                ACKNOWLEDGE
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
        {/* Left Col */}
        <div className="lg:col-span-1">
          {/* Class Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
            style={{ padding: '24px', marginBottom: '20px' }}
          >
            <div className="section-title">RANK & CLASS</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  background: 'rgba(0,240,255,0.08)',
                  border: '2px solid rgba(0,240,255,0.4)',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                }}
              >
                ◈
              </div>
              <div>
                <div className="font-orbitron glow-blue" style={{ fontSize: '24px', fontWeight: 900, color: '#00f0ff' }}>
                  {cls}
                </div>
                <div style={{ fontSize: '12px', color: '#8892a0', fontFamily: 'Share Tech Mono, monospace' }}>
                  TOTAL STATS: {totalStats}
                </div>
              </div>
            </div>

            {/* Class progression */}
            <div style={{ fontSize: '11px', color: '#8892a0', marginBottom: '6px', fontFamily: 'Orbitron, monospace', letterSpacing: '0.1em' }}>
              NEXT RANK PROGRESS
            </div>
            {CLASS_THRESHOLDS.slice(1).map((threshold, i) => {
              if (totalStats >= threshold.total) return null;
              const prev = CLASS_THRESHOLDS[i].total;
              const pct = Math.min(100, ((totalStats - prev) / (threshold.total - prev)) * 100);
              return (
                <div key={threshold.class}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', color: '#00f0ff', fontFamily: 'Share Tech Mono, monospace' }}>{threshold.class}</span>
                    <span style={{ fontSize: '11px', color: '#8892a0', fontFamily: 'Share Tech Mono, monospace' }}>{totalStats}/{threshold.total}</span>
                  </div>
                  <div className="progress-bar-track">
                    <div className="progress-bar-fill" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #0066ff, #00f0ff)' }} />
                  </div>
                </div>
              );
            }).filter(Boolean)[0]}
          </motion.div>

          {/* Gold & SBI Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
            style={{ padding: '24px', marginBottom: '20px' }}
          >
            <div className="section-title">TREASURY</div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', color: '#8892a0', fontFamily: 'Orbitron, monospace', letterSpacing: '0.1em', marginBottom: '4px' }}>GOLD</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <AnimatedCounter
                    value={gold}
                    suffix={playerStats.goldCap > 0 ? '' : 'G'}
                    className="font-mono glow-gold text-[32px] font-bold text-[#ffd700]"
                  />
                  {playerStats.goldCap > 0 && (
                    <span style={{ fontSize: '18px', color: '#8892a0', fontFamily: 'Share Tech Mono, monospace' }}>
                      / <AnimatedCounter value={playerStats.goldCap} suffix="G" />
                    </span>
                  )}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', color: '#ff003c', fontFamily: 'Orbitron, monospace', letterSpacing: '0.1em', marginBottom: '4px' }}>SBI MANDATE</div>
                <div className="font-mono" style={{ fontSize: '32px', fontWeight: 700, color: '#ff003c', textShadow: '0 0 12px rgba(255,0,60,0.6)' }}>
                  ₹{sbiSavingsMandate.toLocaleString()}
                </div>
                <div style={{ fontSize: '10px', color: '#ff6680', marginTop: '4px' }}>
                  TRANSFER TO BANK
                </div>
              </div>
            </div>
          </motion.div>

          {/* HP Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className={`card ${burnoutDebuff ? 'card-red' : ''}`}
            style={{ padding: '24px' }}
          >
            <div className="section-title">HEALTH POINTS</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '12px' }}>
              <div>
                <div
                  className="font-mono"
                  style={{
                    fontSize: '48px',
                    fontWeight: 700,
                    color: hp < 30 ? '#ff003c' : hp < 60 ? '#ff8800' : '#00ff88',
                    textShadow: hp < 30 ? '0 0 20px rgba(255,0,60,0.8)' : '0 0 16px rgba(0,255,136,0.6)',
                    lineHeight: 1,
                  }}
                >
                  {hp}
                </div>
                <div style={{ fontSize: '11px', color: '#8892a0', fontFamily: 'Share Tech Mono, monospace' }}>/100 HP</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button className="btn btn-green" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={() => updateHP(10)}>
                  +10 HP
                </button>
                <button className="btn btn-red" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={() => updateHP(-10)}>
                  -10 HP
                </button>
              </div>
            </div>
            <div style={{ position: 'relative', height: '16px', background: '#0a0b10', border: '1px solid #1e2030', borderRadius: '3px', overflow: 'hidden' }}>
              <motion.div
                animate={{
                  width: `${hp}%`,
                  background: hpFlash ? '#ffffff' : (hp < 30 ? 'linear-gradient(90deg, #8b0000, #ff003c)' : hp < 60 ? 'linear-gradient(90deg, #8b4500, #ff8800)' : 'linear-gradient(90deg, #006644, #00ff88)')
                }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                style={{
                  height: '100%',
                  boxShadow: hp < 30 ? '0 0 12px rgba(255,0,60,0.6)' : '0 0 12px rgba(0,255,136,0.6)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontFamily: 'Share Tech Mono, monospace',
                  color: '#fff',
                  fontWeight: 700,
                }}
              >
                {hp < 50 ? '⚠ CRITICAL' : hp < 80 ? 'RECOVERING' : 'OPTIMAL'}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Middle Col - Stat Bars */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="card"
            style={{ padding: '24px', marginBottom: '20px' }}
          >
            <div className="section-title">COMBAT STATS</div>
            <StatBar stat="STR" value={playerStats.STR} />
            <StatBar stat="INT" value={playerStats.INT} />
            <StatBar stat="VIT" value={playerStats.VIT} />
            <StatBar stat="PER" value={playerStats.PER} />
          </motion.div>

          {/* Quick Review Module */}
          <QuickReview />
        </div>

        {/* Right Col - Impending Threats */}
        <div className="lg:col-span-1">
          <BossCountdown />
        </div>
      </div>
      </div>
    </PageTransition>
  );
}
