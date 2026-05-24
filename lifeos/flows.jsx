// flows.jsx — Overlay flows: Morning, Evening, Proof, Fail-confirm, Sunday Ritual.

function FlowOverlay({ device }) {
  const { overlay, setOverlay } = useApp();
  if (!overlay) return null;
  const close = () => setOverlay(null);
  return <OverlayShell onClose={close} device={device}>
    {overlay.kind === 'morning'      && <MorningFlow onDone={close} />}
    {overlay.kind === 'evening'      && <EveningFlow onDone={close} />}
    {overlay.kind === 'proof'        && <ProofFlow questId={overlay.questId} onDone={close} />}
    {overlay.kind === 'fail-confirm' && <FailConfirm questId={overlay.questId} onDone={close} />}
    {overlay.kind === 'sunday'       && <SundayRitual onDone={close} device={device} />}
  </OverlayShell>;
}

function OverlayShell({ children, onClose, device }) {
  const { theme } = useApp();
  return <div style={{
    position: 'absolute', inset: 0, zIndex: 100,
    background: theme.bg,
    display: 'flex', flexDirection: 'column',
  }}>
    {/* Overlay header */}
    <div style={{
      padding: device === 'phone' ? '16px 18px' : '20px 28px',
      borderBottom: `1px solid ${theme.rule}`,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }}>
      <Meta>THE SYSTEM</Meta>
      <button onClick={onClose} className="ls-press ls-mono" style={{
        background: 'transparent', border: 'none', color: theme.inkDim,
        fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase',
        cursor: 'pointer',
      }}>Close ×</button>
    </div>
    <div style={{ flex: 1, overflowY: 'auto' }} className="ls-scroll">{children}</div>
  </div>;
}

