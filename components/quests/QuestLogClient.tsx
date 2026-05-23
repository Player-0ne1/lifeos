'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/components/providers/AppProvider';
import {
  ScreenScroll,
  Meta,
  Mono,
  Pill,
  Stamp,
  PageHeader,
} from '@/components/primitives/index';
import type { Quest, Stat, QuestStatus } from '@/lib/notion/types';
import { ALL_STATS } from '@/lib/notion/types';

// ─── Fallback data ────────────────────────────────────────────────────────────

const FALLBACK_QUEST_LOG: Quest[] = [
  {
    id: 'qh1', dayAssigned: 13, title: '200-word weekly observation note',
    stat: 'CRAFT', status: 'complete', xp: 20, points: 0,
    difficulty: 'Easy', proofType: '', proofStandard: '', brief: '', deadline: null,
  },
  {
    id: 'qh2', dayAssigned: 13, title: 'PickleJam supplier follow-up',
    stat: 'BUILDER', status: 'complete', xp: 40, points: 0,
    difficulty: 'Medium', proofType: '', proofStandard: '', brief: '', deadline: null,
  },
  {
    id: 'qh3', dayAssigned: 13, title: 'Comment thoughtfully on 3 posts',
    stat: 'SIGNAL', status: 'failed', xp: 0, points: 0,
    difficulty: 'Easy', proofType: '', proofStandard: '', brief: '', deadline: null,
  },
  {
    id: 'qh4', dayAssigned: 12, title: '4K morning run',
    stat: 'BODY', status: 'complete', xp: 20, points: 0,
    difficulty: 'Easy', proofType: '', proofStandard: '', brief: '', deadline: null,
  },
  {
    id: 'qh5', dayAssigned: 12, title: '30 pages of Twist of the Wrist',
    stat: 'MIND', status: 'complete', xp: 40, points: 0,
    difficulty: 'Medium', proofType: '', proofStandard: '', brief: '', deadline: null,
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: Array<QuestStatus | 'ALL'> = ['ALL', 'open', 'complete', 'failed', 'abandoned'];

// ─── QuestLogClient ───────────────────────────────────────────────────────────

interface Props {
  questLog: Quest[];
}

export default function QuestLogClient({ questLog }: Props) {
  const { theme, density } = useApp();
  const data = questLog.length > 0 ? questLog : FALLBACK_QUEST_LOG;

  const [statFilter, setStatFilter] = useState<Stat | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<QuestStatus | 'ALL'>('ALL');

  const visible = data.filter(q => {
    if (statFilter !== 'ALL' && q.stat !== statFilter) return false;
    if (statusFilter !== 'ALL' && q.status !== statusFilter) return false;
    return true;
  });

  // Group by dayAssigned descending
  const grouped = visible.reduce<Record<number, Quest[]>>((acc, q) => {
    const day = q.dayAssigned ?? 0;
    if (!acc[day]) acc[day] = [];
    acc[day].push(q);
    return acc;
  }, {});
  const days = Object.keys(grouped).map(Number).sort((a, b) => b - a);

  function statusColor(s: QuestStatus): string {
    if (s === 'complete') return theme.good;
    if (s === 'failed') return theme.danger;
    if (s === 'abandoned') return theme.inkMute;
    return theme.accent;
  }

  function statusGlyph(s: QuestStatus): string {
    if (s === 'complete') return '✓';
    if (s === 'failed') return '✗';
    if (s === 'abandoned') return '—';
    return '○';
  }

  return (
    <ScreenScroll>
      <div style={{ padding: density.padScreen, maxWidth: 820 }}>
        <Link href="/quests" style={{ textDecoration: 'none' }}>
          <button className="ls-press ls-mono" style={{
            background: 'transparent', border: 'none', color: theme.inkMute, padding: 0,
            fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer',
          }}>← Quests</button>
        </Link>

        <PageHeader
          overline="QUEST LOG"
          title="All Quests"
          meta={`${visible.length} entries`}
          style={{ padding: `${density.padCard}px 0` }}
        />

        {/* Stat filter */}
        <div style={{ marginTop: 14, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(['ALL', ...ALL_STATS] as Array<Stat | 'ALL'>).map(s => (
            <button key={s} onClick={() => setStatFilter(s)} className="ls-mono ls-press" style={{
              background: statFilter === s ? theme.ink : 'transparent',
              border: `1px solid ${statFilter === s ? theme.ink : theme.rule}`,
              color: statFilter === s ? theme.bg : theme.inkDim,
              padding: '5px 9px', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
              cursor: 'pointer', borderRadius: 0,
            }}>{s}</button>
          ))}
        </div>

        {/* Status filter */}
        <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {STATUS_OPTIONS.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className="ls-mono ls-press" style={{
              background: statusFilter === s ? theme.ink : 'transparent',
              border: `1px solid ${statusFilter === s ? theme.ink : theme.rule2}`,
              color: statusFilter === s ? theme.bg : theme.inkDim,
              padding: '4px 8px', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
              cursor: 'pointer', borderRadius: 0,
            }}>{s}</button>
          ))}
        </div>

        {/* Quest list grouped by day */}
        <div style={{ marginTop: 18 }}>
          {days.length === 0 && (
            <div style={{ padding: '28px 0', textAlign: 'center' }}>
              <Mono style={{ fontSize: 12, color: theme.inkMute }}>No quests match the filter</Mono>
            </div>
          )}
          {days.map(day => (
            <div key={day}>
              <div style={{
                padding: '8px 0',
                borderBottom: `1px solid ${theme.rule}`,
                display: 'flex',
                alignItems: 'baseline',
                gap: 10,
              }}>
                <Mono style={{ fontSize: 11, color: theme.inkMute }}>DAY {String(day).padStart(2, '0')}</Mono>
                <div style={{ flex: 1, height: 1, background: theme.rule2 }} />
                <Mono style={{ fontSize: 10, color: theme.inkMute }}>
                  {grouped[day].filter(q => q.status === 'complete').length}/{grouped[day].length} done
                </Mono>
              </div>
              {grouped[day].map(q => (
                <div key={q.id} style={{
                  padding: '11px 0',
                  borderBottom: `1px solid ${theme.rule2}`,
                  display: 'grid',
                  gridTemplateColumns: '18px auto 1fr auto',
                  gap: 10,
                  alignItems: 'center',
                }}>
                  <span style={{ fontSize: 13, color: statusColor(q.status), lineHeight: 1 }}>
                    {statusGlyph(q.status)}
                  </span>
                  <Pill style={{ fontSize: 9, flexShrink: 0 }}>{q.stat}</Pill>
                  <span style={{
                    fontSize: 13,
                    color: q.status === 'failed' ? theme.inkDim : q.status === 'abandoned' ? theme.inkMute : theme.ink,
                    textDecoration: q.status === 'abandoned' ? 'line-through' : 'none',
                  }}>
                    {q.title}
                  </span>
                  <Mono style={{ fontSize: 11, color: q.status === 'complete' ? theme.accent : theme.inkMute }}>
                    {q.xp > 0 ? `+${q.xp}` : '—'}
                  </Mono>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </ScreenScroll>
  );
}
