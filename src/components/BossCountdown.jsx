import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { motion } from 'framer-motion';

export default function BossCountdown() {
  const { jobQuests } = useGame();
  const [timeNow, setTimeNow] = useState(new Date());

  useEffect(() => {
    // Ticking every 1 second to ensure "live" feel, even if we only show minutes
    const timer = setInterval(() => setTimeNow(new Date()), 1000); 
    return () => clearInterval(timer);
  }, []);

  const threats = jobQuests
    .filter(q => q.status === 'Active' && q.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 2);

  const formatTimeLeft = (dueDateStr) => {
    const due = new Date(dueDateStr);
    const diff = due - timeNow;
    if (diff <= 0) return '[ THREAT IMMINENT ]';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hrs = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / 1000 / 60) % 60);

    return `[ ${days} DAYS : ${hrs.toString().padStart(2, '0')} HRS : ${mins.toString().padStart(2, '0')} MINS ]`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="card"
      style={{
        padding: '24px',
        marginBottom: '20px',
        borderTop: '2px solid #ff003c',
        boxShadow: '0 -4px 12px rgba(255,0,60,0.1)'
      }}
    >
      <div className="section-title" style={{ color: '#ff003c', textShadow: '0 0 8px rgba(255,0,60,0.4)', borderColor: 'transparent' }}>
        IMPENDING THREATS
      </div>
      
      {threats.length === 0 ? (
        <div style={{ color: '#8892a0', fontSize: '12px', textAlign: 'center', padding: '20px 0', fontFamily: 'Share Tech Mono, monospace' }}>
          [ NO IMMINENT THREATS DETECTED ]
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {threats.map(threat => (
            <div key={threat.id} style={{ background: 'rgba(0,0,0,0.4)', padding: '16px', borderRadius: '4px', border: '1px solid rgba(255,0,60,0.2)' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#e2e8f0', marginBottom: '8px' }}>
                {threat.title}
              </div>
              <div className="font-mono" style={{ color: '#ff003c', fontSize: '14px', fontWeight: 'bold', letterSpacing: '0.1em' }}>
                {formatTimeLeft(threat.dueDate)}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