// ── Morning Check-in ────────────────────────────────────────────────────────
function MorningFlow({ onDone }) {
  const { theme, voice, data, setData, setDayState } = useApp();
  const [step, setStep] = useS(1);
  const [energy, setEnergy] = useS(3);
  const [constraints, setConstraints] = useS('');
  const [mind, setMind] = useS('');
  const [exception, setException] = useS(false);
  const [generating, setGenerating] = useS(false);
  const next = () => setStep(s => s + 1);

  const submit = () => {
    setData(d => ({ ...d, energy }));
    setGenerating(true);
    setTimeout(() => {
      setDayState('mid-day');
      onDone();
    }, 1900);
  };

  if (generating) return <Generating energy={energy} />;

  return <div style={{ padding: '32px 22px 60px', maxWidth: 600, margin: '0 auto' }}>
    <Meta>MORNING CHECK-IN · {step}/3</Meta>
    <ProgressDots step={step} total={3} />

    {step === 1 && (
      <>
        <h2 style={{ fontFamily: 'Newsreader, serif', fontSize: 28, fontWeight: 400, marginTop: 18, color: theme.ink }}>
          What is your energy today?
        </h2>
        <p style={{ marginTop: 8, color: theme.inkDim, fontStyle: 'italic', fontWeight: 300 }}>
          Be honest. The System adjusts quest intensity to your input. Sandbagging now means a softer day; it also means a softer arc.
        </p>
        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { v: 1, t: 'Empty', d: 'Sick, broken sleep, depleted. Easy quests only.' },
            { v: 2, t: 'Low',   d: 'Functional but reluctant. Stakes reduced.' },
            { v: 3, t: 'Even',  d: 'Standard. The default. The System uses this.' },
            { v: 4, t: 'Sharp', d: 'Operating cleanly. Push.' },
            { v: 5, t: 'Lit',   d: 'Rare. Use it. The System will.' },
          ].map(o => (
            <button key={o.v} onClick={() => setEnergy(o.v)} className="ls-press" style={{
              background: 'transparent', border: `1px solid ${energy === o.v ? theme.ink : theme.rule}`,
              padding: '14px 16px', textAlign: 'left', color: theme.ink, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 14, borderRadius: 0,
            }}>
              <span className="ls-mono" style={{ fontSize: 24, color: energy === o.v ? theme.ink : theme.inkMute, fontWeight: 500, width: 28 }}>
                {o.v}
              </span>
              <div>
                <div style={{ fontFamily: 'Newsreader, serif', fontSize: 17, color: theme.ink }}>{o.t}</div>
                <Mono dim size={11}>{o.d}</Mono>
              </div>
            </button>
          ))}
        </div>
        <Btn onClick={next} variant="primary" full style={{ marginTop: 24, padding: '14px 22px' }}>Continue →</Btn>
      </>
    )}

    {step === 2 && (
      <>
        <h2 style={{ fontFamily: 'Newsreader, serif', fontSize: 28, fontWeight: 400, marginTop: 18, color: theme.ink }}>
          Hard constraints today?
        </h2>
        <p style={{ marginTop: 8, color: theme.inkDim, fontStyle: 'italic', fontWeight: 300 }}>
          Meetings, travel, commitments not already on your calendar. Or "None".
        </p>
        <textarea
          value={constraints} onChange={(e) => setConstraints(e.target.value)}
          placeholder="None."
          style={{
            marginTop: 20, width: '100%', minHeight: 110, padding: '12px 14px',
            background: theme.surface, border: `1px solid ${theme.rule}`,
            color: theme.ink, fontFamily: 'Newsreader, serif', fontSize: 15,
            borderRadius: 0, resize: 'vertical', outline: 'none',
          }}
        />

        <div style={{ marginTop: 24, padding: '14px 16px', border: `1px solid ${theme.rule}`, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <input type="checkbox" checked={exception} onChange={(e) => setException(e.target.checked)}
            style={{ marginTop: 4, accentColor: theme.warn }} />
          <div>
            <div style={{ fontFamily: 'Newsreader, serif', fontSize: 15, color: theme.ink }}>Declare exception clause.</div>
            <Mono dim size={11}>Max 1 / week. Quests defer; do not vanish. Penalty still calculates the empty day at 0%.</Mono>
          </div>
        </div>
        <Btn onClick={next} variant="primary" full style={{ marginTop: 24, padding: '14px 22px' }}>Continue →</Btn>
      </>
    )}

    {step === 3 && (
      <>
        <h2 style={{ fontFamily: 'Newsreader, serif', fontSize: 28, fontWeight: 400, marginTop: 18, color: theme.ink }}>
          One thing on your mind.
        </h2>
        <p style={{ marginTop: 8, color: theme.inkDim, fontStyle: 'italic', fontWeight: 300 }}>
          One sentence. Honest. The System uses this to frame today's directive and may issue a Bonus quest from it.
        </p>
        <textarea
          value={mind} onChange={(e) => setMind(e.target.value)}
          placeholder="..."
          style={{
            marginTop: 20, width: '100%', minHeight: 80, padding: '12px 14px',
            background: theme.surface, border: `1px solid ${theme.rule}`,
            color: theme.ink, fontFamily: 'Newsreader, serif', fontSize: 17, fontStyle: 'italic',
            borderRadius: 0, resize: 'vertical', outline: 'none',
          }}
        />
        <Btn onClick={submit} variant="primary" full style={{ marginTop: 24, padding: '14px 22px' }}>Generate Directive ▸</Btn>
      </>
    )}
  </div>;
}

function ProgressDots({ step, total }) {
  const { theme } = useApp();
  return <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} style={{
        flex: 1, height: 2,
        background: i < step ? theme.ink : theme.rule,
      }} />
    ))}
  </div>;
}

