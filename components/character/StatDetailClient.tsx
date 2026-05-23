'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/components/providers/AppProvider';
import {
  Rule,
  Meta,
  Pill,
  Btn,
  Card,
  ScreenScroll,
  StatBar,
  Spark,
  Glyph,
} from '@/components/primitives/index';
import type { PlayerProfile, CharacterStat, Skill, StatHistoryEntry, Quest } from '@/lib/notion/types';
import { STAT_DESC } from '@/lib/theme';
import { humanDateIST } from '@/lib/utils';

// ─── Props ────────────────────────────────────────────────────────────────────

interface StatDetailClientProps {
  stat: string;
  player: PlayerProfile | null;
  allStats: CharacterStat[];
  skills: Skill[];
  history: StatHistoryEntry[];
  questLog: Quest[];
}

// ─── Sparkline generator ──────────────────────────────────────────────────────

function buildSparkData(history: StatHistoryEntry[]): number[] {
  if (history.length === 0) {
    // Synthetic: slight upward trend with noise
    return Array.from({ length: 30 }, (_, i) => {
      const base = 20 + Math.floor(i * 0.8);
      const noise = Math.floor(Math.random() * 6) - 3;
      return Math.max(0, Math.min(100, base + noise));
    });
  }
  // Real data: sort ascending by date and return scores
  return [...history]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => e.score);
}

// ─── SkillDetail ──────────────────────────────────────────────────────────────

