'use client';
import Link from 'next/link';
import { useApp } from '@/components/providers/AppProvider';
import {
  ScreenScroll,
  Meta,
  Mono,
  PageHeader,
  Pill,
} from '@/components/primitives/index';
import type { ArcTracker } from '@/lib/notion/types';


// ─── ArcTrackerClient ─────────────────────────────────────────────────────────

interface Props {
  arc: ArcTracker | null;
  notionError?: boolean;
}

export default function ArcTrackerClient({ arc, notionError = false }: Props) {
  const { theme, density } = useApp();

  if (notionError || !arc) {
    return (
      <ScreenScroll>
        <div style={{ padding: density.padScreen, maxWidth: 820 }}>
          <div style={{ padding: '28px 0', textAlign: 'center' }}>
            <Mono style={{ fontSize: 12, color: notionError ? theme.danger : theme.inkMute }}>
              {notionError ? 'Notion unreachable — check env vars' : 'No active arc. Create one in Notion.'}
            </Mono>
          </div>
        </div>
      </ScreenScroll>
    );
  }

  const a = arc;

  const paceColor =
    a.pace === 'ahead' ? theme.good :
    a.pace === 'behind' ? theme.danger :
    theme.accent;

  const dayPct = a.dayTotal > 0 ? Math.round((a.dayElapsed / a.dayTotal) * 100) : 0;

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
          overline={`ARC · ${a.stat}`}
          title={a.title}
          meta={`Status: ${a.status}`}
          style={{ padding: `${density.padCard}px 0` }}
        />

        {/* Pace indicator */}
        <div style={{
          marginTop: 18,
          padding: '14px 16px',
          border: `1px solid ${paceColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <Meta style={{ color: paceColor }}>Pace</Meta>
            <div className="ls-num" style={{ fontSize: 24, color: paceColor, marginTop: 4 }}>
              {a.pace.toUpperCase()}
            </div>
          </div>
          <Mono style={{ fontSize: 32, color: paceColor, opacity: 0.4 }}>
            {a.pace === 'ahead' ? '↑' : a.pace === 'behind' ? '↓' : '→'}
          </Mono>
        </div>

        {/* Progress bars */}
        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {/* Day elapsed */}
          <div style={{ border: `1px solid ${theme.rule}`, padding: '14px' }}>
            <Meta>Day Progress</Meta>
            <div style={{ height: 5, background: theme.rule, borderRadius: 2, overflow: 'hidden', marginTop: 8 }}>
              <div style={{
                height: '100%', width: `${dayPct}%`,
                background: theme.accent, borderRadius: 2,
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
              <Mono style={{ fontSize: 11, color: theme.ink }}>Day {a.dayElapsed}</Mono>
              <Mono style={{ fontSize: 10, color: theme.inkMute }}>/ {a.dayTotal}</Mono>
            </div>
          </div>

          {/* Quest completion */}
          <div style={{ border: `1px solid ${theme.rule}`, padding: '14px' }}>
            <Meta>Quest Progress</Meta>
            <div style={{ height: 5, background: theme.rule, borderRadius: 2, overflow: 'hidden', marginTop: 8 }}>
              <div style={{
                height: '100%', width: `${Math.min(a.percent, 100)}%`,
                background: paceColor, borderRadius: 2,
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
              <Mono style={{ fontSize: 11, color: theme.ink }}>{a.percent}%</Mono>
              {a.completedQuests != null && a.totalQuests != null && (
                <Mono style={{ fontSize: 10, color: theme.inkMute }}>
                  {a.completedQuests}/{a.totalQuests}
                </Mono>
              )}
            </div>
          </div>
        </div>

        {/* Success condition */}
        <div style={{ marginTop: 16, border: `1px solid ${theme.rule}`, padding: '16px' }}>
          <Meta style={{ display: 'block', marginBottom: 8 }}>Success Condition</Meta>
          <div style={{
            fontSize: 14,
            color: theme.ink,
            lineHeight: 1.55,
            fontStyle: 'italic',
          }}>
            &ldquo;{a.successCondition}&rdquo;
          </div>
        </div>

        {/* Stat pill */}
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Pill>{a.stat}</Pill>
          <Mono style={{ fontSize: 11, color: theme.inkMute }}>
            {a.dayTotal - a.dayElapsed} days remaining
          </Mono>
        </div>
      </div>
    </ScreenScroll>
  );
}