// Generating screen — teletype "loading"
function Generating({ energy }) {
  const { theme, voice } = useApp();
  const messages = useM(() => [
    'Reading character sheet…',
    'Reading stat history…',
    'Reading arc state…',
    'Reading passive library…',
    'Calculating decay…',
    `Energy ${energy} accepted.`,
    'Selecting quests from library…',
    'Composing directive…',
  ], [energy]);
  const [idx, setIdx] = useS(0);
  useE(() => {
    if (idx < messages.length - 1) {
      const t = setTimeout(() => setIdx(i => i + 1), 220);
      return () => clearTimeout(t);
    }
  }, [idx]);
  return <div style={{
    height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
    padding: 24, gap: 16,
  }}>
    <Meta style={{ color: theme.accent }}>{voice.afterCheckin(energy)}</Meta>
    <h2 style={{ fontFamily: 'Newsreader, serif', fontSize: 26, fontWeight: 400, color: theme.ink, textAlign: 'center', maxWidth: 440 }}>
      The System is reading your state.
    </h2>
    <div className="ls-mono" style={{ marginTop: 14, color: theme.inkDim, fontSize: 12, textAlign: 'left' }}>
      {messages.slice(0, idx + 1).map((m, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
          <span style={{ color: theme.inkMute }}>›</span>
          <span style={{ color: i === idx ? theme.ink : theme.inkMute }}>{m}{i === idx && <span className="ls-cursor" style={{ color: theme.ink }}>_</span>}</span>
        </div>
      ))}
    </div>
  </div>;
}

// ── Evening Check-in ────────────────────────────────────────────────────────
function EveningFlow({ onDone }) {
  const { theme, voice, data, setDayState } = useApp();
  const [endEnergy, setEndEnergy] = useS(2);
  const [note, setNote] = useS('');
  const mandatory = data.quests.filter(q => !q.isBonus);
  const done = mandatory.filter(q => q.state === 'complete').length;
  const failed = mandatory.filter(q => q.state === 'failed').length;
  const xp = data.quests.filter(q => q.state === 'complete').reduce((s, q) => s + q.xp, 0);

  return <div style={{ padding: '28px 22px 60px', maxWidth: 600, margin: '0 auto' }}>
    <Meta>EVENING CLOSE</Meta>
    <h2 style={{ fontFamily: 'Newsreader, serif', fontSize: 28, fontWeight: 400, marginTop: 12, color: theme.ink }}>
      The day is being sealed.
    </h2>

    <div style={{
      marginTop: 22, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
      border: `1px solid ${theme.rule}`,
    }}>
      {[
        { l: 'COMP', v: done },
        { l: 'FAIL', v: failed },
        { l: 'XP',  v: xp },
      ].map((c,i,a) => (
        <div key={i} style={{ padding: '14px 12px', borderRight: i < a.length - 1 ? `1px solid ${theme.rule}` : 'none' }}>
          <Meta>{c.l}</Meta>
          <div className="ls-num" style={{ fontSize: 24, marginTop: 4, color: theme.ink, fontWeight: 500 }}>{c.v}</div>
        </div>
      ))}
    </div>

    <div style={{ marginTop: 26 }}>
      <Meta>Energy at close</Meta>
      <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
        {[1,2,3,4,5].map(v => (
          <button key={v} onClick={() => setEndEnergy(v)} className="ls-press" style={{
            flex: 1, padding: '14px 0', background: 'transparent',
            border: `1px solid ${endEnergy === v ? theme.ink : theme.rule}`,
            color: endEnergy === v ? theme.ink : theme.inkDim,
            fontFamily: 'JetBrains Mono, monospace', fontSize: 16, cursor: 'pointer', borderRadius: 0,
          }}>{v}</button>
        ))}
      </div>
    </div>

    <div style={{ marginTop: 24 }}>
      <Meta>One sentence on the day</Meta>
      <textarea value={note} onChange={(e) => setNote(e.target.value)}
        placeholder="Honest. No format. Goes into the log."
        style={{
          marginTop: 8, width: '100%', minHeight: 100, padding: '12px 14px',
          background: theme.surface, border: `1px solid ${theme.rule}`,
          color: theme.ink, fontFamily: 'Newsreader, serif', fontSize: 15, fontStyle: 'italic',
          borderRadius: 0, resize: 'vertical', outline: 'none',
        }} />
    </div>

    <Btn onClick={() => { setDayState('all-complete'); onDone(); }} variant="primary" full style={{ marginTop: 24, padding: '14px 22px' }}>
      Close the day →
    </Btn>
  </div>;
}

