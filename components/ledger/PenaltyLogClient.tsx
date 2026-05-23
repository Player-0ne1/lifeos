'use client';
import Link from 'next/link';
import { useApp } from '@/components/providers/AppProvider';
import {
  ScreenScroll,
  Meta,
  Mono,
  PageHeader,
} from '@/components/primitives/index';
import type { Penalty } from '@/lib/notion/types';

// ─── Fallback data ────────────────────────────────────────────────────────────

const FALLBACK_PENALTIES: Penalty[] = [
  {
    id: 'p1', weekNum: 2, amount: 500,
    reason: 'Week 02 completion: 60%',
    paidDate: '2026-05-19', upiRef: 'UPI/26514/REF001', isPaid: true,
  },
];

// ─── PenaltyLogClient ─────────────────────────────────────────────────────────

interface Props {
  penalties: Penalty[];
}

export default function PenaltyLogClient({ penalties }: Props) {
  const { theme, density } = useApp();
  const data = penalties.length > 0 ? penalties : FALLBACK_PENALTIES;

  const total = data.reduce((s, p) => s + p.amount, 0);

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
          overline="PENALTIES"
          title="The Penalty Log"
          meta="Immutable. No appeals."
          style={{ padding: `${density.padCard}px 0` }}
        />

        {/* All-time total — prominent */}
        <div style={{
          marginTop: 22,
          padding: '20px',
          border: `1px solid ${theme.danger}`,
          textAlign: 'center',
        }}>
          <Meta style={{ color: theme.danger }}>ALL-TIME TRANSFERRED</Meta>
          <div className="ls-num" style={{
            fontSize: 48,
            color: theme.danger,
            marginTop: 8,
            letterSpacing: '-0.02em',
          }}>
            ₹{total.toLocaleString('en-IN')}
          </div>
          <Mono style={{
            display: 'block', marginTop: 6,
            fontSize: 10, color: theme.inkMute, letterSpacing: '0.18em',
          }}>
            TRANSFERRED TO DAD · WITNESSED BY MOM · BINDING
          </Mono>
        </div>

        {/* Penalty rows */}
        <div style={{ marginTop: 22, borderTop: `1px solid ${theme.rule}` }}>
          {data.length === 0 && (
            <div style={{ padding: '28px 0', textAlign: 'center' }}>
              <Mono style={{ fontSize: 13, color: theme.good }}>No penalties on record</Mono>
            </div>
          )}
          {data.map((p, i) => (
            <div key={p.id ?? i} style={{
              padding: '14px 0',
              borderBottom: `1px solid ${theme.rule2}`,
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}>
                <Meta>
                  WK {String(p.weekNum).padStart(2, '0')}
                  {p.paidDate ? ` · ${p.paidDate}` : ''}
                </Meta>
                <Mono style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: p.amount > 0 ? theme.danger : theme.good,
                }}>
                  {p.amount > 0
                    ? `₹${p.amount.toLocaleString('en-IN')}`
                    : 'Clean'}
                </Mono>
              </div>
              {p.reason && (
                <div style={{ marginTop: 4, fontSize: 13, color: theme.inkDim, fontStyle: 'italic' }}>
                  {p.reason}
                </div>
              )}
              {p.upiRef && (
                <Mono style={{ display: 'block', marginTop: 4, fontSize: 10, color: theme.inkMute }}>
                  REF: {p.upiRef}
                </Mono>
              )}
              <div style={{ marginTop: 4 }}>
                <Mono style={{
                  fontSize: 10,
                  color: p.isPaid ? theme.good : theme.warn,
                }}>
                  {p.isPaid ? 'PAID' : 'UNPAID'}
                </Mono>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ScreenScroll>
  );
}
