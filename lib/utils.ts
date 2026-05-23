// Formatting utilities — IST timezone, currency, dates

/** Format a number as INR with Indian locale grouping: 1,42,000 */
export function formatINR(amount: number): string {
  return amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
}

/** Format a number as Rs. X without currency symbol weirdness */
export function formatRS(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-IN')}`;
}

/** Get today's date in IST as YYYY-MM-DD */
export function todayIST(): string {
  const ist = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  return ist;
}

/** Get a human-readable date in IST: "14 Jun 2026" */
export function humanDateIST(isoDate?: string): string {
  const d = isoDate ? new Date(isoDate + 'T00:00:00+05:30') : new Date();
  return d.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata',
  });
}

/** Get current time in IST as HH:MM */
export function timeIST(): string {
  return new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata',
  });
}

/** Pad a number to 2 digits */
export function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/** Completion percentage */
export function pct(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

/** Penalty tier based on weekly completion */
export function penaltyAmount(completionPct: number): number {
  if (completionPct >= 90) return 0;
  if (completionPct >= 75) return 2500;
  return 5000;
}

/** Clamp a number between min and max */
export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/** Level XP thresholds (L1-L50). XP required to reach next level. */
export const LEVEL_XP: number[] = [
  0, 500, 675, 900, 1100, 1350, 1600, 1900, 2200, 2600,
  3000, 3500, 4000, 4600, 5200, 6000, 6800, 7700, 8700, 9800,
  11000, 12500, 14000, 15800, 17800, 20000, 22500, 25200, 28200, 31500,
  35000, 39000, 43500, 48500, 54000, 60000, 67000, 74500, 82500, 91500,
  101000, 112000, 124000, 137000, 151000, 166000, 183000, 201000, 221000, 243000,
];

export function xpForLevel(level: number): number {
  return LEVEL_XP[Math.min(level, LEVEL_XP.length - 1)] || 0;
}

/** Format word count */
export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Difficulty colors */
export function difficultyColor(difficulty: string, theme: { accent: string; warn: string; danger: string }): string {
  if (difficulty === 'Easy') return theme.accent;
  if (difficulty === 'Medium') return theme.warn;
  return theme.danger;
}

/** Get the current week number (ISO-ish, Mon-Sun) */
export function currentWeekNumber(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  return Math.ceil((diff + start.getDay() * 24 * 60 * 60 * 1000) / oneWeek);
}

/** Short stat display for sidebar/header: "32" not "32/100" */
export function statShort(score: number): string {
  return pad2(score);
}