// ── Proof Submission ───────────────────────────────────────────────────────
function ProofFlow({ questId, onDone }) {
  const { theme, voice, data, completeQuest } = useApp();
  const q = data.quests.find(x => x.id === questId);
  if (!q) return null;
  const [text, setText] = useS('');
  const [hasFile, setHasFile] = useS(false);
  const [url, setUrl] = useS('');
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const submit = () => { completeQuest(questId); onDone(); };

  return <div style={{ padding: '28px 22px 60px', maxWidth: 600, margin: '0 auto' }}>
    <Meta>PROOF SUBMISSION · QUEST {q.id.toUpperCase()}</Meta>
    <h2 style={{ fontFamily: 'Newsreader, serif', fontSize: 24, fontWeight: 400, marginTop: 10, color: theme.ink }}>{q.title}</h2>

    <div style={{ marginTop: 18, padding: '10px 14px', background: theme.surface, borderLeft: `2px solid ${theme.accent}` }}>
      <Meta style={{ color: theme.accent }}>PROOF REQUIRED · {q.proofType}</Meta>
      <div style={{ marginTop: 4, fontSize: 14, color: theme.ink }}>{q.proofStandard}</div>
    </div>

    <Mono dim size={10} style={{ display: 'block', marginTop: 22, letterSpacing: '0.14em' }}>
      DEADLINE 22:00 IST · 4h 17m REMAINING
    </Mono>

    {q.proofType === 'Text paste' && (
      <>
        <textarea value={text} onChange={(e) => setText(e.target.value)}
          placeholder="Paste your writing here. Min 600 words."
          style={{
            marginTop: 10, width: '100%', minHeight: 240, padding: '14px 16px',
            background: theme.surface, border: `1px solid ${theme.rule}`,
            color: theme.ink, fontFamily: 'Newsreader, serif', fontSize: 14,
            borderRadius: 0, resize: 'vertical', outline: 'none', lineHeight: 1.5,
          }} />
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
          <Mono dim size={10}>WORD COUNT</Mono>
          <Mono size={11} style={{ color: wordCount >= 600 ? theme.good : theme.warn, fontWeight: 600 }}>
            {wordCount} / 600 {wordCount >= 600 ? '✓' : ''}
          </Mono>
        </div>
      </>
    )}

    {q.proofType === 'Screenshot' && (
      <DropZone label="DROP SCREENSHOT · OR TAP TO ATTACH" onAttach={() => setHasFile(true)} attached={hasFile} />
    )}

    {q.proofType === 'Health screenshot' && (
      <DropZone label="ATTACH HEALTH APP SCREENSHOT" onAttach={() => setHasFile(true)} attached={hasFile} subtext="Garmin · Apple Health · Strava. Today's date required." />
    )}

    {q.proofType === 'Link' && (
      <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://"
        style={{
          marginTop: 10, width: '100%', padding: '14px 16px',
          background: theme.surface, border: `1px solid ${theme.rule}`,
          color: theme.ink, fontFamily: 'JetBrains Mono, monospace', fontSize: 13,
          borderRadius: 0, outline: 'none',
        }} />
    )}

    <Btn onClick={submit} variant="primary" full style={{ marginTop: 24, padding: '14px 22px' }}
      disabled={q.proofType === 'Text paste' ? wordCount < 600 : (q.proofType === 'Link' ? !url : !hasFile)}>
      File Proof ▸
    </Btn>
  </div>;
}

function DropZone({ label, subtext, onAttach, attached }) {
  const { theme } = useApp();
  return <button onClick={onAttach} className="ls-press" style={{
    marginTop: 10, width: '100%', padding: '40px 20px',
    background: theme.surface, border: `1px dashed ${attached ? theme.good : theme.rule}`,
    color: theme.inkDim, cursor: 'pointer', borderRadius: 0,
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
  }}>
    <Meta style={{ color: attached ? theme.good : theme.inkMute }}>
      {attached ? '✓ proof_2026-06-14.png · attached' : label}
    </Meta>
    {subtext && <Mono dim size={10}>{subtext}</Mono>}
  </button>;
}