export function SkillDetail({
  skill,
  onBack,
}: {
  skill: Skill;
  onBack: () => void;
}) {
  const { theme, density } = useApp();
  const statColor = theme.stat[skill.stat] || theme.accent;
  const isUnlocked = skill.status === 'unlocked';
  const isLocked = skill.status === 'locked';

  const tierLabel: Record<number, string> = {
    1: 'Tier I',
    2: 'Tier II',
    3: 'Tier III',
    4: 'Tier IV',
  };

  return (
    <ScreenScroll>
      <div style={{ padding: density.padScreen }}>
        {/* Back */}
        <button
          onClick={onBack}
          className="ls-press ls-mono"
          style={{
            background: 'none',
            border: 'none',
            color: theme.inkMute,
            fontSize: density.fontMeta,
            cursor: 'pointer',
            padding: 0,
            letterSpacing: '0.06em',
            marginBottom: density.gap * 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          ← {skill.stat}
        </button>

        {/* Header */}
        <div style={{ marginBottom: density.gap * 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span className="ls-mono" style={{ fontSize: density.fontMeta, color: statColor }}>
              {skill.stat}
            </span>
            <span className="ls-mono" style={{ fontSize: density.fontMeta, color: theme.inkFaint }}>
              {tierLabel[skill.tier]}
            </span>
            <Pill
              color={isUnlocked ? theme.good : isLocked ? theme.inkFaint : statColor}
            >
              {skill.status}
            </Pill>
          </div>
          <h1 style={{ fontSize: density.fontHead, color: theme.ink, fontWeight: 500, marginBottom: 6 }}>
            {skill.name}
          </h1>
          {skill.scoreThreshold > 0 && (
            <div className="ls-mono" style={{ fontSize: density.fontMeta, color: theme.inkMute }}>
              Requires {skill.stat} ≥ {skill.scoreThreshold}
            </div>
          )}
        </div>

        <Rule style={{ marginBottom: density.gap * 1.5 }} />

        {/* Description */}
        {skill.description && (
          <div style={{ marginBottom: density.gap * 2 }}>
            <Meta style={{ marginBottom: 6 }}>Description</Meta>
            <p style={{ fontSize: density.fontBody, color: theme.inkDim, lineHeight: 1.6, fontFamily: 'inherit', margin: 0 }}>
              {skill.description}
            </p>
          </div>
        )}

        {/* Deliverable (if unlocked) */}
        {isUnlocked && skill.deliverable && (
          <div
            style={{
              padding: density.padCard,
              background: `${theme.good}0d`,
              border: `1px solid ${theme.good}30`,
              borderRadius: 3,
              marginBottom: density.gap * 2,
            }}
          >
            <Meta color={theme.good} style={{ marginBottom: 6 }}>Deliverable</Meta>
            <p style={{ fontSize: density.fontBody, color: theme.ink, lineHeight: 1.6, fontFamily: 'inherit', margin: 0 }}>
              {skill.deliverable}
            </p>
          </div>
        )}
      </div>
    </ScreenScroll>
  );
}

// ─── StatDetail ───────────────────────────────────────────────────────────────

export default function StatDetailClient({
  stat,
  player,
  allStats,
  skills,
  history,
  questLog,
}: StatDetailClientProps) {
  const { theme, density } = useApp();
  const router = useRouter();
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  const statData = allStats.find((s) => s.stat === stat);
  const statColor = theme.stat[stat] || theme.accent;
  const sparkData = buildSparkData(history);
  const statDesc = STAT_DESC[stat as keyof typeof STAT_DESC];

  // If viewing a skill detail
  if (selectedSkill) {
    return <SkillDetail skill={selectedSkill} onBack={() => setSelectedSkill(null)} />;
  }

  // Recent quest history (last 10)
  const recentQuests = questLog.slice(0, 10);
  const completedCount = questLog.filter((q) => q.status === 'complete').length;

  // Skills grouped by tier
  const byTier = [1, 2, 3, 4].map((tier) => ({
    tier,
    skills: skills.filter((s) => s.tier === tier),
  })).filter((g) => g.skills.length > 0);

  const tierLabel: Record<number, string> = {
    1: 'Tier I',
    2: 'Tier II',
    3: 'Tier III',
    4: 'Tier IV',
  };

  return (
    <ScreenScroll>
      {/* Back navigation */}
      <div
        style={{
          padding: `${density.padCard * 0.7}px ${density.padScreen}px`,
          borderBottom: `1px solid ${theme.rule2}`,
          background: theme.surface,
        }}
      >
        <button
          onClick={() => router.push('/character')}
          className="ls-press ls-mono"
          style={{
            background: 'none',
            border: 'none',
            color: theme.inkMute,
            fontSize: density.fontMeta,
            cursor: 'pointer',
            padding: 0,
            letterSpacing: '0.06em',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          ← Character
        </button>
      </div>

      {/* Stat header */}
      <div
        style={{
          padding: `${density.padScreen}px ${density.padScreen}px ${density.padCard}px`,
          borderBottom: `1px solid ${theme.rule}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: density.padScreen }}>
          {/* Score display */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: 72,
              height: 72,
              border: `2px solid ${statColor}`,
              borderRadius: 3,
              flexShrink: 0,
            }}
          >
            <span
              className="ls-mono"
              style={{ fontSize: density.fontDisplay * 0.8, color: statColor, lineHeight: 1 }}
            >
              {statData?.score ?? 0}
            </span>
            <span className="ls-mono" style={{ fontSize: density.fontMeta - 1, color: theme.inkFaint, letterSpacing: '0.04em' }}>
              /100
            </span>
          </div>

          <div style={{ flex: 1 }}>
            <span
              className="ls-mono"
              style={{
                fontSize: density.fontHead * 1.1,
                color: statColor,
                letterSpacing: '0.06em',
                display: 'block',
                marginBottom: 4,
              }}
            >
              {stat}
            </span>
            {statDesc && (
              <p style={{ fontSize: density.fontBody, color: theme.inkDim, lineHeight: 1.5, fontFamily: 'inherit', margin: 0, marginBottom: 8 }}>
                {statDesc}
              </p>
            )}
            {(statData?.decayDays ?? 0) > 0 && (
              <Pill
                color={(statData?.decayDays ?? 0) >= 14 ? theme.danger : (statData?.decayDays ?? 0) >= 10 ? theme.warn : theme.inkMute}
              >
                {statData?.decayDays ?? 0}d dormant
              </Pill>
            )}
          </div>
        </div>

        {/* Stat bar */}
        <div style={{ marginTop: density.padCard }}>
          <StatBar
            stat={stat}
            value={statData?.score ?? 0}
            decayDays={statData?.decayDays ?? 0}
          />
        </div>
      </div>

      {/* 30-day sparkline */}
      <div
        style={{
          padding: `${density.padCard}px ${density.padScreen}px`,
          borderBottom: `1px solid ${theme.rule2}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <Meta>30-Day History</Meta>
          <span className="ls-mono" style={{ fontSize: density.fontMeta - 1, color: theme.inkFaint }}>
            {history.length > 0 ? `${history.length} entries` : 'synthetic'}
          </span>
        </div>
        <Spark
          data={sparkData}
          width={Math.min(320, 1200)}
          height={36}
          color={statColor}
          style={{ width: '100%', maxWidth: '100%' }}
        />
        {history.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span className="ls-mono" style={{ fontSize: density.fontMeta - 1, color: theme.inkFaint }}>
              {humanDateIST(history[history.length - 1]?.date)}
            </span>
            <span className="ls-mono" style={{ fontSize: density.fontMeta - 1, color: theme.inkFaint }}>
              {humanDateIST(history[0]?.date)}
            </span>
          </div>
        )}
      </div>

      {/* Quest log summary */}
      {questLog.length > 0 && (
        <div
          style={{
            padding: `${density.padCard}px ${density.padScreen}px`,
            borderBottom: `1px solid ${theme.rule2}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: density.gap }}>
            <Meta>Quest Log</Meta>
            <span className="ls-mono" style={{ fontSize: density.fontMeta - 1, color: theme.inkFaint }}>
              {completedCount}/{questLog.length} complete
            </span>
          </div>

          {/* Completion bar */}
          <div style={{ height: 3, background: theme.rule, borderRadius: 2, overflow: 'hidden', marginBottom: density.gap }}>
            <div
              style={{
                height: '100%',
                width: `${questLog.length > 0 ? (completedCount / questLog.length) * 100 : 0}%`,
                background: statColor,
                borderRadius: 2,
              }}
            />
          </div>

          {recentQuests.map((quest) => (
            <div
              key={quest.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: `${density.padCard * 0.6}px 0`,
                borderBottom: `1px solid ${theme.rule2}`,
              }}
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 1,
                  border: `1px solid ${quest.status === 'complete' ? theme.good : quest.status === 'failed' ? theme.danger : theme.rule}`,
                  background: quest.status === 'complete' ? `${theme.good}20` : quest.status === 'failed' ? `${theme.danger}20` : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {quest.status === 'complete' && <Glyph kind="check" size={10} color={theme.good} />}
                {quest.status === 'failed' && <Glyph kind="cross" size={10} color={theme.danger} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: density.fontBody,
                    color: quest.status === 'complete' ? theme.inkDim : theme.ink,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {quest.title}
                </div>
              </div>
              <span className="ls-mono" style={{ fontSize: density.fontMeta - 1, color: theme.inkFaint, flexShrink: 0 }}>
                +{quest.xp}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Skills for this stat */}
      {skills.length > 0 && (
        <div style={{ paddingBottom: density.padScreen }}>
          <div
            style={{
              padding: `${density.padCard * 0.7}px ${density.padScreen}px`,
              borderBottom: `1px solid ${theme.rule2}`,
              background: theme.surface,
            }}
          >
            <Meta>Skills</Meta>
          </div>

          {byTier.map(({ tier, skills: tierSkills }) => (
            <div key={tier}>
              <div
                style={{
                  padding: `${density.padCard * 0.5}px ${density.padScreen}px`,
                  borderBottom: `1px solid ${theme.rule2}`,
                }}
              >
                <span className="ls-mono" style={{ fontSize: density.fontMeta - 1, color: theme.inkFaint, letterSpacing: '0.08em' }}>
                  {tierLabel[tier]}
                </span>
              </div>
              {tierSkills.map((skill) => {
                const isUnlocked = skill.status === 'unlocked';
                const isLocked = skill.status === 'locked';

                return (
                  <button
                    key={skill.id}
                    onClick={() => setSelectedSkill(skill)}
                    className="ls-press"
                    style={{
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      borderBottom: `1px solid ${theme.rule2}`,
                      padding: `${density.padCard * 0.8}px ${density.padScreen}px`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      cursor: 'pointer',
                      textAlign: 'left',
                      opacity: isLocked ? 0.5 : 1,
                    }}
                  >
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 2,
                        border: `1px solid ${isUnlocked ? theme.good : isLocked ? theme.rule : statColor}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        background: isUnlocked ? `${theme.good}15` : 'transparent',
                      }}
                    >
                      {isUnlocked && <Glyph kind="check" size={11} color={theme.good} />}
                      {isLocked && <Glyph kind="lock" size={11} color={theme.inkFaint} />}
                      {skill.status === 'active' && (
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: statColor }} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: density.fontBody, color: theme.ink, marginBottom: 2 }}>
                        {skill.name}
                      </div>
                      {skill.scoreThreshold > 0 && (
                        <span className="ls-mono" style={{ fontSize: density.fontMeta - 1, color: theme.inkFaint }}>
                          ≥{skill.scoreThreshold}
                        </span>
                      )}
                    </div>
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                      <path d="M5 3l4 4-4 4" stroke={theme.inkFaint} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </ScreenScroll>
  );
}
