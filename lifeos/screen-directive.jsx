// screen-directive.jsx — TAB I · DIRECTIVE.
// Handles all five day-states: pre-checkin, mid-day, evening, all-complete, failed.

function DirectiveTab({ device }) {
  const { dayState } = useApp();
  if (dayState === 'pre-checkin')  return <PreCheckin device={device} />;
  if (dayState === 'all-complete') return <ActiveDirective device={device} showStamp />;
  return <ActiveDirective device={device} />;
}

// ── Pre-check-in: the awaiting state ────────────────────────────────────────

function PreCheckin({ device }) {
  const { theme, voice, data, setOverlay } = useApp();
  const arc = data.arc;
  const ystr = data.yesterday;
  return <ScreenScroll>
    <div style={{ padding: device === 'phone' ? '20px 18px 28px' : '34px 40px 44px', maxWidth: 760 }}>

      <Meta>{voice.morningGreeting(data.player.day)}</Meta>
      <h1 style={{ fontFamily: 'Newsreader, serif', fontSize: device === 'phone' ? 28 : 40, fontWeight: 400, marginTop: 8, color: theme.ink, letterSpacing: '-0.015em', lineHeight: 1.05 }}>
        The morning ledger is open.
      </h1>
      <p style={{ marginTop: 10, color: theme.inkDim, fontStyle: 'italic', fontWeight: 300, maxWidth: 540 }}>
        Three obligations will be written when you sign in. Until then, nothing is asked of you.
      </p>

      {/* Yesterday's banner — most important inversion: this is permanent record */}
      {ystr.failed > 0 ? (
        <div style={{
          marginTop: 22, padding: '14px 16px', border: `1px solid ${theme.danger}`,
          background: 'transparent', borderLeft: `3px solid ${theme.danger}`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Meta style={{ color: theme.danger, letterSpacing: '0.18em' }}>Day {data.player.day - 1} · Default Recorded</Meta>
            <Mono size={10} dim>PENALTY DUNGEON · QUEUED</Mono>
          </div>
          <p style={{ marginTop: 8, color: theme.ink, fontFamily: 'Newsreader, serif', fontSize: 15 }}>
            {voice.failureBanner(data.player.day - 1)}
          </p>
        </div>
      ) : (
        <div style={{ marginTop: 22, padding: '14px 16px', borderTop: `1px solid ${theme.rule}`, borderBottom: `1px solid ${theme.rule}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Meta>Day {data.player.day - 1} · Closed Clean</Meta>
            <Mono size={10} dim>+{ystr.complete * 40} XP</Mono>
          </div>
        </div>
      )}

      {/* Arc card */}
      <ArcMini arc={arc} style={{ marginTop: 22 }} />

      {/* System alerts */}
      <div style={{ marginTop: 22 }}>
        <Meta style={{ marginBottom: 8 }}>System Alerts</Meta>
        <AlertRow text={voice.decayWarn('SIGNAL', data.decay.SIGNAL)} severity="warn" />
        <AlertRow text={voice.decayWarn('ART', data.decay.ART)} severity="danger" />
      </div>

      {/* CTA */}
      <button onClick={() => setOverlay({ kind: 'morning' })} className="ls-press" style={{
        marginTop: 28, width: '100%', padding: '20px 22px',
        background: theme.ink, color: theme.bg, border: 'none',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 12, letterSpacing: '0.20em', textTransform: 'uppercase',
        fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        whiteSpace: 'nowrap',
      }}>
        <span>Begin Check-in</span>
        <Glyph kind="arrow-right" color={theme.bg} size={14} />
      </button>

      <Mono dim size={10} style={{ display: 'block', textAlign: 'center', marginTop: 12, letterSpacing: '0.14em' }}>
        EST. 90 SECONDS · NOT OPTIONAL
      </Mono>

      {/* Footer: yesterday details collapsed */}
      <YesterdaySummary />
    </div>
  </ScreenScroll>;
}

function AlertRow({ text, severity }) {
  const { theme } = useApp();
  const color = severity === 'danger' ? theme.danger : severity === 'warn' ? theme.warn : theme.inkDim;
  return <div style={{
    padding: '8px 10px', borderTop: `1px solid ${theme.rule2}`,
    display: 'flex', alignItems: 'center', gap: 10,
  }}>
    <span style={{ width: 4, height: 4, background: color, marginTop: 2 }} />
    <span style={{ color: theme.ink, fontSize: 13 }}>{text}</span>
  </div>;
}

function YesterdaySummary() {
  const { theme, data } = useApp();
  const [open, setOpen] = useS(false);
  return <div style={{ marginTop: 30 }}>
    <button onClick={() => setOpen(!open)} className="ls-mono" style={{
      background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
      color: theme.inkMute, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <span>{open ? '–' : '+'}</span> YESTERDAY · DETAILS
    </button>
    {open && (
      <div style={{ marginTop: 12, padding: '12px 0', borderTop: `1px solid ${theme.rule2}` }}>
        {data.questLog.filter(q => q.day === data.player.day - 1).map(q => (
          <div key={q.id} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '6px 0', borderBottom: `1px solid ${theme.rule2}`,
          }}>
            <Glyph kind={q.status === 'complete' ? 'check' : 'cross'} color={q.status === 'complete' ? theme.ink : theme.danger} />
            <Pill color={theme.stat[q.stat]} border={theme.stat[q.stat]} style={{ fontSize: 9 }}>{q.stat}</Pill>
            <span style={{ flex: 1, fontSize: 13 }}>{q.title}</span>
            <Mono dim size={10}>+{q.xp} XP</Mono>
          </div>
        ))}
      </div>
    )}
  </div>;
}

// ── Arc mini card ───────────────────────────────────────────────────────────
function ArcMini({ arc, style }) {
  const { theme, setRoute } = useApp();
  return <div onClick={() => setRoute({ tab: 'quests', sub: 'arc', params: {} })}
    className="ls-press" style={{
      padding: '14px 16px', borderTop: `1px solid ${theme.accent}`,
      borderBottom: `1px solid ${theme.rule}`, cursor: 'pointer',
      ...style,
    }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <Meta style={{ color: theme.accent }}>ARC · {arc.stat}</Meta>
      <Mono size={10} dim>DAY {arc.dayElapsed}/{arc.dayTotal}</Mono>
    </div>
    <div style={{ marginTop: 6, fontFamily: 'Newsreader, serif', fontSize: 17, color: theme.ink }}>{arc.title}</div>
    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ flex: 1, height: 4, background: theme.rule2, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, width: `${arc.percent}%`, background: theme.accent }} />
        {/* pace marker */}
        <div style={{ position: 'absolute', top: -3, left: `${(arc.dayElapsed/arc.dayTotal)*100}%`, width: 1, height: 10, background: theme.inkDim }} />
      </div>
      <Mono size={11} bold>{arc.percent}%</Mono>
    </div>
    <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
      <Mono size={10} dim>PACE · BEHIND BY {Math.round(arc.dayElapsed/arc.dayTotal*100 - arc.percent)}%</Mono>
      <Mono size={10} style={{ color: theme.warn }}>NEED {arc.paceRequired}% / DAY</Mono>
    </div>
  </div>;
}

// ── Active Directive ────────────────────────────────────────────────────────

function ActiveDirective({ device, showStamp }) {
  const { theme, voice, data, dayState, setOverlay } = useApp();
  const mandatory = data.quests.filter(q => !q.isBonus);
  const bonus = data.quests.find(q => q.isBonus);
  const completedCount = mandatory.filter(q => q.state === 'complete').length;
  const failedCount = mandatory.filter(q => q.state === 'failed').length;
  const allDone = completedCount === mandatory.length;

  return <ScreenScroll>
    <div style={{ padding: device === 'phone' ? '20px 18px 28px' : '34px 40px 44px', position: 'relative' }}>

      {/* Directive header */}
      <Meta>DIRECTIVE · DAY {String(data.player.day).padStart(2,'0')} · ISSUED 07:14 IST</Meta>
      <h1 style={{
        fontFamily: 'Newsreader, serif', fontSize: device === 'phone' ? 26 : 36,
        fontWeight: 400, marginTop: 10, color: theme.ink, letterSpacing: '-0.015em', lineHeight: 1.1,
      }}>
        The System has read your state.
      </h1>

      {/* The directive note */}
      <div style={{
        marginTop: 14, padding: '14px 16px', borderLeft: `2px solid ${theme.accent}`,
        background: theme.surface,
      }}>
        <Meta style={{ color: theme.accent, marginBottom: 6 }}>THE SYSTEM SAYS</Meta>
        <div style={{ fontFamily: 'Newsreader, serif', fontSize: 15, fontStyle: 'italic', fontWeight: 300, color: theme.ink, lineHeight: 1.45 }}>
          {voice.directiveNote()}
        </div>
      </div>

      {/* Weekly status bar */}
      <WeekStatus />

      {/* Mandatory quests */}
      <div style={{ marginTop: 22, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <Meta>Mandatory · {completedCount + failedCount}/{mandatory.length} settled</Meta>
        <Mono size={10} dim>DEADLINE 22:00 IST</Mono>
      </div>
      <div style={{ marginTop: 8 }}>
        {mandatory.map(q => <QuestCard key={q.id} quest={q} />)}
      </div>

      {/* Bonus */}
      {bonus && (
        <>
          <div style={{ marginTop: 26 }}>
            <Meta>Bonus · Optional</Meta>
          </div>
          <div style={{ marginTop: 8 }}>
            <QuestCard quest={bonus} bonus />
          </div>
        </>
      )}

      {/* End-of-day CTA */}
      {(dayState === 'evening' || dayState === 'all-complete') && (
        <button onClick={() => setOverlay({ kind: 'evening' })} className="ls-press" style={{
          marginTop: 28, width: '100%', padding: '16px 22px',
          background: 'transparent', color: theme.ink, border: `1px solid ${theme.ink}`,
          fontFamily: 'JetBrains Mono, monospace', fontSize: 12, letterSpacing: '0.24em',
          textTransform: 'uppercase', fontWeight: 500,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span>Begin Evening Close</span>
          <Glyph kind="arrow-right" color={theme.ink} size={14} />
        </button>
      )}

      {/* Day-complete stamp overlay */}
      {(showStamp || allDone) && <DayCompleteStamp />}
    </div>
  </ScreenScroll>;
}

function WeekStatus() {
  const { theme, data } = useApp();
  const w = data.week;
  return <div style={{
    marginTop: 18, display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    border: `1px solid ${theme.rule}`,
  }}>
    {[
      { l: 'WK', v: String(w.number).padStart(2,'0') },
      { l: 'COMP', v: `${w.complete}/${w.assigned}` },
      { l: 'RATE', v: `${w.rate}%` },
      { l: 'TIER', v: w.rate >= 90 ? '\u20B90' : w.rate >= 75 ? '\u20B92.5K' : '\u20B95K' },
    ].map((c, i, a) => (
      <div key={i} style={{
        padding: '10px 12px',
        borderRight: i < a.length - 1 ? `1px solid ${theme.rule}` : 'none',
      }}>
        <Meta>{c.l}</Meta>
        <div className="ls-num" style={{ fontSize: 18, color: theme.ink, fontWeight: 500, marginTop: 4 }}>{c.v}</div>
      </div>
    ))}
  </div>;
}

// ── Quest Card ──────────────────────────────────────────────────────────────

function QuestCard({ quest, bonus }) {
  const { theme, voice, data, completeQuest, failQuest, setOverlay, setRoute } = useApp();
  const [expanded, setExpanded] = useS(false);
  const isDone = quest.state === 'complete';
  const isFailed = quest.state === 'failed';
  const statColor = theme.stat[quest.stat];
  const cardOpacity = (isDone || isFailed) ? 0.6 : 1;

  return <div style={{
    position: 'relative',
    borderTop: `1px solid ${isFailed ? theme.danger : isDone ? theme.good : statColor}`,
    paddingTop: 12, paddingBottom: 14,
    opacity: bonus ? 0.78 : 1,
  }}>
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, opacity: cardOpacity }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
        <Pill color={statColor} border={statColor}>{quest.stat}</Pill>
        <Pill color={theme.inkDim}>{quest.difficulty}</Pill>
        {quest.isArc && <Pill color={theme.accent} border={theme.accent}>ARC</Pill>}
        {bonus && <Pill color={theme.inkMute}>BONUS</Pill>}
      </div>
      <Mono size={10} dim style={{ flexShrink: 0 }}>+{quest.xp} XP · +{quest.points} {quest.stat}</Mono>
    </div>

    <h3 style={{
      marginTop: 10, fontFamily: 'Newsreader, serif', fontSize: 17, fontWeight: 500,
      color: theme.ink, opacity: cardOpacity, letterSpacing: '-0.005em', lineHeight: 1.25,
    }}>{quest.title}</h3>

    {expanded && !isDone && !isFailed && (
      <p style={{ marginTop: 8, color: theme.inkDim, fontSize: 14, lineHeight: 1.5 }}>
        {quest.brief}
      </p>
    )}

    {expanded && !isDone && !isFailed && (
      <div style={{ marginTop: 14, padding: '10px 12px', background: theme.surface, borderLeft: `2px solid ${theme.rule}` }}>
        <Meta style={{ marginBottom: 4 }}>PROOF STANDARD · {quest.proofType}</Meta>
        <div style={{ fontSize: 13, color: theme.ink }}>{quest.proofStandard}</div>
      </div>
    )}

    <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10, opacity: cardOpacity }}>
      {!isDone && !isFailed && (
        <>
          <button onClick={() => setExpanded(!expanded)} className="ls-press ls-mono" style={{
            background: 'transparent', border: `1px solid ${theme.rule}`,
            color: theme.inkDim, padding: '6px 10px', fontSize: 10, letterSpacing: '0.14em',
            textTransform: 'uppercase', borderRadius: 0, cursor: 'pointer',
          }}>{expanded ? 'Collapse' : 'Brief'}</button>

          <button onClick={() => setOverlay({ kind: 'proof', questId: quest.id })} className="ls-press ls-mono" style={{
            background: theme.ink, border: `1px solid ${theme.ink}`,
            color: theme.bg, padding: '6px 14px', fontSize: 10, letterSpacing: '0.14em',
            textTransform: 'uppercase', borderRadius: 0, fontWeight: 600, cursor: 'pointer',
          }}>{voice.completeCTA}</button>

          <button onClick={() => setOverlay({ kind: 'fail-confirm', questId: quest.id })} className="ls-press ls-mono" style={{
            background: 'transparent', border: `1px solid ${theme.danger}`,
            color: theme.danger, padding: '6px 10px', fontSize: 10, letterSpacing: '0.14em',
            textTransform: 'uppercase', borderRadius: 0, cursor: 'pointer', marginLeft: 'auto',
          }}>{voice.failCTA}</button>
        </>
      )}
      {isDone && (
        <Mono size={10} dim style={{ marginLeft: 'auto' }}>
          <Glyph kind="check" color={theme.good} size={10} /> &nbsp; PROOF FILED · 14:22 IST
        </Mono>
      )}
      {isFailed && (
        <Mono size={10} style={{ marginLeft: 'auto', color: theme.danger }}>
          DEFAULT RECORDED
        </Mono>
      )}
    </div>

    {/* Stamps */}
    {isDone && (
      <div style={{ position: 'absolute', top: 30, right: 16, pointerEvents: 'none' }}>
        <Stamp text="FILED" color={theme.good} sub="22:14 IST" />
      </div>
    )}
    {isFailed && (
      <div style={{ position: 'absolute', top: 30, right: 16, pointerEvents: 'none' }}>
        <Stamp text="ABANDONED" color={theme.danger} sub={`DAY ${data.player.day} · DEFAULT`} animate />
      </div>
    )}
  </div>;
}

// ── Day Complete Stamp (large) ──────────────────────────────────────────────
function DayCompleteStamp() {
  const { theme, voice, data } = useApp();
  return <div style={{
    marginTop: 30, padding: '32px 20px', border: `1px solid ${theme.rule}`,
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
  }}>
    <Stamp text={voice.allComplete} sub={`DAY ${data.player.day} · 22:47 IST`} size="lg" color={theme.good} animate />
    <Mono dim size={10} style={{ marginTop: 4 }}>
      +{data.quests.filter(q => q.state === 'complete' && !q.isBonus).reduce((s,q) => s + q.xp, 0)} XP · STREAK +1
    </Mono>
  </div>;
}

Object.assign(window, { DirectiveTab, PreCheckin, ActiveDirective, ArcMini });
