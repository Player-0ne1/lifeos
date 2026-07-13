'use client';
import Link from 'next/link';
import { useApp } from '@/components/providers/AppProvider';
import {
  ScreenScroll,
  Meta,
  Mono,
  Ring,
  RowLink,
} from '@/components/primitives/index';
import type { WeeklyLedger } from '@/lib/notion/types';
import type { Penalty } from '@/lib/notion/types';
import type { FinancialSummary } from '@/lib/notion/types';

// ─── LedgerHomeClient ─────────────────────────────────────────────────────────

interface Props {
  week: WeeklyLedger | null;
  pastWeeks: WeeklyLedger[];
  penalties: Penalty[];
  financial: FinancialSummary | null;
  notionError?: boolean;
}

export default function LedgerHomeClient({ week, pastWeeks, penalties, financial, notionError = false }: Props) {
  const { theme, density, voice, setOverlay } = useApp();

  if (notionError) {
    return (
      <ScreenScroll>
        <div style={{ padding: density.padScreen }}>
          <div style={{ padding: '14px 16px', background: `${theme.danger}15`, border: `1px solid ${theme.danger}40` }}>
            <Mono style={{ color: theme.danger, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Notion unreachable — check env vars</Mono>
          </div>
        </div>
      </ScreenScroll>
    );
  }

  // Safe defaults when no active week exists yet
  const w: WeeklyLedger = week ?? {
    id: '', weekNum: 0, weekRange: '—', questsCompleted: 0, questsTotal: 0,
    completionPct: 0, penaltyAmount: 0, xpEarned: 0, status: 'open',
  };

  const allTimePenalty = penalties.reduce((s, p) => s + p.amount, 0);

  const ringColor =
    w.completionPct >= 90 ? theme.good :
    w.completionPct >= 75 ? theme.accent :
    theme.danger;

  return (
    <ScreenScroll>
      <div style={{
        padding: density.padScreen,
        maxWidth: 920,
      }}>
        <Meta>{voice.sundayOpen ?? 'The Ledger'}</Meta>
        <h1 style={{
          fontFamily: 'Newsreader, serif',
          fontSize: 32,
          fontWeight: 400,
          marginTop: 10,
          color: theme.ink,
          letterSpacing: '-0.01em',
        }}>
          The Ledger
        </h1>

        {/* Week summary — Ring + stats grid */}
        <div style={{
          marginTop: 22,
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: 32,
          alignItems: 'start',
        }}>
          <Ring
            value={w.completionPct}
            size={120}
            color={ringColor}
            label={`WK ${w.weekNum}`}
            sublabel={w.weekRange}
          />
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            border: `1px solid ${theme.rule}`,
          }}>
            {[
              { l: 'COMPLETE', v: `${w.questsCompleted}/${w.questsTotal}` },
              { l: 'RATE', v: `${w.completionPct}%` },
              { l: 'XP EARNED', v: w.xpEarned.toLocaleString() },
              { l: 'PENALTY', v: w.penaltyAmount === 0 ? 'None' : `₹${w.penaltyAmount.toLocaleString('en-IN')}` },
            ].map((c, i) => (
              <div key={i} style={{
                padding: '14px',
                borderRight: i % 2 === 0 ? `1px solid ${theme.rule2}` : 'none',
                borderBottom: i < 2 ? `1px solid ${theme.rule2}` : 'none',
              }}>
                <Meta>{c.l}</Meta>
                <div className="ls-num" style={{ fontSize: 22, marginTop: 4, color: theme.ink }}>{c.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* All-time penalty */}
        <div style={{ marginTop: 22, padding: '16px', border: `1px solid ${theme.danger}` }}>
          <Meta style={{ color: theme.danger }}>PENALTY · ALL-TIME</Meta>
          <div className="ls-num" style={{ marginTop: 4, fontSize: 28, color: theme.danger }}>
            ₹{allTimePenalty.toLocaleString('en-IN')}
          </div>
          <Mono style={{
            display: 'block', marginTop: 4,
            fontSize: 10, color: theme.inkMute, letterSpacing: '0.18em',
          }}>
            TRANSFERRED TO DAD · WITNESSED BY MOM
          </Mono>
        </div>

        {/* Sunday Ritual CTA */}
        <button
          onClick={() => setOverlay({ kind: 'sunday' })}
          className="ls-press"
          style={{
            marginTop: 22,
            width: '100%',
            padding: '18px 22px',
            background: 'transparent',
            color: theme.ink,
            border: `1px solid ${theme.ink}`,
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 12,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>Sunday Ritual · Close Week {w.weekNum}</span>
          <span>›</span>
        </button>

        {/* Nav links */}
        <div style={{ marginTop: 22, borderTop: `1px solid ${theme.rule}` }}>
          <Link href="/ledger/history" style={{ textDecoration: 'none' }}>
            <RowLink meta={`LAST ${Math.min(pastWeeks.length, 12)} WKS`}>Weekly History</RowLink>
          </Link>
          <Link href="/ledger/penalties" style={{ textDecoration: 'none' }}>
            <RowLink meta={`₹${allTimePenalty.toLocaleString('en-IN')} ALL TIME`}>Penalty Log</RowLink>
          </Link>
          <Link href="/ledger/financial" style={{ textDecoration: 'none' }}>
            <RowLink meta="CAPITAL TAB">Financial Log</RowLink>
          </Link>
        </div>
      </div>
    </ScreenScroll>
  );
}
