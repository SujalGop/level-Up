import { useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = {
  blue: '#00f0ff',
  red: '#ff003c',
  gold: '#ffd700',
  green: '#00ff88',
};

export default function CelebrationOverlay() {
  const { celebration } = useGame();
  const containerRef = useRef(null);

  useEffect(() => {
    if (!celebration || !containerRef.current) return;
    const container = containerRef.current;
    const count = 40;
    const color = COLORS[celebration.type] || COLORS.blue;

    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      const size = Math.random() * 12 + 4;
      particle.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        left: ${Math.random() * 100}vw;
        top: ${Math.random() * 100}vh;
        box-shadow: 0 0 ${size * 2}px ${color};
        animation-delay: ${Math.random() * 0.5}s;
        animation-duration: ${Math.random() * 0.8 + 0.6}s;
      `;
      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 1400);
    }
  }, [celebration]);

  return (
    <AnimatePresence>
      {celebration && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, y: -40, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          style={{
            position: 'fixed',
            top: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9998,
            background: '#0B0C10',
            border: `2px solid ${COLORS[celebration.type] || COLORS.blue}`,
            boxShadow: `0 0 30px ${COLORS[celebration.type] || COLORS.blue}66`,
            borderRadius: '4px',
            padding: '16px 32px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span
            className="font-orbitron"
            style={{
              fontSize: '18px',
              fontWeight: 900,
              color: COLORS[celebration.type] || COLORS.blue,
              textShadow: `0 0 12px ${COLORS[celebration.type] || COLORS.blue}`,
              letterSpacing: '0.1em',
            }}
          >
            {celebration.message}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
