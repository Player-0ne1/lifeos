'use client';
import Link from 'next/link';
import { useApp } from '@/components/providers/AppProvider';
import {
  ScreenScroll,
  Meta,
  Mono,
  PageHeader,
  Spark,
} from '@/components/primitives/index';
import type { WeeklyLedger } from '@/lib/notion/types';

// ─── Fallback data ────────────────────────────────────────────────────────────

const FALLBACK_WEEKS: WeeklyLedger[] = [
  { id: 'w1', weekNum: 1, weekRange: '05–11 May 2026', questsCompleted: 14, questsTotal: 18, completionPct: 78, penaltyAmount: 0, xpEarned: 560, status: 'closed' },
  { id: 'w2', weekNum: 2, weekRange: '12–18 May 2026', questsCompleted: 12, questsTotal: 20, completionPct: 60, penaltyAmount: 500, xpEarned: 480, status: 'closed' },
  { id: 'w3', weekNum: 3, weekRange: '19–25 May 2026', questsCompleted: 19, questsTotal: 21, completionPct: 90, penaltyAmount: 0, xpEarned: 760, status: 'closed' },
  { id: 'w4', weekNum: 4, weekRange: '26 May–01 Jun 2026', questsCompleted: 16, questsTotal: 21, completionPct: 76, penaltyAmount: 0, xpEarned: 640, status: 'open' },
];

// ─── WeeklyHistoryClient ──────────────────────────────────────────────────────

interface Props {
  weeks: WeeklyLedger[];
}

export default function WeeklyHistoryClient({ weeks }: Props) {
  const { theme, density } = useApp();
  const data = weeks.length > 0 ? weeks : FALLBACK_WEEKS;

  // Oldest first for spark chart
  const chronoWeeks = [...data].sort((a, b) => a.weekNum - b.weekNum);
  const rates = chronoWeeks.map(w => w.completionPct);

  // Display newest first
  const displayWeeks = [...data].sort((a, b) => b.weekNum - a.weekNum);

  function rateColor(r: number): string {
    if (r >= 90) return theme.good;
    if (r >= 75) return theme.accent;
    return theme.danger;
  }

  return (
    <ScreenScroll>
      <div style={{ padding: density.padScreen, maxWidth: 820 }}>
        <Link href="/ledger" style={{ textDecoration: 'none' }}>
          <button className="ls-press ls-mono" style={{
            background: 'transparent', border: 'none', color: theme.inkMute, padding: 0,
            fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer',
          }}>← Ledger</button>
        </Link>

        <PageHeader
          overline="HISTORY"
          title="Weekly Record"
          meta="All weeks since inception"
          style={{ padding: `${density.padCard}px 0` }}
        />

        {/* Sparkline trend */}
        {rates.length > 1 && (
          <div style={{ marginTop: 18, padding: '12px', border: `1px solid ${theme.rule2}` }}>
            <Meta style={{ display: 'block', marginBottom: 8 }}>COMPLETION RATE TREND</Meta>
            <Spark
              data={rates}
              width={600}
              height={56}
              color={theme.accent}
              style={{ width: '100%', height: 56 }}
            />
            <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
              <Mono style={{ fontSize: 10, color: theme.inkMute }}>WEEK 1</Mono>
              <Mono style={{ fontSize: 10, color: theme.inkMute }}>CURRENT</Mono>
            </div>
          </div>
        )}

        {/* Weekly rows */}
        <div style={{ marginTop: 22, borderTop: `1px solid ${theme.rule}` }}>
          {displayWeeks.map(w => (
            <div key={w.id} style={{
              padding: '12px 0',
              borderBottom: `1px solid ${theme.rule2}`,
              display: 'grid',
              gridTemplateColumns: '50px 1fr 60px 80px 60px',
              gap: 12,
              alignItems: 'baseline',
            }}>
              <Mono style={{ fontSize: 11, color: theme.inkMute }}>
                WK{String(w.weekNum).padStart(2, '0')}
              </Mono>
              <span style={{ fontSize: 13, color: theme.ink }}>{w.weekRange}</span>
              <Mono style={{ fontSize: 12, color: rateColor(w.completionPct) }}>
                {w.completionPct}%
              </Mono>
              <Mono style={{ fontSize: 11, color: w.penaltyAmount > 0 ? theme.danger : theme.good }}>
                {w.penaltyAmount > 0
                  ? `₹${w.penaltyAmount.toLocaleString('en-IN')}`
                  : 'Clean'}
              </Mono>
              <Mono style={{ fontSize: 10, color: theme.inkMute }}>
                {w.status}
              </Mono>
            </div>
          ))}
        </div>
      </div>
    </ScreenScroll>
  );
}
