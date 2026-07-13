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

// ─── WeeklyHistoryClient ──────────────────────────────────────────────────────

interface Props {
  weeks: WeeklyLedger[];
  notionError?: boolean;
}

export default function WeeklyHistoryClient({ weeks, notionError = false }: Props) {
  const { theme, density } = useApp();
  const data = weeks;

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
        {notionError && (
          <div style={{ marginBottom: 16, padding: '10px 14px', background: `${theme.danger}15`, border: `1px solid ${theme.danger}40` }}>
            <Mono style={{ color: theme.danger, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Notion unreachable — check env vars</Mono>
          </div>
        )}
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
