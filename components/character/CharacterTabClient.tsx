'use client';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '@/components/providers/AppProvider';
import {
  Rule,
  Meta,
  Pill,
  Btn,
  Card,
  ScreenScroll,
  StatBar,
  Ring,
  Spider,
  Glyph,
  RowLink,
} from '@/components/primitives/index';
import type { PlayerProfile, CharacterStat, Skill, PassiveHabit, ArcTracker } from '@/lib/notion/types';
import { STAT_DESC } from '@/lib/theme';

// ─── Props ────────────────────────────────────────────────────────────────────

interface PassiveGroups {
  active: PassiveHabit[];
  building: PassiveHabit[];
  broken: PassiveHabit[];
}

interface CharacterTabClientProps {
  player: PlayerProfile | null;
  stats: CharacterStat[];
  skills: Skill[];
  passives: PassiveGroups;
  arc: ArcTracker | null;
}

type SubView = 'overview' | 'skills' | 'passives' | 'pillars' | 'level';

// ─── LevelHistory ─────────────────────────────────────────────────────────────

function LevelHistory({ player }: { player: PlayerProfile | null }) {
  const { theme, density } = useApp();

  if (!player) return null;

  const xpPct = player.xpToNext > 0
    ? Math.min(100, (player.totalXP / (player.totalXP + player.xpToNext)) * 100)
    : 100;

  return (
    <div style={{ padding: density.padScreen, display: 'flex', flexDirection: 'column', gap: density.gap * 1.5 }}>
      {/* Level display */}
      <div style={{ display: 'flex', alignItems: 'center', gap: density.padScreen }}>
        <Ring
          value={xpPct}
          size={100}
          color={theme.accent}
          label={`${player.level}`}
          sublabel="LVL"
        />
        <div>
          <div style={{ fontSize: density.fontHead, color: theme.ink, fontWeight: 500, marginBottom: 4 }}>
            Level {player.level}
          </div>
          <div className="ls-mono" style={{ fontSize: density.fontMeta, color: theme.inkDim, marginBottom: 2 }}>
            {player.totalXP.toLocaleString()} XP total
          </div>
          <div className="ls-mono" style={{ fontSize: density.fontMeta, color: theme.inkMute }}>
            {player.xpToNext.toLocaleString()} XP to next
          </div>
        </div>
      </div>

      <Rule />

      {/* Streak info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: density.gap }}>
        {[
          { label: 'Current Streak', value: `${player.streak}d`, color: player.streak > 0 ? theme.good : theme.inkMute },
          { label: 'Best Streak', value: `${player.bestStreak}d`, color: theme.accent },
          { label: 'Game Day', value: `Day ${player.day}`, color: theme.ink },
          { label: 'XP Progress', value: `${Math.round(xpPct)}%`, color: theme.inkDim },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              padding: density.padCard,
              background: theme.surface2,
              border: `1px solid ${theme.rule}`,
              borderRadius: 2,
            }}
          >
            <Meta style={{ marginBottom: 4 }}>{item.label}</Meta>
            <div className="ls-mono" style={{ fontSize: density.fontBody, color: item.color }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MonarchLock / Pillar ──────────────────────────────────────────────────────

interface PillarProps {
  name: string;
  condition: string;
  locked: boolean;
  stat?: string;
  score?: number;
  threshold?: number;
}

function Pillar({ name, condition, locked, stat, score = 0, threshold = 50 }: PillarProps) {
  const { theme, density } = useApp();
  const statColor = stat ? (theme.stat[stat] || theme.accent) : theme.accent;

  return (
    <div
      style={{
        padding: density.padCard,
        background: locked ? `${theme.danger}08` : `${theme.good}08`,
        border: `1px solid ${locked ? theme.danger + '30' : theme.good + '30'}`,
        borderRadius: 3,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 2,
          border: `1.5px solid ${locked ? theme.danger : theme.good}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: 1,
        }}
      >
        {locked
          ? <Glyph kind="lock" size={14} color={theme.danger} />
          : <Glyph kind="check" size={14} color={theme.good} />}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: density.fontBody, color: locked ? theme.inkDim : theme.ink, fontWeight: 500, marginBottom: 3 }}>
          {name}
        </div>
        <div style={{ fontSize: density.fontMeta, color: theme.inkMute, fontFamily: 'inherit', lineHeight: 1.4 }}>
          {condition}
        </div>
        {stat && (
          <div style={{ marginTop: 6 }}>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}
            >
              <span className="ls-mono" style={{ fontSize: density.fontMeta - 1, color: statColor }}>
                {stat}
              </span>
              <span className="ls-mono" style={{ fontSize: density.fontMeta - 1, color: theme.inkFaint }}>
                {score}/{threshold}
              </span>
            </div>
            <div style={{ height: 3, background: theme.rule, borderRadius: 2, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(100, (score / threshold) * 100)}%`,
                  background: locked ? theme.danger : theme.good,
                  borderRadius: 2,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MonarchLock({ stats }: { stats: CharacterStat[] }) {
  const { theme, density, voice } = useApp();

  // Three Monarchs Pillars: CRAFT ≥ 50, BUILDER ≥ 50, CAPITAL ≥ 40
  const PILLARS: PillarProps[] = [
    {
      name: 'The Craft Pillar',
      condition: 'CRAFT score ≥ 50. Writing quality that speaks without explanation.',
      locked: (stats.find(s => s.stat === 'CRAFT')?.score ?? 0) < 50,
      stat: 'CRAFT',
      score: stats.find(s => s.stat === 'CRAFT')?.score ?? 0,
      threshold: 50,
    },
    {
      name: 'The Builder Pillar',
      condition: 'BUILDER score ≥ 50. Shipped work that earns its place.',
      locked: (stats.find(s => s.stat === 'BUILDER')?.score ?? 0) < 50,
      stat: 'BUILDER',
      score: stats.find(s => s.stat === 'BUILDER')?.score ?? 0,
      threshold: 50,
    },
    {
      name: 'The Capital Pillar',
      condition: 'CAPITAL score ≥ 40. Financial discipline embedded in habit.',
      locked: (stats.find(s => s.stat === 'CAPITAL')?.score ?? 0) < 40,
      stat: 'CAPITAL',
      score: stats.find(s => s.stat === 'CAPITAL')?.score ?? 0,
      threshold: 40,
    },
  ];

  const lockedCount = PILLARS.filter((p) => p.locked).length;
  const allOpen = lockedCount === 0;

  return (
    <div style={{ padding: density.padScreen, display: 'flex', flexDirection: 'column', gap: density.gap }}>
      {/* Monarch status */}
      <div
        style={{
          padding: density.padCard,
          background: allOpen ? `${theme.accent}10` : theme.surface2,
          border: `1px solid ${allOpen ? theme.accent + '40' : theme.rule}`,
          borderRadius: 3,
          textAlign: 'center',
        }}
      >
        <div
          className="ls-mono"
          style={{
            fontSize: density.fontMeta,
            color: allOpen ? theme.accent : theme.inkMute,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: 4,
          }}
        >
          Monarch Mode
        </div>
        <div
          style={{
            fontSize: density.fontBody,
            color: allOpen ? theme.accent : theme.inkDim,
            fontFamily: 'inherit',
            lineHeight: 1.5,
          }}
        >
          {allOpen ? 'All pillars open. Monarch Mode active.' : voice.pillarLock(3 - lockedCount)}
        </div>
      </div>

      {PILLARS.map((pillar) => (
        <Pillar key={pillar.name} {...pillar} />
      ))}
    </div>
  );
}

