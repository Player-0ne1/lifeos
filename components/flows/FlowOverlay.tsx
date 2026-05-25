'use client';
import {
  useState,
  useEffect,
  useTransition,
  useRef,
  type ChangeEvent,
  type CSSProperties,
} from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/components/providers/AppProvider';
import { Btn, Rule, Meta, Glyph } from '@/components/primitives';
import { submitMorningCheckin, submitEveningClose } from '@/actions/checkin';
import { submitProof, failQuest } from '@/actions/quests';
import { submitSundayRitual } from '@/actions/ledger';

// ─── Teletype animation ───────────────────────────────────────────────────────

const GENERATING_MSGS = [
  'Reading your state...', 
  'Cross-referencing stat decay...',
  'Calibrating difficulty...',
  'Assigning quest load...',
  'Issuing directive...',
];

function TeletypeLines({ lines }: { lines: string[] }) {
  const { theme, density } = useApp();
  return (
    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: density.fontBody }}>
      {lines.map((line, i) => (
        <div
          key={i}
          className="ls-fade-in"
          style={{ color: theme.inkDim, marginBottom: 6, lineHeight: 1.5 }}
        >
          <span style={{ color: theme.accent, marginRight: 8 }}>›</span>
          {line}
        </div>
      ))}
      <span
        className="ls-cursor"
        style={{ display: 'inline-block', width: 9, height: 15, background: theme.accent }}
      />
    </div>
  );
}

// ─── DropZone ─────────────────────────────────────────────────────────────────

interface DropZoneProps {
  onFileAttached: (file: File) => void;
  attached: boolean;
}

function DropZone({ onFileAttached, attached }: DropZoneProps) {
  const { theme, density } = useApp();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      onFileAttached(file);
    }
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files[0];
        if (f) handleFile(f);
      }}
      onClick={() => inputRef.current?.click()}
      style={{
        border: `1px dashed ${attached ? theme.good : dragging ? theme.accent : theme.rule}`,
        borderRadius: 3,
        padding: '18px',
        textAlign: 'center',
        cursor: 'pointer',
        background: dragging ? `${theme.accent}0a` : 'transparent',
        transition: 'border-color 120ms ease, background 120ms ease',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
      {attached ? (
        <div style={{ color: theme.good, fontSize: density.fontMeta }}>
          <Glyph kind="check" size={18} color={theme.good} />
          <div className="ls-mono" style={{ marginTop: 4 }}>Screenshot attached</div>
        </div>
      ) : (
        <div style={{ color: theme.inkMute, fontSize: density.fontMeta }} className="ls-mono">
          Drop screenshot here or tap to upload
        </div>
      )}
    </div>
  );
}

// ─── Overlay shell ────────────────────────────────────────────────────────────

interface OverlayShellProps {
  children: React.ReactNode;
  onClose?: () => void;
  title?: string;
  step?: number;
  totalSteps?: number;
}

