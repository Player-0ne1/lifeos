'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/components/providers/AppProvider';
import {
  ScreenScroll,
  Meta,
  Mono,
  Pill,
  PageHeader,
} from '@/components/primitives/index';
import type { QuestTemplate, Stat } from '@/lib/notion/types';
import { ALL_STATS } from '@/lib/notion/types';

// ─── Fallback data ────────────────────────────────────────────────────────────

const FALLBACK_LIBRARY: QuestTemplate[] = [
  {
    id: 'l1', stat: 'CRAFT', difficulty: 'Easy',
    title: "Write 200 words on today's observation",
    xpValue: 20, timeEstimate: '20 min', energyLevel: 'Low',
    brief: '', proofStandard: 'Paste ≥ 200 words',
  },
  {
    id: 'l2', stat: 'CRAFT', difficulty: 'Medium',
    title: '600-word essay (Substack-ready)',
    xpValue: 40, timeEstimate: '60 min', energyLevel: 'Medium',
    brief: '', proofStandard: 'Paste ≥ 600 words',
  },
  {
    id: 'l3', stat: 'BUILDER', difficulty: 'Easy',
    title: 'PickleJam: Follow up with one supplier',
    xpValue: 30, timeEstimate: '30 min', energyLevel: 'Low',
    brief: '', proofStandard: 'Screenshot of message sent',
  },
  {
    id: 'l4', stat: 'BODY', difficulty: 'Easy',
    title: '4K morning run',
    xpValue: 20, timeEstimate: '30 min', energyLevel: 'Medium',
    brief: '', proofStandard: 'Screenshot of run tracker',
  },
  {
    id: 'l5', stat: 'MIND', difficulty: 'Easy',
    title: '30 pages of current book',
    xpValue: 20, timeEstimate: '45 min', energyLevel: 'Low',
    brief: '', proofStandard: 'Note page start and end',
  },
  {
    id: 'l6', stat: 'SIGNAL', difficulty: 'Easy',
    title: 'Comment thoughtfully on 3 posts',
    xpValue: 15, timeEstimate: '20 min', energyLevel: 'Low',
    brief: '', proofStandard: 'Screenshot of 3 comments',
  },
];

// ─── HiddenQuests ─────────────────────────────────────────────────────────────

function HiddenQuestsNote() {
  const { theme } = useApp();
  return (
    <div style={{
      marginTop: 24,
      padding: '14px 16px',
      border: `1px solid ${theme.rule2}`,
      background: theme.surface,
    }}>
      <Meta style={{ display: 'block', marginBottom: 6 }}>Hidden Quests</Meta>
      <p style={{ fontSize: 12, color: theme.inkDim, lineHeight: 1.55, margin: 0 }}>
        Some quests unlock through Arc progression or stat milestones. They will appear
        in your Quest Log when conditions are met.
      </p>
    </div>
  );
}

// ─── QuestLibraryClient ───────────────────────────────────────────────────────

interface Props {
  library: QuestTemplate[];
}

export default function QuestLibraryClient({ library }: Props) {
  const { theme, density } = useApp();
  const data = library.length > 0 ? library : FALLBACK_LIBRARY;

  const [statFilter, setStatFilter] = useState<Stat | 'ALL'>('ALL');
  const [diffFilter, setDiffFilter] = useState<'ALL' | 'Easy' | 'Medium' | 'Hard'>('ALL');
  const [expanded, setExpanded] = useState<string | null>(null);

  const visible = data.filter(t => {
    if (statFilter !== 'ALL' && t.stat !== statFilter) return false;
    if (diffFilter !== 'ALL' && t.difficulty !== diffFilter) return false;
    return true;
  });

  function diffColor(d: string): string {
    if (d === 'Hard') return theme.danger;
    if (d === 'Medium') return theme.warn;
    return theme.good;
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
          overline="QUEST LIBRARY"
          title="Available Quests"
          meta={`${visible.length} templates`}
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

        {/* Difficulty filter */}
        <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
          {(['ALL', 'Easy', 'Medium', 'Hard'] as const).map(d => (
            <button key={d} onClick={() => setDiffFilter(d)} className="ls-mono ls-press" style={{
              background: diffFilter === d ? theme.ink : 'transparent',
              border: `1px solid ${diffFilter === d ? theme.ink : theme.rule2}`,
              color: diffFilter === d ? theme.bg : diffColor(d),
              padding: '4px 8px', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
              cursor: 'pointer', borderRadius: 0,
            }}>{d}</button>
          ))}
        </div>

        {/* Template list */}
        <div style={{ marginTop: 18, borderTop: `1px solid ${theme.rule}` }}>
          {visible.length === 0 && (
            <div style={{ padding: '28px 0', textAlign: 'center' }}>
              <Mono style={{ fontSize: 12, color: theme.inkMute }}>No templates match filters</Mono>
            </div>
          )}
          {visible.map(t => {
            const isExpanded = expanded === t.id;
            return (
              <div key={t.id} style={{ borderBottom: `1px solid ${theme.rule2}` }}>
                <button
                  onClick={() => setExpanded(isExpanded ? null : t.id)}
                  className="ls-press"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr auto auto',
                    gap: 10,
                    padding: '12px 0',
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    alignItems: 'center',
                  }}
                >
                  <Pill style={{ fontSize: 9, flexShrink: 0 }}>{t.stat}</Pill>
                  <span style={{ fontSize: 13, color: theme.ink }}>{t.title}</span>
                  <Mono style={{ fontSize: 11, color: diffColor(t.difficulty), flexShrink: 0 }}>
                    {t.difficulty}
                  </Mono>
                  <Mono style={{ fontSize: 11, color: theme.accent, flexShrink: 0 }}>
                    {t.xpValue} XP
                  </Mono>
                </button>
                {isExpanded && (
                  <div style={{
                    padding: '0 0 14px 0',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 10,
                  }}>
                    <div>
                      <Meta style={{ display: 'block', marginBottom: 4 }}>Time</Meta>
                      <Mono style={{ fontSize: 12, color: theme.inkDim }}>{t.timeEstimate || '—'}</Mono>
                    </div>
                    <div>
                      <Meta style={{ display: 'block', marginBottom: 4 }}>Energy</Meta>
                      <Mono style={{ fontSize: 12, color: theme.inkDim }}>{t.energyLevel || '—'}</Mono>
                    </div>
                    {t.proofStandard && (
                      <div style={{ gridColumn: '1 / -1' }}>
                        <Meta style={{ display: 'block', marginBottom: 4 }}>Proof Standard</Meta>
                        <span style={{ fontSize: 12, color: theme.inkDim, lineHeight: 1.5 }}>
                          {t.proofStandard}
                        </span>
                      </div>
                    )}
                    {t.brief && (
                      <div style={{ gridColumn: '1 / -1' }}>
                        <Meta style={{ display: 'block', marginBottom: 4 }}>Brief</Meta>
                        <span style={{ fontSize: 12, color: theme.inkDim, lineHeight: 1.5 }}>
                          {t.brief}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <HiddenQuestsNote />
      </div>
    </ScreenScroll>
  );
}
