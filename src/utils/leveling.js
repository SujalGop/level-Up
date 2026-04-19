// Quadratic threshold: Level n starts at 50 * (n-1) * n stats
// e.g. Level 1=0, Level 2=100, Level 3=300, Level 4=600, Level 5=1000, Level 6=1500...
// Scales infinitely — no level cap.

export function thresholdForLevel(n) {
  const idx = n - 1;
  return 50 * idx * (idx + 1);
}

export function deriveClass(stats) {
  const total = (stats.STR || 0) + (stats.INT || 0) + (stats.VIT || 0) + (stats.PER || 0);
  // Inverse of quadratic: solve 50*n*(n+1) = total => n = (sqrt(1 + 8*total/50) - 1) / 2
  const n = (Math.sqrt(1 + (8 * total) / 50) - 1) / 2;
  const level = Math.floor(n) + 1;
  const cls = `Level ${level}`;

  const currentThreshold = thresholdForLevel(level);
  const nextThreshold = thresholdForLevel(level + 1);
  const progressPct = Math.min(100, ((total - currentThreshold) / (nextThreshold - currentThreshold)) * 100);

  return { cls, level, total, currentThreshold, nextThreshold, progressPct };
}

