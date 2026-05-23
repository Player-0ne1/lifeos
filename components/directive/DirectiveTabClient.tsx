'use client';
import { useState, useTransition, useEffect } from 'react';
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
  Stamp,
  Ring,
  Glyph,
} from '@/components/primitives/index';
import { FlowOverlay } from '@/components/flows/FlowOverlay';
import type { DailyCheckin, Quest, ArcTracker, CharacterStat, WeeklyLedger } from '@/lib/notion/types';
import { difficultyColor, humanDateIST } from '@/lib/utils';

// ─── Props ────────────────────────────────────────────────────────────────────

interface DirectiveTabClientProps {
  dayState: string;
  checkin: DailyCheckin | null;
  quests: Quest[];
  arc: ArcTracker | null;
  stats: CharacterStat[];
  week: WeeklyLedger | null;
}

// ─── AlertRow ─────────────────────────────────────────────────────────────────

interface AlertRowProps {
  text: string;
  kind?: 'warn' | 'danger' | 'info';
}

function AlertRow({ text, kind = 'info' }: AlertRowProps) {
  const { theme, density } = useApp();
  const color = kind === 'danger' ? theme.danger : kind === 'warn' ? theme.warn : theme.accent;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: `${density.padCard * 0.7}px ${density.padScreen}px`,
        background: `${color}0d`,
        borderBottom: `1px solid ${color}30`,
      }}
    >
      <div
        style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: color,
          flexShrink: 0,
        }}
      />
      <span
        className="ls-mono"
        style={{ fontSize: density.fontMeta, color, letterSpacing: '0.04em' }}
      >
        {text}
      </span>
    </div>
  );
}

// ─── WeekStatus ───────────────────────────────────────────────────────────────

interface WeekStatusProps {
  week: WeeklyLedger | null;
}