// ── Fail Confirm ────────────────────────────────────────────────────────────
function FailConfirm({ questId, onDone }) {
  const { theme, voice, data, failQuest } = useApp();
  const q = data.quests.find(x => x.id === questId);
  if (!q) return null;
  const confirm = () => { failQuest(questId); onDone(); };

  return <div style={{ padding: '32px 22px 60px', maxWidth: 500, margin: '0 auto' }}>
    <Meta style={{ color: theme.danger }}>CONFIRM DEFAULT</Meta>
    <h2 style={{ fontFamily: 'Newsreader, serif', fontSize: 28, fontWeight: 400, marginTop: 14, color: theme.ink }}>
      {voice.abandonConfirm}
    </h2>

    <div style={{ marginTop: 22, padding: '14px 16px', border: `1px solid ${theme.danger}`, background: 'transparent' }}>
      <Meta style={{ color: theme.danger, marginBottom: 8 }}>WHAT FOLLOWS</Meta>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {[
          `Day ${data.player.day} closes with default on ${q.stat}.`,
          `Penalty Dungeon queues for Day ${data.player.day + 1}. Cannot be declined.`,
          `Arc "${data.arc.title}" pauses until dungeon clears.`,
          `Week ${data.week.number} completion rate drops by 4.8%.`,
          'No appeal panel exists. The System is not designed to accept appeals.',
        ].map((line, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <Mono dim size={11}>—</Mono>
            <span style={{ color: theme.ink, fontSize: 13 }}>{line}</span>
          </div>
        ))}
      </div>
    </div>

    <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
      <Btn onClick={onDone} variant="ghost" full style={{ padding: '14px 22px' }}>Step Back</Btn>
      <Btn onClick={confirm} variant="primary" danger full style={{ padding: '14px 22px' }}>Confirm Default</Btn>
    </div>
  </div>;
}

