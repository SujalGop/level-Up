const STAT_COLORS = {
  STR: { color: '#ff003c', label: 'STRENGTH', track: 'rgba(255,0,60,0.15)' },
  INT: { color: '#00f0ff', label: 'INTELLECT', track: 'rgba(0,240,255,0.15)' },
  VIT: { color: '#00ff88', label: 'VITALITY', track: 'rgba(0,255,136,0.15)' },
  PER: { color: '#bf5fff', label: 'PERCEPTION', track: 'rgba(191,95,255,0.15)' },
};

export default function StatBar({ stat, value, max = 999 }) {
  const config = STAT_COLORS[stat] || { color: '#00f0ff', label: stat, track: 'rgba(0,240,255,0.15)' };
  const pct = Math.min(100, (value / max) * 100);

  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', alignItems: 'center' }}>
        <span
          style={{
            fontSize: '11px',
            fontFamily: 'Orbitron, monospace',
            fontWeight: 700,
            letterSpacing: '0.15em',
            color: config.color,
          }}
        >
          {config.label}
        </span>
        <span
          style={{
            fontSize: '14px',
            fontFamily: 'Share Tech Mono, monospace',
            color: config.color,
            textShadow: `0 0 8px ${config.color}`,
          }}
        >
          {value.toFixed(1)}
        </span>
      </div>
      <div
        style={{
          background: config.track,
          border: `1px solid ${config.color}22`,
          borderRadius: '2px',
          height: '8px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${config.color}88, ${config.color})`,
            borderRadius: '2px',
            transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            boxShadow: `0 0 8px ${config.color}80`,
          }}
        />
      </div>
    </div>
  );
}