// ─── ThreePillars ─────────────────────────────────────────────────────────────

function ThreePillars({ stats }: { stats: CharacterStat[] }) {
  return <MonarchLock stats={stats} />;
}

// ─── PassiveBucket ────────────────────────────────────────────────────────────

interface PassiveBucketProps {
  label: string;
  items: PassiveHabit[];
  color?: string;
}

function PassiveBucket({ label, items, color }: PassiveBucketProps) {
  const { theme, density } = useApp();

  if (items.length === 0) return null;

  return (
    <div style={{ marginBottom: density.gap * 2 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: `${density.padCard * 0.6}px ${density.padScreen}px`,
          borderBottom: `1px solid ${theme.rule2}`,
        }}
      >
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: color || theme.accent }} />
        <Meta color={color}>{label}</Meta>
        <span className="ls-mono" style={{ fontSize: density.fontMeta - 1, color: theme.inkFaint, marginLeft: 'auto' }}>
          {items.length}
        </span>
      </div>
      {items.map((item) => {
        const statColor = theme.stat[item.stat] || theme.accent;
        return (
          <div
            key={item.id}
            style={{
              padding: `${density.padCard * 0.8}px ${density.padScreen}px`,
              borderBottom: `1px solid ${theme.rule2}`,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: density.fontBody, color: theme.ink, marginBottom: 3 }}>
                {item.title}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className="ls-mono" style={{ fontSize: density.fontMeta, color: statColor }}>
                  {item.stat}
                </span>
                {item.streakDays > 0 && (
                  <span className="ls-mono" style={{ fontSize: density.fontMeta, color: theme.good }}>
                    {item.streakDays}d streak
                  </span>
                )}
                {item.lapsedDays && item.lapsedDays > 0 && (
                  <span className="ls-mono" style={{ fontSize: density.fontMeta, color: theme.danger }}>
                    {item.lapsedDays}d lapsed
                  </span>
                )}
                {item.dailyXp && (
                  <span className="ls-mono" style={{ fontSize: density.fontMeta, color: theme.inkFaint }}>
                    +{item.dailyXp} XP/day
                  </span>
                )}
              </div>
            </div>
            <span className="ls-mono" style={{ fontSize: density.fontMeta, color: theme.inkFaint }}>
              {item.completionCount}×
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── PassiveLibrary ───────────────────────────────────────────────────────────

function PassiveLibrary({ passives }: { passives: PassiveGroups }) {
  const { theme, density } = useApp();
  const total = passives.active.length + passives.building.length + passives.broken.length;

  return (
    <ScreenScroll>
      {total === 0 ? (
        <div style={{ padding: density.padScreen * 2, textAlign: 'center' }}>
          <p style={{ fontSize: density.fontBody, color: theme.inkMute, fontFamily: 'inherit' }}>
            No passive habits tracked yet.
          </p>
        </div>
      ) : (
        <>
          <PassiveBucket label="Active" items={passives.active} color={theme.good} />
          <PassiveBucket label="Building" items={passives.building} color={theme.warn} />
          <PassiveBucket label="Broken" items={passives.broken} color={theme.danger} />
        </>
      )}
    </ScreenScroll>
  );
}

// ─── SkillRegistry ────────────────────────────────────────────────────────────

function SkillRegistry({ skills }: { skills: Skill[] }) {
  const { theme, density } = useApp();

  const byTier = [1, 2, 3, 4].map((tier) => ({
    tier,
    skills: skills.filter((s) => s.tier === tier),
  })).filter((g) => g.skills.length > 0);

  const tierLabel: Record<number, string> = {
    1: 'Tier I — Foundation',
    2: 'Tier II — Competence',
    3: 'Tier III — Mastery',
    4: 'Tier IV — Sovereign',
  };

  return (
    <ScreenScroll>
      {byTier.length === 0 ? (
        <div style={{ padding: density.padScreen * 2, textAlign: 'center' }}>
          <p style={{ fontSize: density.fontBody, color: theme.inkMute, fontFamily: 'inherit' }}>
            No skills registered yet.
          </p>
        </div>
      ) : (
        byTier.map(({ tier, skills: tierSkills }) => (
          <div key={tier} style={{ marginBottom: density.gap }}>
            <div
              style={{
                padding: `${density.padCard * 0.6}px ${density.padScreen}px`,
                borderBottom: `1px solid ${theme.rule2}`,
                background: theme.surface,
              }}
            >
              <Meta>{tierLabel[tier]}</Meta>
            </div>
            {tierSkills.map((skill) => {
              const statColor = theme.stat[skill.stat] || theme.accent;
              const isUnlocked = skill.status === 'unlocked';
              const isLocked = skill.status === 'locked';

              return (
                <div
                  key={skill.id}
                  style={{
                    padding: `${density.padCard}px ${density.padScreen}px`,
                    borderBottom: `1px solid ${theme.rule2}`,
                    opacity: isLocked ? 0.5 : 1,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 2,
                        border: `1px solid ${isUnlocked ? theme.good : isLocked ? theme.rule : statColor}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: 1,
                        background: isUnlocked ? `${theme.good}15` : 'transparent',
                      }}
                    >
                      {isUnlocked && <Glyph kind="check" size={12} color={theme.good} />}
                      {isLocked && <Glyph kind="lock" size={12} color={theme.inkFaint} />}
                      {skill.status === 'active' && (
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: statColor }} />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                        <span style={{ fontSize: density.fontBody, color: theme.ink }}>{skill.name}</span>
                        <span className="ls-mono" style={{ fontSize: density.fontMeta, color: statColor }}>
                          {skill.stat}
                        </span>
                        {skill.scoreThreshold > 0 && (
                          <span className="ls-mono" style={{ fontSize: density.fontMeta - 1, color: theme.inkFaint }}>
                            ≥{skill.scoreThreshold}
                          </span>
                        )}
                      </div>
                      {skill.description && (
                        <p style={{ fontSize: density.fontMeta, color: theme.inkDim, lineHeight: 1.5, fontFamily: 'inherit', margin: 0 }}>
                          {skill.description}
                        </p>
                      )}
                      {isUnlocked && skill.deliverable && (
                        <p style={{ fontSize: density.fontMeta, color: theme.good, lineHeight: 1.4, fontFamily: 'inherit', marginTop: 4, fontStyle: 'italic' }}>
                          {skill.deliverable}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))
      )}
    </ScreenScroll>
  );
}

// ─── CharacterOverview ────────────────────────────────────────────────────────

function CharacterOverview({
  player,
  stats,
  arc,
  onStatClick,
}: {
  player: PlayerProfile | null;
  stats: CharacterStat[];
  arc: ArcTracker | null;
  onStatClick: (stat: string) => void;
}) {
  const { theme, density } = useApp();

  const spiderData = stats.reduce((acc, s) => {
    acc[s.stat] = s.score;
    return acc;
  }, {} as Record<string, number>);

  const xpPct = player
    ? Math.min(100, (player.totalXP / (player.totalXP + player.xpToNext)) * 100)
    : 0;

  return (
    <ScreenScroll>
      {/* Player summary */}
      {player && (
        <div
          style={{
            padding: `${density.padScreen}px ${density.padScreen}px ${density.padCard}px`,
            borderBottom: `1px solid ${theme.rule}`,
            display: 'flex',
            alignItems: 'center',
            gap: density.padScreen,
          }}
        >
          <Ring
            value={xpPct}
            size={88}
            color={theme.accent}
            label={`${player.level}`}
            sublabel="LVL"
          />
          <div>
            <div style={{ fontSize: density.fontHead * 1.05, color: theme.ink, fontWeight: 500, marginBottom: 4 }}>
              {player.name}
            </div>
            <div className="ls-mono" style={{ fontSize: density.fontMeta, color: theme.inkDim, marginBottom: 2 }}>
              Day {player.day} · {player.streak}d streak
            </div>
            <div className="ls-mono" style={{ fontSize: density.fontMeta, color: theme.inkFaint }}>
              {player.totalXP.toLocaleString()} XP · {player.xpToNext.toLocaleString()} to next
            </div>
          </div>
        </div>
      )}

      {/* Spider chart */}
      {Object.keys(spiderData).length >= 3 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: `${density.padCard}px 0`,
            borderBottom: `1px solid ${theme.rule2}`,
          }}
        >
          <Spider data={spiderData} size={200} />
        </div>
      )}

      {/* Arc mini */}
      {arc && (
        <div
          style={{
            padding: `${density.padCard}px ${density.padScreen}px`,
            borderBottom: `1px solid ${theme.rule2}`,
          }}
        >
          <Meta style={{ marginBottom: 6 }}>Active Arc</Meta>
          <div style={{ fontSize: density.fontBody, color: theme.ink, marginBottom: 4 }}>
            {arc.title}
          </div>
          <div
            style={{ height: 3, background: theme.rule, borderRadius: 2, overflow: 'hidden', marginBottom: 4 }}
          >
            <div
              style={{
                height: '100%',
                width: `${arc.percent}%`,
                background: theme.stat[arc.stat] || theme.accent,
                borderRadius: 2,
              }}
            />
          </div>
          <div className="ls-mono" style={{ fontSize: density.fontMeta - 1, color: theme.inkFaint }}>
            {arc.completedQuests}/{arc.totalQuests} quests · {arc.percent}%
          </div>
        </div>
      )}

      {/* Stat bars with tap-through */}
      <div style={{ padding: `${density.padCard}px ${density.padScreen}px` }}>
        <Meta style={{ marginBottom: density.gap }}>Character Stats</Meta>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {stats.map((s) => (
            <button
              key={s.stat}
              onClick={() => onStatClick(s.stat)}
              className="ls-press"
              style={{
                background: 'none',
                border: 'none',
                padding: `${density.padCard * 0.7}px 0`,
                borderBottom: `1px solid ${theme.rule2}`,
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
              }}
            >
              <StatBar stat={s.stat} value={s.score} decayDays={s.decayDays} />
              {STAT_DESC[s.stat as keyof typeof STAT_DESC] && (
                <p
                  style={{
                    fontSize: density.fontMeta - 1,
                    color: theme.inkFaint,
                    marginTop: 3,
                    fontFamily: 'inherit',
                    lineHeight: 1.4,
                  }}
                >
                  {STAT_DESC[s.stat as keyof typeof STAT_DESC]}
                </p>
              )}
            </button>
          ))}
        </div>
      </div>
    </ScreenScroll>
  );
}

// ─── Sub-view Tab Bar ─────────────────────────────────────────────────────────

const SUB_VIEWS: { id: SubView; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'skills', label: 'Skills' },
  { id: 'passives', label: 'Passives' },
  { id: 'pillars', label: 'Pillars' },
  { id: 'level', label: 'Level' },
];

function SubViewTabs({ active, onChange }: { active: SubView; onChange: (v: SubView) => void }) {
  const { theme, density } = useApp();

  return (
    <div
      style={{
        display: 'flex',
        borderBottom: `1px solid ${theme.rule}`,
        background: theme.surface,
        flexShrink: 0,
        overflowX: 'auto',
      }}
    >
      {SUB_VIEWS.map((sv) => {
        const isActive = sv.id === active;
        return (
          <button
            key={sv.id}
            onClick={() => onChange(sv.id)}
            className="ls-press ls-mono"
            style={{
              padding: `${density.padCard * 0.7}px ${density.padCard}px`,
              fontSize: density.fontMeta,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              background: 'none',
              border: 'none',
              borderBottom: `2px solid ${isActive ? theme.accent : 'transparent'}`,
              color: isActive ? theme.accent : theme.inkMute,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {sv.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── CharacterTabClient (main) ────────────────────────────────────────────────

export default function CharacterTabClient({
  player,
  stats,
  skills,
  passives,
  arc,
}: CharacterTabClientProps) {
  const router = useRouter();
  const [subView, setSubView] = useState<SubView>('overview');

  const handleStatClick = (stat: string) => {
    router.push(`/character/${stat.toLowerCase()}`);
  };

  const renderSubView = () => {
    switch (subView) {
      case 'overview':
        return (
          <CharacterOverview
            player={player}
            stats={stats}
            arc={arc}
            onStatClick={handleStatClick}
          />
        );
      case 'skills':
        return <SkillRegistry skills={skills} />;
      case 'passives':
        return <PassiveLibrary passives={passives} />;
      case 'pillars':
        return <ThreePillars stats={stats} />;
      case 'level':
        return (
          <ScreenScroll>
            <LevelHistory player={player} />
          </ScreenScroll>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <SubViewTabs active={subView} onChange={setSubView} />
      {renderSubView()}
    </div>
  );
}