function WeekStatus({ week }: WeekStatusProps) {
  const { theme, density } = useApp();

  const cols = [
    { label: 'Quests', value: week ? `${week.questsCompleted}/${week.questsTotal}` : '—' },
    { label: 'Completion', value: week ? `${week.completionPct}%` : '—' },
    { label: 'XP Earned', value: week ? `${week.xpEarned}` : '—' },
    { label: 'Penalty', value: week?.penaltyAmount ? `₹${week.penaltyAmount.toLocaleString('en-IN')}` : 'None' },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        borderBottom: `1px solid ${theme.rule2}`,
      }}
    >
      {cols.map((col, i) => (
        <div
          key={col.label}
          style={{
            padding: `${density.padCard * 0.8}px ${density.padCard}px`,
            borderRight: i < 3 ? `1px solid ${theme.rule2}` : undefined,
            textAlign: 'center',
          }}
        >
          <div
            className="ls-mono"
            style={{ fontSize: density.fontMeta, color: theme.inkMute, marginBottom: 3 }}
          >
            {col.label}
          </div>
          <div
            className="ls-mono"
            style={{ fontSize: density.fontBody, color: theme.ink }}
          >
            {col.value}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── ArcMini ──────────────────────────────────────────────────────────────────

interface ArcMiniProps {
  arc: ArcTracker;
}

function ArcMini({ arc }: ArcMiniProps) {
  const { theme, density } = useApp();
  const statColor = theme.stat[arc.stat] || theme.accent;
  const paceColor = arc.pace === 'ahead' ? theme.good : arc.pace === 'behind' ? theme.danger : theme.accent;

  return (
    <div
      style={{
        padding: `${density.padCard}px ${density.padScreen}px`,
        borderBottom: `1px solid ${theme.rule2}`,
        background: theme.surface,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            className="ls-mono"
            style={{ fontSize: density.fontMeta, color: statColor, letterSpacing: '0.06em' }}
          >
            ARC · {arc.stat}
          </span>
          <Pill color={paceColor}>{arc.pace}</Pill>
        </div>
        <span
          className="ls-mono"
          style={{ fontSize: density.fontMeta, color: theme.inkMute }}
        >
          Day {arc.dayElapsed}/{arc.dayTotal}
        </span>
      </div>
      <div
        style={{
          fontSize: density.fontBody,
          color: theme.ink,
          marginBottom: 6,
          lineHeight: 1.3,
        }}
      >
        {arc.title}
      </div>
      {/* Progress bar */}
      <div style={{ height: 3, background: theme.rule, borderRadius: 2, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${arc.percent}%`,
            background: statColor,
            borderRadius: 2,
          }}
        />
      </div>
      <div
        className="ls-mono"
        style={{ fontSize: density.fontMeta - 1, color: theme.inkFaint, marginTop: 3, textAlign: 'right' }}
      >
        {arc.completedQuests}/{arc.totalQuests} quests · {arc.percent}%
      </div>
    </div>
  );
}

// ─── QuestCard ────────────────────────────────────────────────────────────────

interface QuestCardProps {
  quest: Quest;
  onComplete: (id: string) => void;
  onFail: (id: string) => void;
  isPending: boolean;
}

function QuestCard({ quest, onComplete, onFail, isPending }: QuestCardProps) {
  const { theme, density } = useApp();
  const [expanded, setExpanded] = useState(false);
  const statColor = theme.stat[quest.stat] || theme.accent;
  const diffColor = difficultyColor(quest.difficulty, theme);

  const isComplete = quest.status === 'complete';
  const isFailed = quest.status === 'failed';
  const isDone = isComplete || isFailed;

  return (
    <div
      style={{
        borderBottom: `1px solid ${theme.rule2}`,
        opacity: isDone ? 0.6 : 1,
        transition: 'opacity 200ms ease',
      }}
    >
      {/* Main row */}
      <button
        onClick={() => !isDone && setExpanded(!expanded)}
        className="ls-press"
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          padding: `${density.padCard}px ${density.padScreen}px`,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          cursor: isDone ? 'default' : 'pointer',
          textAlign: 'left',
        }}
      >
        {/* Status indicator */}
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: 2,
            border: `1px solid ${isComplete ? theme.good : isFailed ? theme.danger : theme.rule}`,
            background: isComplete ? `${theme.good}20` : isFailed ? `${theme.danger}20` : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: 1,
          }}
        >
          {isComplete && <Glyph kind="check" size={12} color={theme.good} />}
          {isFailed && <Glyph kind="cross" size={12} color={theme.danger} />}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: density.fontBody,
              color: isDone ? theme.inkDim : theme.ink,
              lineHeight: 1.3,
              marginBottom: 4,
            }}
          >
            {quest.title}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <span
              className="ls-mono"
              style={{ fontSize: density.fontMeta, color: statColor }}
            >
              {quest.stat}
            </span>
            <span className="ls-mono" style={{ fontSize: density.fontMeta, color: diffColor }}>
              {quest.difficulty}
            </span>
            <span className="ls-mono" style={{ fontSize: density.fontMeta, color: theme.inkFaint }}>
              {quest.xp} XP
            </span>
            {quest.isArc && (
              <Pill color={theme.accent}>ARC</Pill>
            )}
            {quest.isBonus && (
              <Pill color={theme.warn}>BONUS</Pill>
            )}
          </div>
        </div>

        {/* Expand indicator */}
        {!isDone && (
          <span
            style={{
              color: theme.inkFaint,
              fontSize: 10,
              transform: expanded ? 'rotate(180deg)' : undefined,
              transition: 'transform 150ms ease',
              flexShrink: 0,
              marginTop: 4,
            }}
          >
            ▾
          </span>
        )}
      </button>

      {/* Expanded detail */}
      {expanded && !isDone && (
        <div
          className="ls-fade-in"
          style={{
            padding: `0 ${density.padScreen}px ${density.padCard}px`,
            paddingLeft: density.padScreen + 32,
          }}
        >
          {quest.brief && (
            <p
              style={{
                fontSize: density.fontBody,
                color: theme.inkDim,
                lineHeight: 1.6,
                marginBottom: density.padCard,
                fontFamily: 'inherit',
              }}
            >
              {quest.brief}
            </p>
          )}

          {quest.proofStandard && (
            <div
              style={{
                padding: `${density.padCard * 0.7}px ${density.padCard}px`,
                background: theme.surface2,
                border: `1px solid ${theme.rule}`,
                borderRadius: 2,
                marginBottom: density.padCard,
              }}
            >
              <Meta color={theme.inkMute} style={{ marginBottom: 4 }}>
                Proof Standard
              </Meta>
              <p
                style={{
                  fontSize: density.fontMeta,
                  color: theme.inkDim,
                  lineHeight: 1.5,
                  fontFamily: 'inherit',
                  margin: 0,
                }}
              >
                {quest.proofStandard}
              </p>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <Btn
              variant="ghost"
              danger
              size="sm"
              disabled={isPending}
              onClick={() => onFail(quest.id)}
            >
              Abandon
            </Btn>
            <Btn
              size="sm"
              disabled={isPending}
              onClick={() => onComplete(quest.id)}
              style={{ flex: 1 }}
            >
              Complete
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── YesterdaySummary ─────────────────────────────────────────────────────────

interface YesterdaySummaryProps {
  checkin: DailyCheckin;
}

function YesterdaySummary({ checkin }: YesterdaySummaryProps) {
  const { theme, density } = useApp();
  const [open, setOpen] = useState(false);

  if (!checkin.dayNote && !checkin.directiveText) return null;

  return (
    <div style={{ borderBottom: `1px solid ${theme.rule2}` }}>
      <button
        onClick={() => setOpen(!open)}
        className="ls-press"
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          padding: `${density.padCard * 0.8}px ${density.padScreen}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
        }}
      >
        <span
          className="ls-mono"
          style={{ fontSize: density.fontMeta, color: theme.inkMute, letterSpacing: '0.06em', textTransform: 'uppercase' }}
        >
          Yesterday's Summary
        </span>
        <span style={{ color: theme.inkFaint, fontSize: 10, transform: open ? 'rotate(180deg)' : undefined }}>
          ▾
        </span>
      </button>
      {open && (
        <div
          className="ls-fade-in"
          style={{
            padding: `0 ${density.padScreen}px ${density.padCard}px`,
          }}
        >
          {checkin.directiveText && (
            <p style={{ fontSize: density.fontBody, color: theme.inkDim, lineHeight: 1.6, marginBottom: 8, fontFamily: 'inherit' }}>
              {checkin.directiveText}
            </p>
          )}
          {checkin.dayNote && (
            <p style={{ fontSize: density.fontBody, color: theme.inkMute, lineHeight: 1.6, fontFamily: 'inherit', fontStyle: 'italic' }}>
              {checkin.dayNote}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── DayCompleteStamp ─────────────────────────────────────────────────────────

function DayCompleteStamp({ failed = false }: { failed?: boolean }) {
  const { theme, voice } = useApp();
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '24px 0',
      }}
    >
      <Stamp
        text={failed ? 'FAILED' : voice.allComplete}
        color={failed ? theme.danger : theme.good}
        size="lg"
        animate
      />
    </div>
  );
}

// ─── PreCheckin ───────────────────────────────────────────────────────────────

interface PreCheckinProps {
  checkin: DailyCheckin | null;
  stats: CharacterStat[];
  week: WeeklyLedger | null;
  arc: ArcTracker | null;
}

function PreCheckin({ checkin, stats, week, arc }: PreCheckinProps) {
  const { theme, density, voice, setOverlay } = useApp();

  // Decay warnings — stats dormant 10+ days
  const decayWarnings = stats.filter((s) => s.decayDays >= 10);

  return (
    <ScreenScroll>
      {/* Decay alerts */}
      {decayWarnings.map((s) => (
        <AlertRow
          key={s.stat}
          text={voice.decayWarn(s.stat, s.decayDays)}
          kind={s.decayDays >= 14 ? 'danger' : 'warn'}
        />
      ))}

      {/* Week status strip */}
      {week && <WeekStatus week={week} />}

      {/* Arc mini */}
      {arc && <ArcMini arc={arc} />}

      {/* Yesterday summary */}
      {checkin && <YesterdaySummary checkin={checkin} />}

      {/* Morning greeting */}
      <div
        style={{
          padding: `${density.padScreen * 1.5}px ${density.padScreen}px`,
          textAlign: 'center',
        }}
      >
        <div
          className="ls-mono"
          style={{
            fontSize: density.fontMeta,
            color: theme.inkMute,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          {voice.appName}
        </div>
        <div
          style={{
            fontSize: density.fontHead * 1.1,
            color: theme.ink,
            lineHeight: 1.2,
            marginBottom: 8,
            maxWidth: 360,
            margin: '0 auto',
          }}
        >
          {voice.morningGreeting(0)}
        </div>
        <p
          style={{
            fontSize: density.fontBody,
            color: theme.inkDim,
            lineHeight: 1.6,
            maxWidth: 360,
            margin: '12px auto 0',
            fontFamily: 'inherit',
          }}
        >
          {voice.directiveNote()}
        </p>
      </div>

      <div
        style={{
          padding: `${density.padCard}px ${density.padScreen}px ${density.padScreen}px`,
        }}
      >
        <Btn
          full
          size="lg"
          onClick={() => setOverlay({ kind: 'morning' })}
        >
          Begin Check-In
        </Btn>
      </div>

      {/* Stat decay overview */}
      {stats.length > 0 && (
        <div style={{ padding: `${density.padCard}px ${density.padScreen}px` }}>
          <Rule style={{ marginBottom: density.padCard }} />
          <Meta style={{ marginBottom: density.gap }}>Character Stats</Meta>
          <div style={{ display: 'flex', flexDirection: 'column', gap: density.gap }}>
            {stats.map((s) => (
              <StatBar
                key={s.stat}
                stat={s.stat}
                value={s.score}
                decayDays={s.decayDays}
              />
            ))}
          </div>
        </div>
      )}
    </ScreenScroll>
  );
}

// ─── ActiveDirective ──────────────────────────────────────────────────────────

interface ActiveDirectiveProps {
  checkin: DailyCheckin;
  quests: Quest[];
  arc: ArcTracker | null;
  week: WeeklyLedger | null;
  stats: CharacterStat[];
}

function ActiveDirective({ checkin, quests, arc, week, stats }: ActiveDirectiveProps) {
  const { theme, density, voice, setOverlay } = useApp();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const completed = quests.filter((q) => q.status === 'complete').length;
  const total = quests.length;
  const allDone = completed >= 3 || (total > 0 && completed === total);

  const handleComplete = (id: string) => {
    setOverlay({ kind: 'proof', questId: id });
  };

  const handleFail = (id: string) => {
    setOverlay({ kind: 'fail-confirm', questId: id });
  };

  // Decay warnings
  const decayWarnings = stats.filter((s) => s.decayDays >= 14);

  return (
    <ScreenScroll>
      {/* Danger alerts */}
      {decayWarnings.map((s) => (
        <AlertRow
          key={s.stat}
          text={voice.decayWarn(s.stat, s.decayDays)}
          kind="danger"
        />
      ))}

      {/* Week status */}
      {week && <WeekStatus week={week} />}

      {/* Arc mini */}
      {arc && <ArcMini arc={arc} />}

      {/* Directive header */}
      <div
        style={{
          padding: `${density.padScreen}px ${density.padScreen}px ${density.padCard}px`,
          borderBottom: `1px solid ${theme.rule}`,
        }}
      >
        <div
          className="ls-mono"
          style={{
            fontSize: density.fontMeta,
            color: theme.inkMute,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: 4,
          }}
        >
          Active Directive
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div
            style={{
              fontSize: density.fontHead,
              color: theme.ink,
              fontWeight: 500,
              lineHeight: 1.2,
            }}
          >
            Day {checkin.date ? new Date(checkin.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long' }) : '—'}
          </div>
          <div
            className="ls-mono"
            style={{
              fontSize: density.fontBody,
              color: theme.accent,
              fontWeight: 600,
            }}
          >
            {completed}/{Math.min(3, total)}
          </div>
        </div>
        {checkin.directiveText && (
          <p
            style={{
              fontSize: density.fontBody,
              color: theme.inkDim,
              lineHeight: 1.6,
              marginTop: 8,
              fontFamily: 'inherit',
            }}
          >
            {checkin.directiveText}
          </p>
        )}
      </div>

      {/* Quest list */}
      {quests.length === 0 ? (
        <div
          style={{
            padding: `${density.padScreen * 2}px ${density.padScreen}px`,
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontSize: density.fontBody,
              color: theme.inkMute,
              fontFamily: 'inherit',
            }}
          >
            No quests assigned. Check in again to generate your directive.
          </p>
        </div>
      ) : (
        quests.map((quest) => (
          <QuestCard
            key={quest.id}
            quest={quest}
            onComplete={handleComplete}
            onFail={handleFail}
            isPending={false}
          />
        ))
      )}

      {/* All-done call to action */}
      {allDone && (
        <div
          style={{
            padding: `${density.padCard}px ${density.padScreen}px`,
            borderTop: `1px solid ${theme.rule}`,
          }}
        >
          <p
            style={{
              fontSize: density.fontBody,
              color: theme.good,
              marginBottom: density.padCard,
              fontFamily: 'inherit',
              textAlign: 'center',
            }}
          >
            {voice.allComplete}
          </p>
          <Btn
            full
            onClick={() => setOverlay({ kind: 'evening' })}
          >
            Close Day
          </Btn>
        </div>
      )}

      {/* Energy readout */}
      {checkin.energy && (
        <div
          style={{
            padding: `${density.padCard * 0.8}px ${density.padScreen}px`,
            borderTop: `1px solid ${theme.rule2}`,
            display: 'flex',
            gap: 16,
            alignItems: 'center',
          }}
        >
          <span
            className="ls-mono"
            style={{ fontSize: density.fontMeta, color: theme.inkMute }}
          >
            Energy: {checkin.energy}/5
          </span>
          {checkin.constraints && (
            <span
              className="ls-mono"
              style={{ fontSize: density.fontMeta, color: theme.inkFaint, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {checkin.constraints}
            </span>
          )}
        </div>
      )}
    </ScreenScroll>
  );
}

// ─── DirectiveTabClient (main) ────────────────────────────────────────────────

export default function DirectiveTabClient({
  dayState,
  checkin,
  quests,
  arc,
  stats,
  week,
}: DirectiveTabClientProps) {
  const { overlay } = useApp();

  const renderContent = () => {
    if (dayState === 'all-complete') {
      return (
        <ScreenScroll>
          <DayCompleteStamp />
          {week && <WeekStatus week={week} />}
          {arc && <ArcMini arc={arc} />}
          {quests.length > 0 && (
            <div>
              {quests.map((quest) => (
                <QuestCard
                  key={quest.id}
                  quest={quest}
                  onComplete={() => {}}
                  onFail={() => {}}
                  isPending={true}
                />
              ))}
            </div>
          )}
        </ScreenScroll>
      );
    }

    if (dayState === 'failed') {
      return (
        <ScreenScroll>
          <DayCompleteStamp failed />
          {week && <WeekStatus week={week} />}
          {arc && <ArcMini arc={arc} />}
        </ScreenScroll>
      );
    }

    if (dayState === 'mid-day' && checkin) {
      return (
        <ActiveDirective
          checkin={checkin}
          quests={quests}
          arc={arc}
          week={week}
          stats={stats}
        />
      );
    }

    // pre-checkin (default)
    return (
      <PreCheckin
        checkin={checkin}
        stats={stats}
        week={week}
        arc={arc}
      />
    );
  };

  return (
    <>
      {renderContent()}
      <FlowOverlay />
    </>
  );
}
