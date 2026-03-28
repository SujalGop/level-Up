import React from 'react';
import { useGame } from '../context/GameContext';
import { motion } from 'framer-motion';
import { isTaskActiveOnDate } from '../utils/schedule';

export default function QuickReview() {
  const { masterTasks, vaultGoals, skillBooks } = useGame();

  // 1. Pending Daily Quest
  // We use the new Date() to fetch quests active today.
  const pendingQuest = (masterTasks || []).find(task => isTaskActiveOnDate(task, new Date()));

  // 2. Highest priority guild vault item
  const topVaultGoal = [...(vaultGoals || [])]
    .filter(g => !g.isAchieved)
    .sort((a, b) => a.priority - b.priority)[0];

  // 3. Highest value skill book (currently unconsumed)
  const topSkillBook = [...(skillBooks || [])].find(b => !b.isConsumed);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.25 }}
      className="card"
      style={{ padding: '24px' }}
    >
      <div className="section-title" style={{ color: '#00f0ff', textShadow: '0 0 8px rgba(0,240,255,0.4)', borderColor: 'transparent' }}>
        QUICK REVIEW
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Daily Quest */}
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '4px', borderLeft: '2px solid #00ff88' }}>
          <div style={{ fontSize: '10px', color: '#8892a0', letterSpacing: '0.1em', marginBottom: '4px', fontFamily: 'Orbitron, monospace' }}>
            PENDING QUEST
          </div>
          {pendingQuest ? (
            <div style={{ fontSize: '14px', color: '#e2e8f0', fontWeight: 'bold' }}>
              {pendingQuest.title}
            </div>
          ) : (
            <div style={{ fontSize: '12px', color: '#3a3f52', fontFamily: 'Share Tech Mono, monospace' }}>
              [ ALL CLEARED ]
            </div>
          )}
        </div>

        {/* Vault Goal */}
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '4px', borderLeft: '2px solid #ffd700' }}>
          <div style={{ fontSize: '10px', color: '#8892a0', letterSpacing: '0.1em', marginBottom: '4px', fontFamily: 'Orbitron, monospace' }}>
            PRIORITY VAULT GOAL
          </div>
          {topVaultGoal ? (
            <div>
              <div style={{ fontSize: '14px', color: '#e2e8f0', fontWeight: 'bold' }}>
                {topVaultGoal.title}
              </div>
              <div style={{ fontSize: '12px', color: '#ffd700', fontFamily: 'Share Tech Mono, monospace', marginTop: '4px' }}>
                {topVaultGoal.currentGold} / {topVaultGoal.targetGold} G
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '12px', color: '#3a3f52', fontFamily: 'Share Tech Mono, monospace' }}>
              [ NO ACTIVE GOALS ]
            </div>
          )}
        </div>

        {/* Skill Book */}
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '4px', borderLeft: '2px solid #bf5fff' }}>
          <div style={{ fontSize: '10px', color: '#8892a0', letterSpacing: '0.1em', marginBottom: '4px', fontFamily: 'Orbitron, monospace' }}>
            AVAILABLE SKILL BOOK
          </div>
          {topSkillBook ? (
            <div style={{ fontSize: '14px', color: '#e2e8f0', fontWeight: 'bold' }}>
              {topSkillBook.title}
            </div>
          ) : (
            <div style={{ fontSize: '12px', color: '#3a3f52', fontFamily: 'Share Tech Mono, monospace' }}>
              [ LIBRARY EMPTY ]
            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
}
