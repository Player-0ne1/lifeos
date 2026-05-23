'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/components/providers/AppProvider';
import { STATS } from '@/lib/theme';
import { todayIST, humanDateIST } from '@/lib/utils';

// ── System Mark SVG logo ──────────────────────────────────────────────────────
function SystemMark({ size = 40 }: { size?: number }) {
  const { theme } = useApp();
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      <rect x={3} y={3} width={54} height={54} stroke={theme.accent} strokeWidth={1.5} fill="none" />
      <polygon points="30,8 52,30 30,52 8,30" stroke={theme.ink} strokeWidth={1.2} fill="none" />
      <text x={30} y={11} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize={6} fill={theme.inkDim}>I</text>
      <text x={56} y={32} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize={6} fill={theme.inkDim}>II</text>
      <text x={30} y={58} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize={6} fill={theme.inkDim}>III</text>
      <text x={4}  y={32} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize={6} fill={theme.inkDim}>IV</text>
      <circle cx={30} cy={30} r={2} fill={theme.accent} />
    </svg>
  );
}

// ── Reusable step wrapper ─────────────────────────────────────────────────────
function StepBody({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  const { theme } = useApp();
  return (
    <div style={{ padding: '40px 24px 60px', maxWidth: 720, margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'Newsreader, serif', fontSize: 32, fontWeight: 400, color: theme.ink, letterSpacing: '-0.015em' }}>
        {title}
      </h1>
      {sub && (
        <p style={{ marginTop: 10, color: theme.inkDim, fontSize: 15, fontStyle: 'italic', fontWeight: 300, maxWidth: 540 }}>
          {sub}
        </p>
      )}
      {children}
    </div>
  );
}

function StepNav({ next, back, canAdvance = true }: { next: () => void; back: () => void; canAdvance?: boolean }) {
  const { theme } = useApp();
  return (
    <div style={{ display: 'flex', gap: 10, marginTop: 32 }}>
      <button onClick={back} className="ls-press ls-mono" style={{
        background: 'transparent', border: `1px solid ${theme.rule}`,
        color: theme.inkDim, padding: '14px 22px', fontSize: 11,
        letterSpacing: '0.16em', textTransform: 'uppercase', borderRadius: 0, cursor: 'pointer',
      }}>← Back</button>
      <button onClick={next} disabled={!canAdvance} className="ls-press ls-mono" style={{
        flex: 1, background: canAdvance ? theme.ink : theme.rule,
        border: `1px solid ${canAdvance ? theme.ink : theme.rule}`,
        color: canAdvance ? theme.bg : theme.inkMute,
        padding: '14px 22px', fontSize: 11, letterSpacing: '0.18em',
        textTransform: 'uppercase', fontWeight: 600, borderRadius: 0,
        cursor: canAdvance ? 'pointer' : 'not-allowed',
      }}>Continue →</button>
    </div>
  );
}

function FieldBox({ label, value, sub }: { label: string; value: string; sub?: string }) {
  const { theme } = useApp();
  return (
    <div style={{ padding: '12px 14px', border: `1px solid ${theme.rule}` }}>
      <div className="ls-mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: theme.inkMute }}>{label}</div>
      <div style={{ marginTop: 4, fontFamily: 'Newsreader, serif', fontSize: 16, color: theme.ink }}>{value}</div>
      {sub && <div className="ls-mono" style={{ fontSize: 10, color: theme.inkMute, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ── Spider radar chart ────────────────────────────────────────────────────────
function SpiderPreview({ values, labels }: { values: number[]; labels: string[] }) {
  const { theme } = useApp();
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 28;
  const n = values.length;
  const pts = values.map((v, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const rr = (v / 100) * r;
    return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr];
  });
  const polyStr = pts.map(p => p.join(',')).join(' ');
  const axes = labels.map((l, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    const lx = cx + Math.cos(a) * (r + 14);
    const ly = cy + Math.sin(a) * (r + 14);
    return { x, y, lx, ly, label: l };
  });
  return (
    <svg width={size} height={size}>
      {[0.25, 0.5, 0.75, 1].map((k, i) => (
        <polygon key={i}
          points={labels.map((_, j) => {
            const a = (j / n) * Math.PI * 2 - Math.PI / 2;
            return `${cx + Math.cos(a) * r * k},${cy + Math.sin(a) * r * k}`;
          }).join(' ')}
          fill="none" stroke={theme.rule2} strokeWidth={0.7} />
      ))}
      {axes.map((a, i) => (
        <line key={i} x1={cx} y1={cy} x2={a.x} y2={a.y} stroke={theme.rule2} strokeWidth={0.7} />
      ))}
      <polygon points={polyStr} fill={theme.accent} fillOpacity={0.15} stroke={theme.accent} strokeWidth={1.2} />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={2} fill={theme.accent} />
      ))}
      {axes.map((a, i) => (
        <text key={i} x={a.lx} y={a.ly} fontSize={8} fontFamily="JetBrains Mono, monospace"
          fill={theme.inkDim} textAnchor="middle" dominantBaseline="middle" letterSpacing="0.1em">
          {a.label}
        </text>
      ))}
    </svg>
  );
}

// ── Step 1: Welcome ───────────────────────────────────────────────────────────
function WelcomeStep({ next }: { next: () => void }) {
  const { theme, voice } = useApp();
  return (
    <div style={{ padding: '60px 24px 40px', maxWidth: 720, margin: '0 auto', minHeight: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
          <SystemMark size={60} />
        </div>
        <div className="ls-mono" style={{ textAlign: 'center', fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase', color: theme.accent }}>{voice.appName}</div>
        <h1 style={{ fontFamily: 'Newsreader, serif', fontSize: 40, fontWeight: 400, textAlign: 'center', marginTop: 16, color: theme.ink, letterSpacing: '-0.02em', lineHeight: 1.05 }}>
          You are about to install<br />
          <span style={{ fontStyle: 'italic', fontWeight: 300 }}>a system you cannot leave.</span>
        </h1>
        <div style={{ marginTop: 28, padding: '20px 22px', borderTop: `1px solid ${theme.rule}`, borderBottom: `1px solid ${theme.rule}` }}>
          {[
            'Prescriptive. It will tell you what to do.',
            'Consequential. Failure costs money.',
            'Structurally resistant to the rationalisations that ended every prior attempt.',
          ].map((line, i) => (
            <div key={i} style={{ padding: '10px 0', borderTop: i > 0 ? `1px dashed ${theme.rule2}` : 'none', display: 'flex', alignItems: 'baseline', gap: 14 }}>
              <span className="ls-mono" style={{ color: theme.accent, fontWeight: 600, fontSize: 11 }}>{String(i + 1).padStart(2, '0')}</span>
              <span style={{ fontFamily: 'Newsreader, serif', fontSize: 16, color: theme.ink, fontStyle: 'italic', fontWeight: 300 }}>{line}</span>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 24, textAlign: 'center', color: theme.inkDim, fontSize: 14, fontStyle: 'italic' }}>
          {voice.onboardingHook}
        </p>
      </div>
      <div>
        <button onClick={next} className="ls-press" style={{
          marginTop: 32, width: '100%', padding: '20px 22px',
          background: theme.ink, color: theme.bg, border: 'none',
          fontFamily: 'JetBrains Mono, monospace', fontSize: 13,
          letterSpacing: '0.28em', textTransform: 'uppercase', fontWeight: 600,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 0,
          cursor: 'pointer',
        }}>
          <span>Begin Setup</span>
          <span>→</span>
        </button>
        <div className="ls-mono" style={{ textAlign: 'center', fontSize: 9, color: theme.inkMute, marginTop: 10, letterSpacing: '0.14em' }}>
          NO SKIP. NO TRIAL. NO GUEST MODE.
        </div>
      </div>
    </div>
  );
}

// ── Step 2: Identity ──────────────────────────────────────────────────────────
function IdentityStep({ next, back }: { next: () => void; back: () => void }) {
  const { theme } = useApp();
  const [name, setName] = useState('One');
  const today = humanDateIST();
  return (
    <StepBody title="Player Identity" sub="The name you will be addressed by. Your start date is today.">
      <div style={{ marginTop: 22 }}>
        <div className="ls-mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: theme.inkMute }}>PLAYER NAME</div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            marginTop: 8, width: '100%', padding: '14px 16px',
            background: theme.surface, border: `1px solid ${theme.rule}`,
            color: theme.ink, fontFamily: 'Newsreader, serif', fontSize: 22,
            borderRadius: 0, outline: 'none',
          }}
        />
      </div>
      <div style={{ marginTop: 18, padding: '14px 16px', border: `1px solid ${theme.rule}` }}>
        <div className="ls-mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: theme.inkMute }}>SYSTEM DAY 1</div>
        <div className="ls-mono" style={{ marginTop: 6, fontSize: 18, color: theme.ink }}>{today} · Asia/Kolkata</div>
        <div className="ls-mono" style={{ fontSize: 10, color: theme.inkMute, marginTop: 4 }}>TZ AUTO-DETECTED · REQUIRED FOR 22:00 ENFORCEMENT</div>
      </div>
      <StepNav next={next} back={back} canAdvance={name.trim().length > 0} />
    </StepBody>
  );
}

// ── Step 3: Assessment ────────────────────────────────────────────────────────
function AssessmentStep({ next, back }: { next: () => void; back: () => void }) {
  const { theme } = useApp();
  const [vals, setVals] = useState<Record<string, number>>({
    CRAFT: 30, BUILDER: 20, CAPITAL: 10, BODY: 25, MIND: 20, SIGNAL: 10, ART: 5,
  });
  return (
    <StepBody title="Stat Self-Assessment" sub="Calibrate where you actually are, not where you wish to be.">
      <div style={{ marginTop: 14, padding: '12px 14px', border: `1px solid ${theme.warn}` }}>
        <div className="ls-mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: theme.warn }}>HONESTY WARNING</div>
        <p style={{ marginTop: 6, fontSize: 13, color: theme.ink, fontStyle: 'italic' }}>
          Sandbagging here means easy quests forever. The System will let you.
        </p>
      </div>
      <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '1fr 220px', gap: 36, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {(STATS as unknown as string[]).map(s => (
            <div key={s}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span className="ls-mono" style={{ fontSize: 11, fontWeight: 600, color: theme.stat[s], letterSpacing: '0.16em' }}>{s}</span>
                <span className="ls-mono" style={{ fontSize: 11, color: theme.ink }}>{String(vals[s]).padStart(2, '0')}/100</span>
              </div>
              <input type="range" min="0" max="100" value={vals[s]}
                onChange={(e) => setVals(v => ({ ...v, [s]: parseInt(e.target.value) }))}
                style={{ width: '100%', accentColor: theme.stat[s], marginTop: 4 }}
              />
            </div>
          ))}
        </div>
        <div>
          <div className="ls-mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: theme.inkMute, marginBottom: 8 }}>STARTING PROFILE</div>
          <SpiderPreview labels={STATS as unknown as string[]} values={(STATS as unknown as string[]).map(s => vals[s])} />
        </div>
      </div>
      <StepNav next={next} back={back} />
    </StepBody>
  );
}

// ── Step 4: Enforcement ───────────────────────────────────────────────────────
function EnforcementStep({ next, back }: { next: () => void; back: () => void }) {
  const { theme } = useApp();
  const [amount, setAmount] = useState(5000);
  const [agreed, setAgreed] = useState(false);
  return (
    <StepBody title="Enforcement" sub="Choose a number that hurts on a Sunday night.">
      <div style={{ marginTop: 14, padding: '14px 16px', border: `1px solid ${theme.accent}` }}>
        <div className="ls-mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: theme.inkMute }}>WEEKLY PENALTY</div>
        <div className="ls-mono" style={{ fontSize: 36, marginTop: 8, color: theme.ink, fontVariantNumeric: 'tabular-nums' }}>
          ₹{amount.toLocaleString('en-IN')}
        </div>
        <input type="range" min="500" max="20000" step="500" value={amount}
          onChange={(e) => setAmount(parseInt(e.target.value))}
          style={{ width: '100%', accentColor: theme.accent, marginTop: 12 }}
        />
        <div className="ls-mono" style={{ fontSize: 10, color: theme.inkMute, marginTop: 4 }}>
          DEFAULT ₹5,000 · RANGE ₹500–₹20,000 · ≥90% = ₹0 · 75–89% = HALF · &lt;75% = FULL
        </div>
      </div>
      <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
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
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2, flexShrink: 0,
        }}>
          {agreed && <span style={{ color: theme.good, fontSize: 12 }}>✓</span>}
        </div>
        <div>
          <div style={{ fontFamily: 'Newsreader, serif', fontSize: 14, color: theme.ink }}>
            All three parties understand their role. Dad will not return the money. Mom will not skip the call.
          </div>
          <div className="ls-mono" style={{ fontSize: 10, color: theme.inkMute, marginTop: 4 }}>REQUIRED · CANNOT LAUNCH WITHOUT THIS</div>
        </div>
      </div>
      <StepNav next={next} back={back} canAdvance={agreed} />
    </StepBody>
  );
}

// ── Step 5: Notion ────────────────────────────────────────────────────────────
function NotionStep({ next, back }: { next: () => void; back: () => void }) {
  const { theme } = useApp();
  const [connected, setConnected] = useState(false);
  const dbs = [
    'Player Profile', 'Character Sheet', 'Quest Log', 'Quest Library',
    'Stat History Log', 'Daily Check-in Log', 'Weekly Ledger', 'Penalty Log',
    'Passive Library', 'Arc Quest Tracker', 'Skill Registry', 'Financial Log',
  ];
  return (
    <StepBody title="Notion Integration" sub="The data layer. Twelve databases. All must connect or nothing runs.">
      <button onClick={() => setConnected(true)} disabled={connected} className="ls-press ls-mono" style={{
        marginTop: 18, width: '100%', padding: '14px 22px',
        background: connected ? theme.good : theme.ink,
        border: `1px solid ${connected ? theme.good : theme.ink}`,
        color: theme.bg, fontSize: 11, letterSpacing: '0.18em',
        textTransform: 'uppercase', fontWeight: 600, borderRadius: 0, cursor: 'pointer',
      }}>
        {connected ? '✓ Connected · workspace_one' : 'Connect Notion Workspace'}
      </button>
      <div style={{ marginTop: 18 }}>
        <div className="ls-mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: theme.inkMute, marginBottom: 8 }}>DATABASE DISCOVERY</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 0, borderTop: `1px solid ${theme.rule}` }}>
          {dbs.map((db, i) => (
            <div key={db} style={{
              padding: '10px 12px', borderBottom: `1px solid ${theme.rule2}`,
              borderRight: i % 2 === 0 ? `1px solid ${theme.rule2}` : 'none',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ color: connected ? theme.good : theme.inkMute, fontSize: 10 }}>{connected ? '✓' : '○'}</span>
              <span style={{ fontSize: 12, color: theme.ink, fontFamily: 'Newsreader, serif' }}>{db}</span>
            </div>
          ))}
        </div>
      </div>
      <StepNav next={next} back={back} canAdvance={connected} />
    </StepBody>
  );
}

// ── Step 6: Calendar ──────────────────────────────────────────────────────────
function CalendarStep({ next, back }: { next: () => void; back: () => void }) {
  const { theme } = useApp();
  const [connected, setConnected] = useState(false);
  return (
    <StepBody title="Calendar Integration" sub="Optional but recommended. Quest blocks land on your calendar with their deadlines.">
      <button onClick={() => setConnected(true)} disabled={connected} className="ls-press ls-mono" style={{
        marginTop: 18, width: '100%', padding: '14px 22px',
        background: connected ? theme.good : theme.ink,
        border: `1px solid ${connected ? theme.good : theme.ink}`,
        color: theme.bg, fontSize: 11, letterSpacing: '0.18em',
        textTransform: 'uppercase', fontWeight: 600, borderRadius: 0, cursor: 'pointer',
      }}>
        {connected ? '✓ Connected · Google Calendar' : 'Connect Google Calendar'}
      </button>
      {connected && (
        <div style={{ marginTop: 18 }}>
          <div className="ls-mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: theme.inkMute }}>DEFAULT QUEST BLOCK DURATION</div>
          <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {[['EASY', '30 min'], ['MEDIUM', '60 min'], ['HARD', '90 min']].map(([d, t]) => (
              <div key={d} style={{ padding: '12px', border: `1px solid ${theme.rule}` }}>
                <div className="ls-mono" style={{ fontSize: 10, color: theme.inkMute, letterSpacing: '0.14em' }}>{d}</div>
                <div className="ls-mono" style={{ fontSize: 16, fontWeight: 600, marginTop: 4, color: theme.ink }}>{t}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <StepNav next={next} back={back} />
    </StepBody>
  );
}

// ── Step 7: Notifications ─────────────────────────────────────────────────────
function NotificationsStep({ next, back }: { next: () => void; back: () => void }) {
  const { theme } = useApp();
  const [granted, setGranted] = useState(false);
  return (
    <StepBody title="Notification Permissions" sub="Context before consent. Here is everything that will ping.">
      <div style={{ marginTop: 14, borderTop: `1px solid ${theme.rule}` }}>
        {[
          ['07:00 IST', 'Morning Check-in Prompt', 'Daily.'],
          ['21:00 IST', 'Evening Close Reminder', 'Daily.'],
          ['21:30 IST', 'Pending Quest Alert', 'Only if quests remain open.'],
          ['Sun 19:30', 'Sunday Ritual Open', 'Weekly. Cannot be silenced.'],
          ['On Trigger', 'Hidden Quest Issued', 'When a pattern fires.'],
          ['On Threshold', 'Skill Unlock Ready', 'When a stat crosses 30/50/70/90.'],
        ].map(([t, n, d], i) => (
          <div key={i} style={{
            padding: '10px 0', borderBottom: `1px solid ${theme.rule2}`,
            display: 'grid', gridTemplateColumns: '100px 1fr', gap: 10, alignItems: 'baseline',
          }}>
            <span className="ls-mono" style={{ fontSize: 11, fontWeight: 600, color: theme.accent }}>{t}</span>
            <div>
              <div style={{ fontFamily: 'Newsreader, serif', fontSize: 14, color: theme.ink }}>{n}</div>
              <div className="ls-mono" style={{ fontSize: 10, color: theme.inkMute, marginTop: 2 }}>{d}</div>
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => setGranted(true)} disabled={granted} className="ls-press ls-mono" style={{
        marginTop: 18, width: '100%', padding: '14px 22px',
        background: granted ? theme.good : theme.ink,
        border: `1px solid ${granted ? theme.good : theme.ink}`,
        color: theme.bg, fontSize: 11, letterSpacing: '0.18em',
        textTransform: 'uppercase', fontWeight: 600, borderRadius: 0, cursor: 'pointer',
      }}>
        {granted ? '✓ Permission granted' : 'Grant Notifications'}
      </button>
      <StepNav next={next} back={back} />
    </StepBody>
  );
}

// ── Step 8: Launch ────────────────────────────────────────────────────────────
function LaunchStep({ back }: { back: () => void }) {
  const { theme, voice } = useApp();
  const router = useRouter();
  const today = humanDateIST();

  const activate = () => {
    router.push('/directive');
  };

  return (
    <StepBody title="Day 1" sub="Confirm. Once you press the button below, the contract is live.">
      <div style={{
        marginTop: 18, padding: '20px',
        border: `1px solid ${theme.accent}`,
        display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 0,
      }}>
        {[
          ['START DATE', today],
          ['PLAYER NAME', 'One'],
          ['WEEKLY STAKE', '₹5,000'],
          ['RECIPIENT', 'Dad'],
          ['REFEREE', 'Mom'],
          ['ENDGAME', 'Sovereign Polymath'],
        ].map(([l, v], i) => (
          <div key={l} style={{
            padding: '10px 14px',
            borderRight: i % 2 === 0 ? `1px solid ${theme.rule2}` : 'none',
            borderBottom: i < 4 ? `1px dashed ${theme.rule2}` : 'none',
          }}>
            <div className="ls-mono" style={{ fontSize: 10, color: theme.inkMute, letterSpacing: '0.14em', textTransform: 'uppercase' }}>{l}</div>
            <div style={{ marginTop: 4, fontFamily: 'Newsreader, serif', fontSize: 16, color: theme.ink }}>{v}</div>
          </div>
        ))}
      </div>
      <p style={{ marginTop: 24, fontFamily: 'Newsreader, serif', fontSize: 16, fontStyle: 'italic', color: theme.inkDim, fontWeight: 300, textAlign: 'center' }}>
        Press the button. Today becomes Day 1. There is no second Day 1.
      </p>
      <button onClick={activate} className="ls-press" style={{
        marginTop: 18, width: '100%', padding: '24px 22px',
        background: theme.accent, color: theme.bg, border: 'none',
        fontFamily: 'JetBrains Mono, monospace', fontSize: 14,
        letterSpacing: '0.32em', textTransform: 'uppercase', fontWeight: 600,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderRadius: 0, cursor: 'pointer',
      }}>
        <span>Activate The System</span>
        <span>→</span>
      </button>
      <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
        <button onClick={back} className="ls-press ls-mono" style={{
          background: 'transparent', border: `1px solid ${theme.rule}`,
          color: theme.inkDim, padding: '14px 22px', fontSize: 11,
          letterSpacing: '0.16em', textTransform: 'uppercase', borderRadius: 0, cursor: 'pointer',
        }}>← Back</button>
      </div>
    </StepBody>
  );
}

// ── Main Onboarding Flow ──────────────────────────────────────────────────────
export default function OnboardingClient() {
  const { theme, voice } = useApp();
  const [step, setStep] = useState(0);
  const next = () => setStep(s => Math.min(s + 1, 7));
  const back = () => setStep(s => Math.max(s - 1, 0));

  const steps = [
    <WelcomeStep key={0} next={next} />,
    <IdentityStep key={1} next={next} back={back} />,
    <AssessmentStep key={2} next={next} back={back} />,
    <EnforcementStep key={3} next={next} back={back} />,
    <NotionStep key={4} next={next} back={back} />,
    <CalendarStep key={5} next={next} back={back} />,
    <NotificationsStep key={6} next={next} back={back} />,
    <LaunchStep key={7} back={back} />,
  ];

  return (
    <div style={{
      width: '100%', height: '100vh', background: theme.bg, color: theme.ink,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      fontFamily: 'Newsreader, serif',
    }}>
      {/* Top bar */}
      <div style={{
        padding: '14px 18px',
        borderBottom: `1px solid ${theme.rule}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div className="ls-mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: theme.inkMute }}>
          FIRST LAUNCH · {String(step + 1).padStart(2, '0')}/08
        </div>
        <div className="ls-mono" style={{ fontSize: 10, color: theme.inkFaint }}>CANNOT GO BACK ONCE LAUNCHED</div>
      </div>

      {/* Progress rail */}
      <div style={{ display: 'flex', gap: 3, padding: '8px 18px 0' }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ flex: 1, height: 2, background: i <= step ? theme.ink : theme.rule }} />
        ))}
      </div>

      {/* Step content */}
      <div style={{ flex: 1, overflowY: 'auto' }} className="ls-scroll">
        {steps[step]}
      </div>
    </div>
  );
}
