// screen-onboarding.jsx — First-run flow (8 steps).
// Accessed via Tweaks "day state: onboarding".

function OnboardingFlow({ device, onComplete }) {
  const { theme, voice } = useApp();
  const [step, setStep] = useS(0);
  const next = () => setStep(s => Math.min(s + 1, 7));
  const back = () => setStep(s => Math.max(s - 1, 0));

  const Steps = [WelcomeStep, IdentityStep, AssessmentStep, EnforcementStep, NotionStep, CalendarStep, NotificationsStep, LaunchStep];
  const StepCmp = Steps[step];

  return <div className="ls-app" style={{
    width: '100%', height: '100%', background: theme.bg, color: theme.ink,
    position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden',
  }}>
    {/* Top bar */}
    <div style={{
      padding: device === 'phone' ? '14px 18px' : '18px 28px',
      borderBottom: `1px solid ${theme.rule}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <Meta>FIRST LAUNCH · {String(step + 1).padStart(2,'0')}/08</Meta>
      <Mono dim size={10}>CANNOT GO BACK ONCE LAUNCHED</Mono>
    </div>

    {/* Progress */}
    <div style={{ display: 'flex', gap: 3, padding: '8px 18px 0' }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} style={{ flex: 1, height: 2, background: i <= step ? theme.ink : theme.rule }} />
      ))}
    </div>

    <div style={{ flex: 1, overflowY: 'auto' }} className="ls-scroll">
      <StepCmp device={device} next={next} back={back} step={step} onComplete={onComplete} />
    </div>
  </div>;
}

// ── Step 1 · Welcome ───────────────────────────────────────────────────────
function WelcomeStep({ device, next }) {
  const { theme, voice } = useApp();
  return <div style={{
    padding: device === 'phone' ? '60px 22px 40px' : '110px 56px 60px',
    maxWidth: 720, margin: '0 auto', minHeight: '100%',
    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
  }}>
    <div>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
        <SystemMark size={60} />
      </div>

      <Meta style={{ textAlign: 'center', color: theme.accent }}>{voice.appName}</Meta>
      <h1 style={{
        fontFamily: 'Newsreader, serif', fontSize: device === 'phone' ? 30 : 48, fontWeight: 400,
        textAlign: 'center', marginTop: 16, color: theme.ink, letterSpacing: '-0.02em', lineHeight: 1.05,
      }}>
        You are about to install
        <br />
        <span style={{ fontStyle: 'italic', fontWeight: 300 }}>a system you cannot leave.</span>
      </h1>

      <div style={{ marginTop: 28, padding: '20px 22px', borderTop: `1px solid ${theme.rule}`, borderBottom: `1px solid ${theme.rule}` }}>
        {[
          'Prescriptive. It will tell you what to do.',
          'Consequential. Failure costs money.',
          'Structurally resistant to the rationalisations that ended every prior attempt.',
        ].map((line, i) => (
          <div key={i} style={{
            padding: '10px 0', borderTop: i > 0 ? `1px dashed ${theme.rule2}` : 'none',
            display: 'flex', alignItems: 'baseline', gap: 14,
          }}>
            <Mono size={11} style={{ color: theme.accent, fontWeight: 600 }}>{String(i + 1).padStart(2,'0')}</Mono>
            <span style={{ fontFamily: 'Newsreader, serif', fontSize: 16, color: theme.ink, fontStyle: 'italic', fontWeight: 300 }}>
              {line}
            </span>
          </div>
        ))}
      </div>

      <p style={{ marginTop: 24, textAlign: 'center', color: theme.inkDim, fontSize: 14, fontStyle: 'italic' }}>
        {voice.onboardingHook}
      </p>
    </div>

    <button onClick={next} className="ls-press" style={{
      marginTop: 32, width: '100%', padding: '20px 22px',
      background: theme.ink, color: theme.bg, border: 'none',
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 13, letterSpacing: '0.28em', textTransform: 'uppercase',
      fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      borderRadius: 0,
    }}>
      <span>Begin Setup</span>
      <Glyph kind="arrow-right" color={theme.bg} size={14} />
    </button>
    <Mono size={9} dim style={{ display: 'block', textAlign: 'center', marginTop: 10 }}>NO SKIP. NO TRIAL. NO GUEST MODE.</Mono>
  </div>;
}

function SystemMark({ size = 40 }) {
  const { theme } = useApp();
  // A simple, original glyph: a square with an inscribed diamond, marked I-IV.
  // Reads as "four quadrants of a single system".
  const s = size;
  return <svg width={s} height={s} viewBox="0 0 60 60">
    <rect x={3} y={3} width={54} height={54} stroke={theme.accent} strokeWidth={1.5} fill="none" />
    <polygon points="30,8 52,30 30,52 8,30" stroke={theme.ink} strokeWidth={1.2} fill="none" />
    <text x={30} y={11} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize={6} fill={theme.inkDim}>I</text>
    <text x={56} y={32} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize={6} fill={theme.inkDim}>II</text>
    <text x={30} y={58} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize={6} fill={theme.inkDim}>III</text>
    <text x={4}  y={32} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize={6} fill={theme.inkDim}>IV</text>
    <circle cx={30} cy={30} r={2} fill={theme.accent} />
  </svg>;
}

// ── Step 2 · Identity ──────────────────────────────────────────────────────
function IdentityStep({ device, next, back }) {
  const { theme } = useApp();
  const [name, setName] = useS('One');
  return <StepBody device={device} title="Player Identity" sub="The name you will be addressed by. Your start date is today; this is the only Day 1 you will ever have.">
    <div style={{ marginTop: 22 }}>
      <Meta>PLAYER NAME</Meta>
      <input value={name} onChange={(e) => setName(e.target.value)}
        style={{
          marginTop: 8, width: '100%', padding: '14px 16px',
          background: theme.surface, border: `1px solid ${theme.rule}`,
          color: theme.ink, fontFamily: 'Newsreader, serif', fontSize: 22,
          borderRadius: 0, outline: 'none',
        }} />
    </div>
    <div style={{ marginTop: 18, padding: '14px 16px', border: `1px solid ${theme.rule}` }}>
      <Meta>SYSTEM DAY 1</Meta>
      <div className="ls-num" style={{ marginTop: 6, fontSize: 22, color: theme.ink }}>14 Jun 2026 · 07:14 IST</div>
      <Mono dim size={11} style={{ display: 'block', marginTop: 4 }}>TZ AUTO-DETECTED · ASIA/KOLKATA · REQUIRED FOR 22:00 ENFORCEMENT</Mono>
    </div>
    <StepNav device={device} next={next} back={back} />
  </StepBody>;
}

// ── Step 3 · Stat Self-Assessment ──────────────────────────────────────────
function AssessmentStep({ device, next, back }) {
  const { theme } = useApp();
  const [vals, setVals] = useS({ CRAFT: 30, BUILDER: 20, CAPITAL: 10, BODY: 25, MIND: 20, SIGNAL: 10, ART: 5 });
  return <StepBody device={device} title="Stat Self-Assessment" sub="Calibrate where you actually are, not where you wish to be.">
    <div style={{ marginTop: 14, padding: '12px 14px', border: `1px solid ${theme.warn}` }}>
      <Meta style={{ color: theme.warn }}>HONESTY WARNING</Meta>
      <p style={{ marginTop: 6, fontSize: 13, color: theme.ink, fontStyle: 'italic' }}>
        Sandbagging here means easy quests forever. The System will let you. Then it will run out of room to push.
      </p>
    </div>

    <div style={{
      marginTop: 18,
      display: 'grid', gridTemplateColumns: device === 'phone' ? '1fr' : '1fr 220px',
      gap: device === 'phone' ? 18 : 36,
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {STATS.map(s => (
          <div key={s}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <Mono size={11} bold style={{ color: theme.stat[s], letterSpacing: '0.16em' }}>{s}</Mono>
              <Mono size={11} style={{ color: theme.ink }}>{String(vals[s]).padStart(2,'0')}/100</Mono>
            </div>
            <input type="range" min="0" max="100" value={vals[s]}
              onChange={(e) => setVals(v => ({ ...v, [s]: parseInt(e.target.value) }))}
              style={{ width: '100%', accentColor: theme.stat[s], marginTop: 4 }} />
          </div>
        ))}
      </div>
      {device !== 'phone' && (
        <div>
          <Meta style={{ marginBottom: 8 }}>STARTING PROFILE</Meta>
          <Spider labels={STATS} values={STATS.map(s => vals[s])} size={220} color={theme.accent} />
        </div>
      )}
    </div>
    <StepNav device={device} next={next} back={back} />
  </StepBody>;
}

// ── Step 4 · Enforcement ──────────────────────────────────────────────────
function EnforcementStep({ device, next, back }) {
  const { theme } = useApp();
  const [amount, setAmount] = useS(5000);
  const [agreed, setAgreed] = useS(false);
  return <StepBody device={device} title="Enforcement" sub="Choose a number that hurts on a Sunday night. Set the recipient. Name the witness.">

    <div style={{ marginTop: 14, padding: '14px 16px', border: `1px solid ${theme.accent}` }}>
      <Meta>WEEKLY PENALTY</Meta>
      <div className="ls-num" style={{ fontSize: 36, marginTop: 8, color: theme.ink }}>
        ₹{amount.toLocaleString('en-IN')}
      </div>
      <input type="range" min="500" max="20000" step="500" value={amount}
        onChange={(e) => setAmount(parseInt(e.target.value))}
        style={{ width: '100%', accentColor: theme.accent, marginTop: 12 }} />
      <Mono dim size={11} style={{ display: 'block', marginTop: 4 }}>
        DEFAULT ₹5,000 · RANGE ₹500–₹20,000 · TIERED: ≥90% = ₹0 · 75–89% = HALF · &lt;75% = FULL
      </Mono>
    </div>

    <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: device === 'phone' ? '1fr' : '1fr 1fr', gap: 10 }}>
      <FieldBox label="RECIPIENT" value="Dad · ***@axisbank" sub="No return. No exception." />
      <FieldBox label="REFEREE" value="Mom · +91 *** *** 4421" sub="Witnesses every transfer." />
    </div>

    <div style={{
      marginTop: 18, padding: '12px 14px',
      border: `1px solid ${agreed ? theme.good : theme.rule}`,
      display: 'flex', gap: 10, cursor: 'pointer',
    }} onClick={() => setAgreed(a => !a)}>
      <div style={{
        width: 18, height: 18, border: `1.5px solid ${agreed ? theme.good : theme.rule}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2,
      }}>
        {agreed && <Glyph kind="check" color={theme.good} size={12} />}
      </div>
      <div>
        <div style={{ fontFamily: 'Newsreader, serif', fontSize: 14, color: theme.ink }}>
          All three parties understand their role. Dad will not return the money. Mom will not skip the call.
        </div>
        <Mono size={10} dim style={{ display: 'block', marginTop: 4 }}>
          REQUIRED · CANNOT LAUNCH WITHOUT THIS
        </Mono>
      </div>
    </div>

    <StepNav device={device} next={next} back={back} canAdvance={agreed} />
  </StepBody>;
}

