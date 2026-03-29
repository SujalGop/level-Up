import { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import AnimatedCounter from './AnimatedCounter';
import SettingsModal from './SettingsModal';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: '◈', desc: 'Player Status' },
  { path: '/quests', label: 'Daily Quests', icon: '⚔', desc: 'The Grind' },
  { path: '/skills', label: 'Skill Books', icon: '📖', desc: 'Codex' },
  { path: '/dungeon', label: 'Dungeon', icon: '🏴', desc: 'Deep Work' },
  { path: '/shop', label: 'Shop', icon: '💎', desc: 'Savings Engine' },
  { path: '/milestones', label: 'Milestones', icon: '🏆', desc: 'Job Quests' },
  { path: '/vault', label: 'Guild Vault', icon: '🏦', desc: 'Savings' },
];

export default function Sidebar({ onClose }) {
  const { playerStats } = useGame();
  const { gold, burnoutDebuff, hp, sbiSavingsMandate, name, class: playerClass } = playerStats;
  
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  const [hpFlash, setHpFlash] = useState(false);
  const prevHpRef = useRef(hp);

  useEffect(() => {
    if (hp < prevHpRef.current) {
      setHpFlash(true);
      setTimeout(() => setHpFlash(false), 300);
    }
    prevHpRef.current = hp;
  }, [hp]);

  return (
    <aside
      style={{
        width: '220px',
        minWidth: '220px',
        background: '#0d0e14',
        borderRight: '1px solid #1e2030',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Mobile close button */}
      <button className="sidebar-close-btn" onClick={onClose} aria-label="Close sidebar">✕</button>
      {/* Logo */}
      <div
        style={{
          padding: '24px 16px 16px',
          borderBottom: '1px solid #1e2030',
        }}
      >
        <div className="font-orbitron" style={{ fontSize: '11px', color: '#8892a0', letterSpacing: '0.2em', marginBottom: '4px' }}>
          THE SYSTEM
        </div>
        <div className="font-orbitron glow-blue" style={{ fontSize: '20px', fontWeight: 900, color: '#00f0ff' }}>
          {name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
          <button
            onClick={() => setSettingsOpen(true)}
            style={{
              background: 'rgba(0,240,255,0.1)',
              border: '1px solid rgba(0,240,255,0.3)',
              borderRadius: '2px',
              padding: '1px 8px',
              fontSize: '11px',
              fontWeight: 700,
              color: '#00f0ff',
              fontFamily: 'Share Tech Mono, monospace',
              letterSpacing: '0.1em',
              cursor: 'pointer',
            }}
          >
            {playerClass}
          </button>
          {burnoutDebuff && (
            <span
              style={{
                background: 'rgba(255,0,60,0.15)',
                border: '1px solid rgba(255,0,60,0.4)',
                borderRadius: '2px',
                padding: '1px 6px',
                fontSize: '10px',
                fontWeight: 700,
                color: '#ff003c',
                fontFamily: 'Share Tech Mono, monospace',
                animation: 'pulse-red 1.5s ease-in-out infinite',
              }}
            >
              BURNOUT
            </span>
          )}
        </div>
      </div>

      {/* Gold Display */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #1e2030' }}>
        <div style={{ fontSize: '11px', color: '#8892a0', fontFamily: 'Orbitron, monospace', letterSpacing: '0.15em', marginBottom: '6px' }}>
          BALANCE
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', flexWrap: 'wrap' }}>
          <AnimatedCounter
            value={gold}
            suffix={playerStats.goldCap > 0 ? '' : 'G'}
            className="font-mono glow-gold text-[22px] font-bold text-[#ffd700] tracking-wider"
          />
          {playerStats.goldCap > 0 && (
            <span style={{ fontSize: '14px', color: '#8892a0', fontFamily: 'Share Tech Mono, monospace' }}>
              / <AnimatedCounter value={playerStats.goldCap} suffix="G" />
            </span>
          )}
        </div>

        {/* HP bar */}
        <div style={{ marginTop: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
            <span style={{ fontSize: '10px', color: hp < 50 ? '#ff003c' : '#8892a0', fontFamily: 'Share Tech Mono, monospace' }}>HP</span>
            <span style={{ fontSize: '10px', color: hp < 50 ? '#ff003c' : '#8892a0', fontFamily: 'Share Tech Mono, monospace' }}>{hp}/100</span>
          </div>
          <div className="progress-bar-track">
            <motion.div
              className="progress-bar-fill"
              animate={{
                width: `${hp}%`,
                backgroundColor: hpFlash ? '#ffffff' : (hp < 30 ? '#ff003c' : hp < 60 ? '#ff8800' : '#00ff88'),
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* SBI Mandate */}
        {sbiSavingsMandate > 0 && (
          <div
            style={{
              marginTop: '8px',
              padding: '6px 8px',
              background: 'rgba(255,0,60,0.08)',
              border: '1px solid rgba(255,0,60,0.25)',
              borderRadius: '3px',
            }}
          >
            <div style={{ fontSize: '9px', color: '#ff003c', fontFamily: 'Orbitron, monospace', letterSpacing: '0.1em', marginBottom: '2px' }}>
              SBI MANDATE
            </div>
            <div className="font-mono" style={{ fontSize: '13px', color: '#ff003c', fontWeight: 700 }}>
              ₹{sbiSavingsMandate.toLocaleString()}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span style={{ fontSize: '16px', minWidth: '20px', textAlign: 'center' }}>{item.icon}</span>
            <div>
              <div style={{ lineHeight: 1.2 }}>{item.label}</div>
              <div style={{ fontSize: '10px', opacity: 0.5, textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}>{item.desc}</div>
            </div>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid #1e2030',
          fontSize: '10px',
          color: '#3a3f52',
          fontFamily: 'Share Tech Mono, monospace',
          letterSpacing: '0.05em',
        }}
      >
        v1.0.0 // SYSTEM ACTIVE
      </div>
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </aside>
  );
}
