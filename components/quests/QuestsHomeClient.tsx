'use client';
import Link from 'next/link';
import { useApp } from '@/components/providers/AppProvider';
import { ScreenScroll, Meta, Mono, RowLink, Pill } from '@/components/primitives/index';
import type { ArcTracker } from '@/lib/notion/types';
import type { Quest, QuestTemplate } from '@/lib/notion/types';

// ─── ArcMini ─────────────────────────────────────────────────────────────────

interface ArcMiniProps {
  arc: ArcTracker;
}

function ArcMini({ arc }: ArcMiniProps) {
  const { theme } = useApp();
  const paceColor =
    arc.pace === 'ahead' ? theme.good :
    arc.pace === 'behind' ? theme.danger :
    theme.accent;

  return (
    <div style={{ border: `1px solid ${theme.rule}`, padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <Meta>Active Arc</Meta>
        <Mono style={{ fontSize: 10, color: paceColor, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {arc.pace}
        </Mono>
      </div>
      <div style={{ fontSize: 15, color: theme.ink, fontWeight: 500, marginBottom: 8 }}>
        {arc.title}
      </div>
      {/* progress bar */}
      <div style={{ height: 4, background: theme.rule, borderRadius: 2, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${Math.min(arc.percent, 100)}%`,
          background: paceColor,
          borderRadius: 2,
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
        <Mono style={{ fontSize: 10, color: theme.inkMute }}>
          Day {arc.dayElapsed} / {arc.dayTotal}
        </Mono>
        <Mono style={{ fontSize: 10, color: paceColor }}>
          {arc.percent}%
        </Mono>
      </div>
    </div>
  );
}

// ─── QuestsHomeClient ─────────────────────────────────────────────────────────

interface Props {
  arc: ArcTracker | null;
  questLog: Quest[];
  library: QuestTemplate[];
}

export default function QuestsHomeClient({ arc, questLog, library }: Props) {
  const { theme, density, voice } = useApp();

  const openQuests = questLog.filter(q => q.status === 'open');
  const completedToday = questLog.filter(q => q.status === 'complete').length;
  const totalToday = questLog.length;

  return (
    <ScreenScroll>
      <div style={{
        padding: density.padScreen,
        maxWidth: 920,
      }}>
        <Meta>{voice.sundayOpen ?? 'Quests'}</Meta>
        <h1 style={{
          fontFamily: 'Newsreader, serif',
          fontSize: 32,
          fontWeight: 400,
          marginTop: 8,
          marginBottom: 0,
          color: theme.ink,
          letterSpacing: '-0.01em',
        }}>
          Quest Board
        </h1>

        {/* summary row */}
        <div style={{
          marginTop: 18,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          border: `1px solid ${theme.rule}`,
        }}>
          {[
            { l: 'OPEN', v: String(openQuests.length) },
            { l: 'COMPLETE', v: String(completedToday) },
            { l: 'LIBRARY', v: String(library.length) },
          ].map((c, i, a) => (
            <div key={i} style={{
              padding: '14px',
              borderRight: i < a.length - 1 ? `1px solid ${theme.rule2}` : 'none',
            }}>
              <Meta>{c.l}</Meta>
              <div className="ls-num" style={{ fontSize: 22, marginTop: 4, color: theme.ink }}>{c.v}</div>
            </div>
          ))}
        </div>

        {/* active arc */}
        {arc && (
          <div style={{ marginTop: 18 }}>
            <ArcMini arc={arc} />
          </div>
        )}

        {/* active quests preview */}
        {openQuests.length > 0 && (
          <div style={{ marginTop: 22 }}>
            <Meta style={{ display: 'block', marginBottom: 10 }}>Open Quests</Meta>
            {openQuests.slice(0, 4).map(q => (
              <div key={q.id} style={{
                padding: '10px 0',
                borderBottom: `1px solid ${theme.rule2}`,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}>
                <Pill style={{ flexShrink: 0, fontSize: 9 }}>{q.stat}</Pill>
                <span style={{ flex: 1, fontSize: 13, color: theme.ink }}>{q.title}</span>
                <Mono style={{ fontSize: 10, color: theme.accent }}>{q.xp} XP</Mono>
              </div>
            ))}
          </div>
        )}

        {/* nav links */}
        <div style={{ marginTop: 22, borderTop: `1px solid ${theme.rule}` }}>
          <Link href="/quests/log" style={{ textDecoration: 'none' }}>
            <RowLink meta={`${totalToday} ENTRIES`}>Quest Log</RowLink>
          </Link>
          <Link href="/quests/arc" style={{ textDecoration: 'none' }}>
            <RowLink meta={arc ? arc.title.toUpperCase().slice(0, 20) : 'NO ACTIVE ARC'}>Arc Tracker</RowLink>
          </Link>
          <Link href="/quests/library" style={{ textDecoration: 'none' }}>
            <RowLink meta={`${library.length} TEMPLATES`}>Quest Library</RowLink>
          </Link>
        </div>
      </div>
    </ScreenScroll>
  );
}