function OverlayShell({ children, onClose, title, step, totalSteps }: OverlayShellProps) {
  const { theme, density } = useApp();

  return (
    <div
      className="ls-overlay"
      style={{ background: theme.bg }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `${density.padCard}px ${density.padScreen}px`,
          borderBottom: `1px solid ${theme.rule}`,
          flexShrink: 0,
        }}
      >
        <div>
          {title && (
            <div
              className="ls-mono"
              style={{
                fontSize: density.fontMeta,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: theme.accent,
              }}
            >
              {title}
            </div>
          )}
          {step !== undefined && totalSteps !== undefined && (
            <div
              className="ls-mono"
              style={{ fontSize: density.fontMeta - 1, color: theme.inkMute, marginTop: 2 }}
            >
              Step {step} of {totalSteps}
            </div>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ls-press"
            style={{
              background: 'none',
              border: `1px solid ${theme.rule}`,
              borderRadius: 2,
              padding: '5px 10px',
              color: theme.inkMute,
              cursor: 'pointer',
              fontSize: density.fontMeta,
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Progress bar */}
      {step !== undefined && totalSteps !== undefined && (
        <div style={{ height: 2, background: theme.rule, flexShrink: 0 }}>
          <div
            style={{
              height: '100%',
              background: theme.accent,
              width: `${((step - 1) / totalSteps) * 100}%`,
              transition: 'width 300ms ease',
            }}
          />
        </div>
      )}

      {/* Scrollable content */}
      <div
        className="ls-scroll"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: `${density.padScreen}px`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ─── Energy picker ────────────────────────────────────────────────────────────

interface EnergyPickerProps {
  value: number;
  onChange: (v: number) => void;
}

function EnergyPicker({ value, onChange }: EnergyPickerProps) {
  const { theme, density } = useApp();
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className="ls-press ls-mono"
          style={{
            flex: 1,
            padding: '10px 0',
            fontSize: density.fontBody,
            border: `1px solid ${value === n ? theme.accent : theme.rule}`,
            borderRadius: 2,
            background: value === n ? `${theme.accent}20` : 'transparent',
            color: value === n ? theme.accent : theme.inkDim,
            cursor: 'pointer',
            letterSpacing: '0.04em',
          }}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

// ─── Label + field helpers ────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  children: React.ReactNode;
  hint?: string;
}

function Field({ label, children, hint }: FieldProps) {
  const { theme, density } = useApp();
  return (
    <div style={{ marginBottom: density.gap + 4 }}>
      <div
        className="ls-mono"
        style={{
          fontSize: density.fontMeta,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: theme.inkMute,
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      {children}
      {hint && (
        <div
          style={{ fontSize: density.fontMeta - 1, color: theme.inkFaint, marginTop: 4 }}
        >
          {hint}
        </div>
      )}
    </div>
  );
}

function Textarea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  const { theme, density } = useApp();
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{
        width: '100%',
        padding: '10px 12px',
        background: theme.surface,
        border: `1px solid ${theme.rule}`,
        borderRadius: 2,
        color: theme.ink,
        fontSize: density.fontBody,
        resize: 'vertical',
        outline: 'none',
        lineHeight: 1.55,
        fontFamily: 'inherit',
      }}
    />
  );
}

// ─── MorningFlow ──────────────────────────────────────────────────────────────

interface MorningFlowProps {
  onClose: () => void;
}

function MorningFlow({ onClose }: MorningFlowProps) {
  const { theme, density, voice, setDayState } = useApp();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [energy, setEnergy] = useState(3);
  const [constraints, setConstraints] = useState('');
  const [mindNote, setMindNote] = useState('');
  const [generating, setGenerating] = useState(false);
  const [genLines, setGenLines] = useState<string[]>([]);
  const [, startTransition] = useTransition();

  async function handleSubmit() {
    setStep(3);
    setGenerating(true);

    // Teletype animation
    for (let i = 0; i < GENERATING_MSGS.length; i++) {
      await new Promise((res) => setTimeout(res, 500 + i * 350));
      setGenLines((prev) => [...prev, GENERATING_MSGS[i]]);
    }

    startTransition(async () => {
      try {
        await submitMorningCheckin(energy, constraints, mindNote);
        setDayState('mid-day');
        await new Promise((res) => setTimeout(res, 600));
        onClose();
        router.push('/directive');
        router.refresh();
      } catch (err) {
        console.error('Morning checkin error:', err);
        onClose();
      }
    });
  }

  if (step === 3) {
    return (
      <OverlayShell title="Generating Directive">
        <div style={{ maxWidth: 520 }}>
          <div
            style={{
              fontSize: density.fontHead * 0.75,
              color: theme.ink,
              marginBottom: density.gap * 2,
              lineHeight: 1.4,
            }}
          >
            {voice.afterCheckin(energy)}
          </div>
          <Rule style={{ marginBottom: density.gap * 2 }} />
          <TeletypeLines lines={genLines} />
        </div>
      </OverlayShell>
    );
  }

  return (
    <OverlayShell
      title="Morning Check-In"
      step={step}
      totalSteps={2}
      onClose={onClose}
    >
      <div style={{ maxWidth: 520 }}>
        {step === 1 && (
          <>
            <div
              style={{
                fontSize: density.fontHead * 0.85,
                color: theme.ink,
                marginBottom: density.gap * 2,
                lineHeight: 1.35,
              }}
            >
              {voice.morningGreeting(0)}
            </div>
            <Rule style={{ marginBottom: density.gap * 2 }} />
            <Field label="Energy Level" hint="1 = depleted · 5 = peak">
              <EnergyPicker value={energy} onChange={setEnergy} />
            </Field>
            <Field label="Constraints today" hint="Meetings, travel, hard limits">
              <Textarea
                value={constraints}
                onChange={setConstraints}
                placeholder="e.g. Client call 2–4pm, no gym access"
              />
            </Field>
            <div style={{ marginTop: density.gap * 2 }}>
              <Btn full size="lg" onClick={() => setStep(2)}>
                Continue
              </Btn>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <div
              className="ls-mono"
              style={{
                fontSize: density.fontMeta,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: theme.inkMute,
                marginBottom: density.gap,
              }}
            >
              Mind note
            </div>
            <div
              style={{
                fontSize: density.fontBody,
                color: theme.inkDim,
                marginBottom: density.gap * 1.5,
                lineHeight: 1.55,
              }}
            >
              One sentence on what is occupying your mind right now. The System uses this to
              calibrate.
            </div>
            <Field label="Mind note">
              <Textarea
                value={mindNote}
                onChange={setMindNote}
                placeholder="e.g. Anxious about the pitch deck, head clear otherwise"
                rows={4}
              />
            </Field>
            <div
              style={{
                display: 'flex',
                gap: density.gap,
                marginTop: density.gap * 2,
              }}
            >
              <Btn variant="ghost" onClick={() => setStep(1)} style={{ flex: 1 }}>
                Back
              </Btn>
              <Btn onClick={handleSubmit} style={{ flex: 2 }} size="lg">
                Issue Directive
              </Btn>
            </div>
          </>
        )}
      </div>
    </OverlayShell>
  );
}

// ─── EveningFlow ──────────────────────────────────────────────────────────────

interface EveningFlowProps {
  onClose: () => void;
}

function EveningFlow({ onClose }: EveningFlowProps) {
  const { theme, density, voice, setDayState } = useApp();
  const router = useRouter();
  const [closeEnergy, setCloseEnergy] = useState(3);
  const [dayNote, setDayNote] = useState('');
  const [dayResult, setDayResult] = useState<'all-complete' | 'failed'>('all-complete');
  const [submitting, setSubmitting] = useState(false);
  const [, startTransition] = useTransition();

  async function handleSubmit() {
    setSubmitting(true);
    startTransition(async () => {
      try {
        await submitEveningClose(closeEnergy, dayNote, dayResult);
        setDayState(dayResult);
        onClose();
        router.push('/directive');
        router.refresh();
      } catch (err) {
        console.error('Evening close error:', err);
        onClose();
      }
    });
  }

  return (
    <OverlayShell title="Evening Close" onClose={onClose}>
      <div style={{ maxWidth: 520 }}>
        <div
          style={{
            fontSize: density.fontHead * 0.8,
            color: theme.ink,
            marginBottom: density.gap * 2,
            lineHeight: 1.4,
          }}
        >
          {voice.sundayOpen}
        </div>
        <Rule style={{ marginBottom: density.gap * 2 }} />

        <Field label="Closing energy">
          <EnergyPicker value={closeEnergy} onChange={setCloseEnergy} />
        </Field>

        <Field label="Day outcome">
          <div style={{ display: 'flex', gap: 8 }}>
            {(['all-complete', 'failed'] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setDayResult(opt)}
                className="ls-press ls-mono"
                style={{
                  flex: 1,
                  padding: '10px',
                  fontSize: density.fontMeta,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  border: `1px solid ${dayResult === opt ? (opt === 'all-complete' ? theme.good : theme.danger) : theme.rule}`,
                  borderRadius: 2,
                  background: dayResult === opt
                    ? opt === 'all-complete'
                      ? `${theme.good}20`
                      : `${theme.danger}20`
                    : 'transparent',
                  color: dayResult === opt
                    ? opt === 'all-complete' ? theme.good : theme.danger
                    : theme.inkDim,
                  cursor: 'pointer',
                }}
              >
                {opt === 'all-complete' ? 'Complete' : 'Failed'}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Day note" hint="What happened? One to three sentences.">
          <Textarea
            value={dayNote}
            onChange={setDayNote}
            placeholder="Brief summary of the day's execution..."
            rows={4}
          />
        </Field>

        <div style={{ marginTop: density.gap * 2 }}>
          <Btn
            full
            size="lg"
            danger={dayResult === 'failed'}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Closing...' : 'Close Day'}
          </Btn>
        </div>
      </div>
    </OverlayShell>
  );
}

// ─── ProofFlow ────────────────────────────────────────────────────────────────

interface ProofFlowProps {
  questId: string;
  onClose: () => void;
}

function ProofFlow({ questId, onClose }: ProofFlowProps) {
  const { theme, density, voice } = useApp();
  const router = useRouter();
  const [proofText, setProofText] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    approved: boolean;
    xpAwarded: number;
    feedback: string;
  } | null>(null);
  const [, startTransition] = useTransition();

  const wc = proofText.trim().split(/\s+/).filter(Boolean).length;

  async function handleSubmit() {
    setSubmitting(true);
    startTransition(async () => {
      try {
        const res = await submitProof(questId, proofText, proofUrl, wc);
        setResult(res);
        if (res.approved) {
          router.refresh();
        }
      } catch (err) {
        console.error('Proof submission error:', err);
      } finally {
        setSubmitting(false);
      }
    });
  }

  if (result) {
    return (
      <OverlayShell title="Proof Review" onClose={onClose}>
        <div style={{ maxWidth: 480, textAlign: 'center', paddingTop: density.padScreen }}>
          {result.approved ? (
            <>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: `${theme.good}20`,
                  border: `2px solid ${theme.good}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                }}
              >
                <Glyph kind="check" size={28} color={theme.good} />
              </div>
              <div
                className="ls-mono"
                style={{
                  fontSize: density.fontHead * 0.7,
                  color: theme.good,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}
              >
                {voice.completeCTA}
              </div>
              <div
                className="ls-mono"
                style={{ fontSize: density.fontBody, color: theme.accent, marginBottom: 16 }}
              >
                +{result.xpAwarded} XP
              </div>
            </>
          ) : (
            <>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: `${theme.danger}20`,
                  border: `2px solid ${theme.danger}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                }}
              >
                <Glyph kind="cross" size={28} color={theme.danger} />
              </div>
              <div
                className="ls-mono"
                style={{
                  fontSize: density.fontHead * 0.7,
                  color: theme.danger,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}
              >
                Proof Rejected
              </div>
            </>
          )}

          <div
            style={{
              padding: density.padCard,
              background: theme.surface,
              border: `1px solid ${theme.rule}`,
              borderRadius: 3,
              fontSize: density.fontBody,
              color: theme.inkDim,
              lineHeight: 1.55,
              textAlign: 'left',
              marginBottom: density.gap * 2,
            }}
          >
            {result.feedback}
          </div>
          <Btn full onClick={onClose} variant={result.approved ? 'primary' : 'ghost'}>
            {result.approved ? 'Done' : 'Revise & Retry'}
          </Btn>
        </div>
      </OverlayShell>
    );
  }

  return (
    <OverlayShell title="Submit Proof" onClose={onClose}>
      <div style={{ maxWidth: 520 }}>
        <div
          style={{
            fontSize: density.fontBody,
            color: theme.inkDim,
            marginBottom: density.gap * 2,
            lineHeight: 1.55,
          }}
        >
          Submit evidence of completion. The System scores your proof against the stated standard.
        </div>
        <Rule style={{ marginBottom: density.gap * 2 }} />

        <Field label="Proof text" hint={`${wc} words`}>
          <Textarea
            value={proofText}
            onChange={setProofText}
            placeholder="Describe what you did and how you did it..."
            rows={6}
          />
        </Field>

        <Field label="URL (optional)" hint="Link to work, doc, or commit">
          <input
            type="url"
            value={proofUrl}
            onChange={(e) => setProofUrl(e.target.value)}
            placeholder="https://..."
            style={{
              width: '100%',
              padding: '10px 12px',
              background: theme.surface,
              border: `1px solid ${theme.rule}`,
              borderRadius: 2,
              color: theme.ink,
              fontSize: density.fontBody,
              outline: 'none',
              fontFamily: "'JetBrains Mono', monospace",
            }}
          />
        </Field>

        <Field label="Screenshot">
          <DropZone
            attached={!!attachedFile}
            onFileAttached={(f) => setAttachedFile(f)}
          />
        </Field>

        <div style={{ marginTop: density.gap * 2 }}>
          <Btn
            full
            size="lg"
            onClick={handleSubmit}
            disabled={submitting || proofText.trim().length < 10}
          >
            {submitting ? 'Submitting...' : voice.completeCTA}
          </Btn>
        </div>
      </div>
    </OverlayShell>
  );
}

// ─── FailConfirm ──────────────────────────────────────────────────────────────

interface FailConfirmProps {
  questId: string;
  onClose: () => void;
}

function FailConfirm({ questId, onClose }: FailConfirmProps) {
  const { theme, density, voice } = useApp();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [, startTransition] = useTransition();

  async function handleFail() {
    setConfirming(true);
    startTransition(async () => {
      try {
        await failQuest(questId);
        router.refresh();
        onClose();
      } catch (err) {
        console.error('Fail quest error:', err);
        setConfirming(false);
      }
    });
  }

  return (
    <OverlayShell title="Abandon Quest" onClose={onClose}>
      <div style={{ maxWidth: 480 }}>
        <div
          style={{
            padding: density.padCard,
            background: `${theme.danger}0a`,
            border: `1px solid ${theme.danger}40`,
            borderRadius: 3,
            marginBottom: density.gap * 2,
          }}
        >
          <div
            className="ls-mono"
            style={{
              fontSize: density.fontBody,
              color: theme.danger,
              lineHeight: 1.6,
            }}
          >
            {voice.abandonConfirm}
          </div>
        </div>

        <Rule style={{ marginBottom: density.gap * 2 }} />

        <div style={{ display: 'flex', gap: density.gap }}>
          <Btn variant="ghost" onClick={onClose} style={{ flex: 1 }}>
            Cancel
          </Btn>
          <Btn
            danger
            onClick={handleFail}
            disabled={confirming}
            style={{ flex: 1 }}
          >
            {confirming ? 'Logging...' : voice.failCTA}
          </Btn>
        </div>
      </div>
    </OverlayShell>
  );
}

// ─── SundayRitual ─────────────────────────────────────────────────────────────

interface SundayRitualProps {
  penaltyAmount?: number;
  onClose: () => void;
}

const SUNDAY_STEPS = 8;

function SundayRitual({ penaltyAmount = 0, onClose }: SundayRitualProps) {
  const { theme, density, voice } = useApp();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [reflection, setReflection] = useState('');
  const [penaltyPaid, setPenaltyPaid] = useState(false);
  const [upiRef, setUpiRef] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [, startTransition] = useTransition();

  const hasPenalty = penaltyAmount > 0;

  async function handleSubmit() {
    setSubmitting(true);
    startTransition(async () => {
      try {
        await submitSundayRitual({
          reflection,
          penaltyPaid,
          upiRef: upiRef || undefined,
        });
        router.refresh();
        onClose();
      } catch (err) {
        console.error('Sunday ritual error:', err);
        setSubmitting(false);
      }
    });
  }

  const stepContent = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <div
              className="ls-mono"
              style={{
                fontSize: density.fontHead * 0.7,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: theme.accent,
                marginBottom: density.gap,
              }}
            >
              {voice.sundayOpen}
            </div>
            <div
              style={{
                fontSize: density.fontBody,
                color: theme.inkDim,
                lineHeight: 1.6,
                marginBottom: density.gap * 2,
              }}
            >
              The week is being sealed. You will now account for what passed. This takes
              approximately five minutes.
            </div>
            <Btn full size="lg" onClick={() => setStep(2)}>
              Begin
            </Btn>
          </div>
        );

      case 2:
      case 3:
      case 4:
        // Reflection steps
        return (
          <div>
            <div
              className="ls-mono"
              style={{
                fontSize: density.fontMeta,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: theme.inkMute,
                marginBottom: density.gap,
              }}
            >
              Week Reflection {step - 1} / 3
            </div>
            <Field
              label={
                step === 2
                  ? 'What did you do this week?'
                  : step === 3
                  ? 'What did you avoid?'
                  : 'What will change next week?'
              }
            >
              <Textarea
                value={reflection}
                onChange={setReflection}
                placeholder="Be specific. The System reads for honesty."
                rows={6}
              />
            </Field>
            <div style={{ display: 'flex', gap: density.gap, marginTop: density.gap }}>
              <Btn variant="ghost" onClick={() => setStep(step - 1)} style={{ flex: 1 }}>
                Back
              </Btn>
              <Btn onClick={() => setStep(step + 1)} style={{ flex: 2 }}>
                Continue
              </Btn>
            </div>
          </div>
        );

      case 5:
        return (
          <div>
            <div
              className="ls-mono"
              style={{
                fontSize: density.fontMeta,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: theme.inkMute,
                marginBottom: density.gap * 1.5,
              }}
            >
              Penalty Ledger
            </div>
            <div
              style={{
                padding: density.padCard,
                background: theme.surface,
                border: `1px solid ${hasPenalty ? theme.danger + '50' : theme.rule}`,
                borderRadius: 3,
                marginBottom: density.gap * 2,
              }}
            >
              <div
                className="ls-mono"
                style={{
                  fontSize: density.fontBody,
                  color: hasPenalty ? theme.danger : theme.good,
                  lineHeight: 1.6,
                }}
              >
                {voice.sundayPenalty(penaltyAmount)}
              </div>
            </div>
            <div style={{ display: 'flex', gap: density.gap }}>
              <Btn variant="ghost" onClick={() => setStep(4)} style={{ flex: 1 }}>
                Back
              </Btn>
              <Btn onClick={() => setStep(6)} style={{ flex: 2 }}>
                Continue
              </Btn>
            </div>
          </div>
        );

      case 6:
        return (
          <div>
            {hasPenalty ? (
              <>
                <div
                  className="ls-mono"
                  style={{
                    fontSize: density.fontMeta,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: theme.inkMute,
                    marginBottom: density.gap * 1.5,
                  }}
                >
                  Penalty Transfer
                </div>
                <div
                  style={{
                    fontSize: density.fontBody,
                    color: theme.inkDim,
                    lineHeight: 1.6,
                    marginBottom: density.gap * 1.5,
                  }}
                >
                  Transfer{' '}
                  <span className="ls-mono" style={{ color: theme.accent }}>
                    Rs. {penaltyAmount.toLocaleString('en-IN')}
                  </span>{' '}
                  via UPI. Enter the reference number below.
                </div>
                <Field label="UPI Reference (optional)">
                  <input
                    type="text"
                    value={upiRef}
                    onChange={(e) => setUpiRef(e.target.value)}
                    placeholder="Transaction ID"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: theme.surface,
                      border: `1px solid ${theme.rule}`,
                      borderRadius: 2,
                      color: theme.ink,
                      fontSize: density.fontBody,
                      outline: 'none',
                      fontFamily: 'inherit',
                    }}
                  />
                </Field>
                <div style={{ display: 'flex', gap: density.gap, marginTop: density.gap }}>
                  <Btn
                    variant="ghost"
                    onClick={() => { setPenaltyPaid(false); setStep(7); }}
                    style={{ flex: 1 }}
                    danger
                  >
                    Not paid
                  </Btn>
                  <Btn
                    onClick={() => { setPenaltyPaid(true); setStep(7); }}
                    style={{ flex: 2 }}
                  >
                    Paid — confirm
                  </Btn>
                </div>
              </>
            ) : (
              <div>
                <div
                  style={{
                    fontSize: density.fontBody,
                    color: theme.good,
                    marginBottom: density.gap * 2,
                    lineHeight: 1.6,
                  }}
                >
                  No penalty owed. Clean week.
                </div>
                <div style={{ display: 'flex', gap: density.gap }}>
                  <Btn variant="ghost" onClick={() => setStep(5)} style={{ flex: 1 }}>
                    Back
                  </Btn>
                  <Btn onClick={() => setStep(7)} style={{ flex: 2 }}>
                    Continue
                  </Btn>
                </div>
              </div>
            )}
          </div>
        );

      case 7:
        return (
          <div>
            <div
              className="ls-mono"
              style={{
                fontSize: density.fontMeta,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: theme.inkMute,
                marginBottom: density.gap * 1.5,
              }}
            >
              Intentions for next week
            </div>
            <Field label="Three intentions">
              <Textarea
                value={reflection}
                onChange={setReflection}
                placeholder="State them simply and concretely..."
                rows={6}
              />
            </Field>
            <div style={{ display: 'flex', gap: density.gap, marginTop: density.gap }}>
              <Btn variant="ghost" onClick={() => setStep(6)} style={{ flex: 1 }}>
                Back
              </Btn>
              <Btn onClick={() => setStep(8)} style={{ flex: 2 }}>
                Continue
              </Btn>
            </div>
          </div>
        );

      case 8:
        return (
          <div>
            <div
              className="ls-mono"
              style={{
                fontSize: density.fontHead * 0.7,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: theme.accent,
                marginBottom: density.gap,
              }}
            >
              Seal the week
            </div>
            <div
              style={{
                fontSize: density.fontBody,
                color: theme.inkDim,
                lineHeight: 1.6,
                marginBottom: density.gap * 2,
              }}
            >
              The record will be sealed. The ledger updated. The arc continues.
            </div>
            <Rule style={{ marginBottom: density.gap * 2 }} />
            <div style={{ display: 'flex', gap: density.gap }}>
              <Btn variant="ghost" onClick={() => setStep(7)} style={{ flex: 1 }}>
                Back
              </Btn>
              <Btn
                onClick={handleSubmit}
                disabled={submitting}
                size="lg"
                style={{ flex: 2 }}
              >
                {submitting ? 'Sealing...' : 'Seal Week'}
              </Btn>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <OverlayShell
      title="Sunday Ritual"
      step={step}
      totalSteps={SUNDAY_STEPS}
      onClose={onClose}
    >
      <div style={{ maxWidth: 520 }}>{stepContent()}</div>
    </OverlayShell>
  );
}

// ─── FlowOverlay (root) ───────────────────────────────────────────────────────

export function FlowOverlay() {
  const { overlay, setOverlay } = useApp();

  if (!overlay) return null;

  const close = () => setOverlay(null);

  switch (overlay.kind) {
    case 'morning':
      return <MorningFlow onClose={close} />;
    case 'evening':
      return <EveningFlow onClose={close} />;
    case 'proof':
      return overlay.questId
        ? <ProofFlow questId={overlay.questId} onClose={close} />
        : null;
    case 'fail-confirm':
      return overlay.questId
        ? <FailConfirm questId={overlay.questId} onClose={close} />
        : null;
    case 'sunday':
      return <SundayRitual onClose={close} />;
    default:
      return null;
  }
}

export default FlowOverlay;