// ── Sunday Ritual ───────────────────────────────────────────────────────────
function SundayRitual({ onDone, device }) {
  const { theme, voice, data } = useApp();
  const [step, setStep] = useS(1);
  const [refereeOk, setRefereeOk] = useS(false);
  const [receipt, setReceipt] = useS(false);
  const [confirmed, setConfirmed] = useS(false);
  const [reflection, setReflection] = useS('');
  const w = data.week;
  const penalty = w.rate >= 90 ? 0 : w.rate >= 75 ? 2500 : 5000;
  const steps = [
    'Count Verification',
    'Contact Referee',
    'Penalty Display',
    'Transfer to Recipient',
    'Receipt Upload',
    'Referee Confirmation',
    'Reflection Note',
    'Open Next Week',
  ];

  return <div style={{ padding: '24px 22px 60px', maxWidth: 640, margin: '0 auto' }}>
    <Meta>{voice.sundayOpen} · WK {String(w.number).padStart(2,'0')}</Meta>
    <h2 style={{ fontFamily: 'Newsreader, serif', fontSize: 28, fontWeight: 400, marginTop: 12, color: theme.ink }}>
      Sunday Ritual · Step {step}/8
    </h2>

    {/* Step rail */}
    <div style={{ marginTop: 22, display: 'flex', gap: 4 }}>
      {steps.map((_, i) => (
        <div key={i} style={{
          flex: 1, height: 2,
          background: i < step ? theme.ink : theme.rule,
        }} />
      ))}
    </div>
    <Mono dim size={10} style={{ display: 'block', marginTop: 8 }}>STEP · {steps[step - 1]}</Mono>

    <div style={{ marginTop: 24, minHeight: 280 }}>
      {step === 1 && (
        <>
          <h3 style={{ fontFamily: 'Newsreader, serif', fontSize: 22, color: theme.ink, fontWeight: 400 }}>
            Confirm the Count.
          </h3>
          <p style={{ marginTop: 8, color: theme.inkDim, fontStyle: 'italic', fontWeight: 300 }}>
            Pulled from Notion. Verify on your screen and on theirs.
          </p>
          <div style={{
            marginTop: 18, padding: '14px 16px', border: `1px solid ${theme.rule}`,
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0,
          }}>
            {[
              { l: 'ASSIGNED', v: w.assigned },
              { l: 'COMPLETE', v: w.complete },
              { l: 'FAILED',   v: w.failed },
              { l: 'RATE',     v: `${w.rate}%` },
            ].map((c, i, a) => (
              <div key={i} style={{ padding: '6px 8px', borderRight: i < a.length - 1 ? `1px solid ${theme.rule2}` : 'none' }}>
                <Meta>{c.l}</Meta>
                <div className="ls-num" style={{ fontSize: 20, marginTop: 4 }}>{c.v}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <h3 style={{ fontFamily: 'Newsreader, serif', fontSize: 22, color: theme.ink, fontWeight: 400 }}>
            Call the Referee.
          </h3>
          <p style={{ marginTop: 8, color: theme.inkDim, fontStyle: 'italic', fontWeight: 300 }}>
            Mom must see the same ledger before you proceed. This is not negotiable.
          </p>
          <div style={{
            marginTop: 18, padding: '20px', border: `1px solid ${theme.rule}`,
            display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start',
          }}>
            <Meta>REFEREE</Meta>
            <div style={{ fontFamily: 'Newsreader, serif', fontSize: 22, color: theme.ink }}>Mom</div>
            <Mono dim size={11}>+91 *** *** 4421</Mono>
            <button onClick={() => setRefereeOk(true)} className="ls-press" style={{
              marginTop: 10, padding: '10px 18px',
              background: refereeOk ? theme.good : theme.ink, color: theme.bg, border: 'none',
              fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.18em',
              textTransform: 'uppercase', cursor: 'pointer', borderRadius: 0,
            }}>
              {refereeOk ? '✓ Connected · Continuing' : 'Dial Now'}
            </button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <h3 style={{ fontFamily: 'Newsreader, serif', fontSize: 22, color: theme.ink, fontWeight: 400 }}>
            Penalty Owed.
          </h3>
          <div style={{
            marginTop: 18, padding: '40px 20px', border: `1px solid ${penalty > 0 ? theme.danger : theme.good}`,
            textAlign: 'center',
          }}>
            <Meta style={{ color: penalty > 0 ? theme.danger : theme.good }}>
              {penalty > 0 ? 'TRANSFER REQUIRED' : 'CLEAN WEEK'}
            </Meta>
            <div className="ls-num" style={{
              fontSize: 56, color: penalty > 0 ? theme.danger : theme.good,
              fontWeight: 500, marginTop: 8, letterSpacing: '-0.02em',
            }}>
              ₹{penalty.toLocaleString('en-IN')}
            </div>
            <Mono dim size={11} style={{ marginTop: 10 }}>{voice.sundayPenalty(penalty)}</Mono>
          </div>
        </>
      )}

      {step === 4 && (
        <>
          <h3 style={{ fontFamily: 'Newsreader, serif', fontSize: 22, color: theme.ink, fontWeight: 400 }}>Initiate Transfer.</h3>
          <p style={{ marginTop: 8, color: theme.inkDim, fontStyle: 'italic', fontWeight: 300 }}>UPI deep link opens your bank app with recipient and amount pre-filled.</p>
          <div style={{
            marginTop: 18, padding: '18px', border: `1px solid ${theme.rule}`,
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            {[
              ['To',     'Dad · ***@axisbank'],
              ['Amount', `₹${penalty.toLocaleString('en-IN')}`],
              ['Note',   `WK ${w.number} Penalty · No Return`],
              ['Witness','Mom (present)'],
            ].map(([l,v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                paddingBottom: 6, borderBottom: `1px dashed ${theme.rule2}` }}>
                <Meta>{l}</Meta>
                <Mono size={13} style={{ color: theme.ink }}>{v}</Mono>
              </div>
            ))}
          </div>
        </>
      )}

      {step === 5 && (
        <>
          <h3 style={{ fontFamily: 'Newsreader, serif', fontSize: 22, color: theme.ink, fontWeight: 400 }}>Upload Receipt.</h3>
          <DropZone label="DROP UPI CONFIRMATION SCREENSHOT" attached={receipt} onAttach={() => setReceipt(true)} />
        </>
      )}

      {step === 6 && (
        <>
          <h3 style={{ fontFamily: 'Newsreader, serif', fontSize: 22, color: theme.ink, fontWeight: 400 }}>Referee Confirmation.</h3>
          <p style={{ marginTop: 8, color: theme.inkDim, fontStyle: 'italic', fontWeight: 300 }}>This box cannot be self-checked. Have Mom press it.</p>
          <div style={{
            marginTop: 18, padding: '20px', border: `1px solid ${theme.rule}`,
            display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer',
          }} onClick={() => setConfirmed(c => !c)}>
            <div style={{
              width: 22, height: 22, border: `1.5px solid ${confirmed ? theme.good : theme.rule}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {confirmed && <Glyph kind="check" color={theme.good} size={14} />}
            </div>
            <div>
              <div style={{ fontFamily: 'Newsreader, serif', fontSize: 16, color: theme.ink }}>
                Mom confirms the ledger and the payment.
              </div>
              <Mono dim size={10} style={{ marginTop: 2 }}>BINDING · WRITTEN TO PENALTY LOG</Mono>
            </div>
          </div>
        </>
      )}

      {step === 7 && (
        <>
          <h3 style={{ fontFamily: 'Newsreader, serif', fontSize: 22, color: theme.ink, fontWeight: 400 }}>Reflection.</h3>
          <p style={{ marginTop: 8, color: theme.inkDim, fontStyle: 'italic', fontWeight: 300 }}>2–3 sentences. 100-character minimum. The System keeps this honest.</p>
          <textarea value={reflection} onChange={(e) => setReflection(e.target.value)}
            style={{
              marginTop: 12, width: '100%', minHeight: 120, padding: '14px 16px',
              background: theme.surface, border: `1px solid ${theme.rule}`,
              color: theme.ink, fontFamily: 'Newsreader, serif', fontSize: 15, fontStyle: 'italic',
              borderRadius: 0, resize: 'vertical', outline: 'none',
            }} />
          <Mono size={10} dim style={{ display: 'block', textAlign: 'right', marginTop: 4 }}>
            {reflection.length}/100
          </Mono>
        </>
      )}

      {step === 8 && (
        <>
          <h3 style={{ fontFamily: 'Newsreader, serif', fontSize: 22, color: theme.ink, fontWeight: 400 }}>Open Week {w.number + 1}.</h3>
          <p style={{ marginTop: 8, color: theme.inkDim, fontStyle: 'italic', fontWeight: 300 }}>
            Stats roll forward. Passives recalculate. Monday is clean. This is the only mercy the System grants.
          </p>
          <div style={{
            marginTop: 22, padding: '24px', border: `1px solid ${theme.good}`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
          }}>
            <Stamp text="WEEK SEALED" sub={`WK ${w.number} · ${w.rate}%`} color={theme.good} size="lg" />
          </div>
        </>
      )}
    </div>

    <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
      {step > 1 && <Btn onClick={() => setStep(step - 1)} variant="ghost" style={{ padding: '12px 18px' }}>← Back</Btn>}
      <Btn onClick={step === 8 ? onDone : () => setStep(step + 1)} variant="primary" full style={{ padding: '12px 18px' }}>
        {step === 8 ? 'Close Ritual ▸' : 'Continue →'}
      </Btn>
    </div>
  </div>;
}

Object.assign(window, { FlowOverlay, MorningFlow, EveningFlow, ProofFlow, FailConfirm, SundayRitual });
