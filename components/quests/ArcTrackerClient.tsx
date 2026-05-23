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

// ─── Fallback data ─────────────────────────────────────────────────────────────

const FALLBACK_ARC: ArcTracker = {
  id: 'arc-1',
  title: 'PickleJam: First Sale',
  stat: 'BUILDER',
  dayElapsed: 14,
  dayTotal: 30,
  completedQuests: 0,
  totalQuests: 0,
  percent: 38,
  paceRequired: 4.4,
  pace: 'behind',
  successCondition: 'One paying customer. Not a friend. Not a sample.',
  status: 'active',
} as ArcTracker & { paceRequired: number };

const FALLBACK_GT = {
  phase: 1,
  phaseName: 'Foundation',
  fund: 27800,
  fundTarget: 250000,
  fiveK: '34:12',
  fiveKTarget: '28:00',
  trainingDays: 8,
  trackDays: 0,
  contacts: 2,
  registrationOpens: 'April 2027',
  gear: {
    Suit: 'Needed',
    Helmet: 'Owned',
    Boots: 'Needed',
    Gloves: 'Needed',
    'Neck Brace': 'Needed',
  },
};

// ─── GTCupScreen ──────────────────────────────────────────────────────────────

export function GTCupScreen() {
  const { theme, density } = useApp();
  const gt = FALLBACK_GT;
  const fundPct = Math.round((gt.fund / gt.fundTarget) * 100);
  const gearEntries = Object.entries(gt.gear);
  const ownedCount = gearEntries.filter(([, v]) => v === 'Owned').length;

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
          overline={`GT CUP · PHASE ${gt.phase}: ${gt.phaseName.toUpperCase()}`}
          title="GT Cup Campaign"
          meta={`Registration opens ${gt.registrationOpens}`}
          style={{ padding: `${density.padCard}px 0` }}
        />

        {/* Fund progress */}
        <div style={{ marginTop: 18, border: `1px solid ${theme.rule}`, padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <Meta>Race Fund</Meta>
            <Mono style={{ fontSize: 11, color: theme.accent }}>{fundPct}%</Mono>
          </div>
          <div style={{ height: 6, background: theme.rule, borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${fundPct}%`,
              background: theme.accent, borderRadius: 3,
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <Mono style={{ fontSize: 12, color: theme.ink }}>
              ₹{gt.fund.toLocaleString('en-IN')}
            </Mono>
            <Mono style={{ fontSize: 11, color: theme.inkMute }}>
              ₹{gt.fundTarget.toLocaleString('en-IN')} target
            </Mono>
          </div>
        </div>

        {/* Stats grid */}
        <div style={{
          marginTop: 16,
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          border: `1px solid ${theme.rule}`,
        }}>
          {[
            { l: '5K TIME', v: gt.fiveK, sub: `target ${gt.fiveKTarget}` },
            { l: 'TRAINING DAYS', v: String(gt.trainingDays), sub: 'this month' },
            { l: 'TRACK DAYS', v: String(gt.trackDays), sub: 'logged' },
            { l: 'CONTACTS', v: String(gt.contacts), sub: 'team / sponsor' },
          ].map((c, i, a) => (
            <div key={i} style={{
              padding: '14px',
              borderRight: i % 2 === 0 ? `1px solid ${theme.rule2}` : 'none',
              borderBottom: i < 2 ? `1px solid ${theme.rule2}` : 'none',
            }}>
              <Meta>{c.l}</Meta>
              <div className="ls-num" style={{ fontSize: 22, marginTop: 4, color: theme.ink }}>{c.v}</div>
              <Mono style={{ fontSize: 10, color: theme.inkMute }}>{c.sub}</Mono>
            </div>
          ))}
        </div>

        {/* Gear checklist */}
        <div style={{ marginTop: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <Meta>Gear Checklist</Meta>
            <Mono style={{ fontSize: 11, color: theme.inkMute }}>{ownedCount}/{gearEntries.length} owned</Mono>
          </div>
          {gearEntries.map(([item, status]) => (
            <div key={item} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0', borderBottom: `1px solid ${theme.rule2}`,
            }}>
              <span style={{ fontSize: 13, color: theme.ink }}>{item}</span>
              <Mono style={{
                fontSize: 10,
                color: status === 'Owned' ? theme.good : theme.danger,
              }}>
                {status}
              </Mono>
            </div>
          ))}
        </div>
      </div>
    </ScreenScroll>
  );
}

// ─── ArcTrackerClient ─────────────────────────────────────────────────────────

interface Props {
  arc: ArcTracker | null;
}

export default function ArcTrackerClient({ arc }: Props) {
  const { theme, density } = useApp();
  const a = arc ?? FALLBACK_ARC;

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
