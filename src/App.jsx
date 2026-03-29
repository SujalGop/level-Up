import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GameProvider } from './context/GameContext';
import { useGame } from './context/GameContext';
import Sidebar from './components/Sidebar';
import CelebrationOverlay from './components/CelebrationOverlay';
import AnimatedCounter from './components/AnimatedCounter';

import Dashboard from './pages/Dashboard';
import Quests from './pages/Quests';
import Skills from './pages/Skills';
import Dungeon from './pages/Dungeon';
import Shop from './pages/Shop';
import Milestones from './pages/Milestones';
import Vault from './pages/Vault';

// ─── Mobile Top Bar ───────────────────────────────────────────────────────────
function MobileTopBar({ onMenuClick }) {
  const { playerStats } = useGame();
  return (
    <div className="mobile-topbar">
      <button
        onClick={onMenuClick}
        aria-label="Open menu"
        style={{
          background: 'none',
          border: '1px solid #1e2030',
          borderRadius: '3px',
          color: '#00f0ff',
          fontSize: '20px',
          cursor: 'pointer',
          padding: '4px 10px',
          lineHeight: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        ☰
      </button>

      <span
        className="font-orbitron"
        style={{ fontSize: '12px', color: '#00f0ff', letterSpacing: '0.25em', textShadow: '0 0 8px rgba(0,240,255,0.5)' }}
      >
        THE SYSTEM
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
          <AnimatedCounter
            value={playerStats.gold}
            suffix={playerStats.goldCap > 0 ? '' : 'G'}
            className="font-mono text-[15px] font-bold text-[#ffd700]"
            style={{ textShadow: '0 0 8px rgba(255,215,0,0.5)' }}
          />
          {playerStats.goldCap > 0 && (
            <span style={{ fontSize: '10px', color: '#8892a0', fontFamily: 'Share Tech Mono, monospace' }}>
              /<AnimatedCounter value={playerStats.goldCap} suffix="G" />
            </span>
          )}
        </div>
        {playerStats.burnoutDebuff && (
          <span
            style={{
              fontSize: '9px',
              fontFamily: 'Share Tech Mono, monospace',
              color: '#ff003c',
              background: 'rgba(255,0,60,0.12)',
              border: '1px solid rgba(255,0,60,0.35)',
              borderRadius: '2px',
              padding: '2px 5px',
              fontWeight: 700,
              letterSpacing: '0.05em',
            }}
          >
            BURNOUT
          </span>
        )}
      </div>
    </div>
  );
}

function AppInner() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isShaking } = useGame();

  // Close sidebar on any route change (mobile)
  const location = useLocation();
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Close sidebar when screen moves to desktop
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) setSidebarOpen(false);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`app-root ${sidebarOpen ? 'sidebar-open-active' : ''}`}>
      {/* Red flash overlay on shake */}
      <AnimatePresence>
        {isShaking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(255, 0, 60, 0.25)',
              zIndex: 9999, pointerEvents: 'none'
            }}
          />
        )}
      </AnimatePresence>

      <motion.div
        animate={isShaking ? { x: [-10, 10, -10, 10, -5, 5, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        style={{ display: 'flex', width: '100%', height: '100%' }}
      >
        {/* Backdrop — only visible on mobile when sidebar open */}
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />

        {/* Sidebar */}
        <div className={`sidebar-wrapper ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Main content area */}
        <div className="main-area">
          {/* Mobile header bar */}
          <MobileTopBar onMenuClick={() => setSidebarOpen(true)} />

          {/* Scrollable main */}
          <main
            style={{
              flex: 1,
              overflowY: 'auto',
              background: '#0B0C10',
              position: 'relative',
            }}
          >
            {/* Subtle grid overlay */}
            <div
              style={{
                position: 'fixed',
                inset: 0,
                backgroundImage: `
                  linear-gradient(rgba(0,240,255,0.015) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0,240,255,0.015) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
                pointerEvents: 'none',
                zIndex: 0,
              }}
            />
            <div style={{ position: 'relative', zIndex: 1, minHeight: '100%' }}>
              <AnimatePresence mode="wait">
                <Routes key={location.pathname}>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/quests" element={<Quests />} />
                  <Route path="/skills" element={<Skills />} />
                  <Route path="/dungeon" element={<Dungeon />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/milestones" element={<Milestones />} />
                  <Route path="/vault" element={<Vault />} />
                </Routes>
              </AnimatePresence>
            </div>
          </main>
        </div>
      </motion.div>

      <CelebrationOverlay />
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <GameProvider>
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </GameProvider>
  );
}