function FieldBox({ label, value, sub }) {
  const { theme } = useApp();
  return <div style={{ padding: '12px 14px', border: `1px solid ${theme.rule}` }}>
    <Meta>{label}</Meta>
    <div style={{ marginTop: 4, fontFamily: 'Newsreader, serif', fontSize: 16, color: theme.ink }}>{value}</div>
    {sub && <Mono dim size={10} style={{ display: 'block', marginTop: 4 }}>{sub}</Mono>}
  </div>;
}

// ── Step 5 · Notion ────────────────────────────────────────────────────────
function NotionStep({ device, next, back }) {
  const { theme } = useApp();
  const [connected, setConnected] = useS(false);
  const dbs = ['Player Profile', 'Character Sheet', 'Quest Log', 'Quest Library', 'Stat History Log',
    'Daily Check-in Log', 'Weekly Ledger', 'Penalty Log', 'Passive Library', 'Arc Quest Tracker', 'Skill Registry', 'Financial Log'];
  return <StepBody device={device} title="Notion Integration" sub="The data layer. Twelve databases. All must connect or nothing runs.">
    <Btn variant="primary" full onClick={() => setConnected(true)} style={{ marginTop: 18, padding: '14px 22px' }} disabled={connected}>
      {connected ? '✓ Connected · workspace_one' : 'Connect Notion Workspace'}
    </Btn>
    <div style={{ marginTop: 18 }}>
      <Meta style={{ marginBottom: 8 }}>DATABASE DISCOVERY</Meta>
      <div style={{
        display: 'grid', gridTemplateColumns: device === 'phone' ? '1fr 1fr' : 'repeat(3, 1fr)',
        gap: 0, borderTop: `1px solid ${theme.rule}`,
      }}>
        {dbs.map((db, i) => (
          <div key={db} style={{
            padding: '10px 12px', borderBottom: `1px solid ${theme.rule2}`,
            borderRight: (i % (device === 'phone' ? 2 : 3)) < (device === 'phone' ? 1 : 2) ? `1px solid ${theme.rule2}` : 'none',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <Glyph kind={connected ? 'check' : 'circle'} color={connected ? theme.good : theme.inkMute} size={10} />
            <span style={{ fontSize: 12, color: theme.ink, fontFamily: 'Newsreader, serif' }}>{db}</span>
          </div>
        ))}
      </div>
    </div>
    <StepNav device={device} next={next} back={back} canAdvance={connected} />
  </StepBody>;
}

// ── Step 6 · Calendar ──────────────────────────────────────────────────────
function CalendarStep({ device, next, back }) {
  const { theme } = useApp();
  const [connected, setConnected] = useS(false);
  return <StepBody device={device} title="Calendar Integration" sub="Optional but recommended. Quest blocks land on your calendar with their deadlines.">
    <Btn variant="primary" full onClick={() => setConnected(true)} style={{ marginTop: 18, padding: '14px 22px' }} disabled={connected}>
      {connected ? '✓ Connected · Google Calendar' : 'Connect Google Calendar'}
    </Btn>
    {connected && (
      <div style={{ marginTop: 18 }}>
        <Meta>DEFAULT QUEST BLOCK DURATION</Meta>
        <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {[['EASY','30 min'], ['MEDIUM','60 min'], ['HARD','90 min']].map(([d, t]) => (
            <div key={d} style={{ padding: '12px', border: `1px solid ${theme.rule}` }}>
              <Meta>{d}</Meta>
              <Mono size={16} bold style={{ display: 'block', marginTop: 4, color: theme.ink }}>{t}</Mono>
            </div>
          ))}
        </div>
      </div>
    )}
    <StepNav device={device} next={next} back={back} />
  </StepBody>;
}

// ── Step 7 · Notifications ─────────────────────────────────────────────────
function NotificationsStep({ device, next, back }) {
  const { theme } = useApp();
  const [granted, setGranted] = useS(false);
  return <StepBody device={device} title="Notification Permissions" sub="Context before consent. Here is everything that will ping.">
    <div style={{ marginTop: 14, borderTop: `1px solid ${theme.rule}` }}>
      {[
        ['07:00 IST', 'Morning Check-in Prompt', 'Daily.'],
        ['21:00 IST', 'Evening Close Reminder', 'Daily.'],
        ['21:30 IST', 'Pending Quest Alert',     'Only if quests remain open.'],
        ['Sun 19:30', 'Sunday Ritual Open',       'Weekly. Cannot be silenced.'],
        ['On Trigger','Hidden Quest Issued',      'When a pattern fires.'],
        ['On Threshold','Skill Unlock Ready',     'When a stat crosses 30/50/70/90.'],
      ].map(([t,n,d],i) => (
        <div key={i} style={{
          padding: '10px 0', borderBottom: `1px solid ${theme.rule2}`,
          display: 'grid', gridTemplateColumns: '90px 1fr', gap: 10, alignItems: 'baseline',
        }}>
          <Mono size={11} bold style={{ color: theme.accent }}>{t}</Mono>
          <div>
            <div style={{ fontFamily: 'Newsreader, serif', fontSize: 14, color: theme.ink }}>{n}</div>
            <Mono dim size={10} style={{ display: 'block', marginTop: 2 }}>{d}</Mono>
          </div>
        </div>
      ))}
    </div>
    <Btn variant="primary" full onClick={() => setGranted(true)} style={{ marginTop: 18, padding: '14px 22px' }} disabled={granted}>
      {granted ? '✓ Permission granted' : 'Grant Notifications'}
    </Btn>
    <StepNav device={device} next={next} back={back} />
  </StepBody>;
}

// ── Step 8 · Launch ────────────────────────────────────────────────────────
function LaunchStep({ device, onComplete, back }) {
  const { theme, voice, data, setDayState } = useApp();
  return <StepBody device={device} title="Day 1" sub="Confirm. Once you press the button below, the contract is live and the clock is running.">

    <div style={{
      marginTop: 18, padding: '20px',
      border: `1px solid ${theme.accent}`,
      display: 'grid', gridTemplateColumns: device === 'phone' ? '1fr' : 'repeat(2, 1fr)', gap: 0,
    }}>
      {[
        ['START DATE', '14 Jun 2026'],
        ['PLAYER NAME', 'One'],
        ['WEEKLY STAKE', '₹5,000'],
        ['RECIPIENT', 'Dad'],
        ['REFEREE', 'Mom'],
        ['ENDGAME', 'Sovereign Polymath'],
      ].map(([l, v], i, arr) => (
        <div key={l} style={{
          padding: '10px 14px',
          borderRight: !(device === 'phone') && i % 2 === 0 ? `1px solid ${theme.rule2}` : 'none',
          borderBottom: device === 'phone' ? `1px dashed ${theme.rule2}` : (i < arr.length - 2 ? `1px dashed ${theme.rule2}` : 'none'),
        }}>
          <Meta>{l}</Meta>
          <div style={{ marginTop: 4, fontFamily: 'Newsreader, serif', fontSize: 16, color: theme.ink }}>{v}</div>
        </div>
      ))}
    </div>

    <p style={{ marginTop: 24, fontFamily: 'Newsreader, serif', fontSize: 16, fontStyle: 'italic', color: theme.inkDim, fontWeight: 300, textAlign: 'center' }}>
      Press the button. Today becomes Day 1. There is no second Day 1.
    </p>

    <button onClick={() => { setDayState('pre-checkin'); onComplete && onComplete(); }} className="ls-press" style={{
      marginTop: 18, width: '100%', padding: '24px 22px',
      background: theme.accent, color: theme.bg, border: 'none',
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 14, letterSpacing: '0.32em', textTransform: 'uppercase',
      fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      borderRadius: 0,
    }}>
      <span>Activate The System</span>
      <Glyph kind="arrow-right" color={theme.bg} size={16} />
    </button>
  </StepBody>;
}

// ── Step helpers ───────────────────────────────────────────────────────────
function StepBody({ device, title, sub, children }) {
  const { theme } = useApp();
  return <div style={{
    padding: device === 'phone' ? '26px 22px 40px' : '46px 56px 60px',
    maxWidth: 760, margin: '0 auto',
  }}>
    <h1 style={{ fontFamily: 'Newsreader, serif', fontSize: device === 'phone' ? 28 : 36, fontWeight: 400, color: theme.ink, letterSpacing: '-0.015em' }}>
      {title}
    </h1>
    {sub && <p style={{ marginTop: 10, color: theme.inkDim, fontSize: 15, fontStyle: 'italic', fontWeight: 300, maxWidth: 540 }}>{sub}</p>}
    {children}
  </div>;
}

function StepNav({ device, next, back, canAdvance = true }) {
  const { theme } = useApp();
  return <div style={{ display: 'flex', gap: 10, marginTop: 32 }}>
    <Btn variant="ghost" onClick={back} style={{ padding: '14px 22px' }}>← Back</Btn>
    <Btn variant="primary" full onClick={next} disabled={!canAdvance} style={{ padding: '14px 22px' }}>Continue →</Btn>
  </div>;
}

Object.assign(window, { OnboardingFlow });
