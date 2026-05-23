'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/components/providers/AppProvider';
import { THEMES, VOICE, DENSITY, type ThemeKey, type VoiceKey, type DensityKey } from '@/lib/theme';
import { setThemeAction, setVoiceAction, setDensityAction } from '@/actions/player';

interface SettingsClientProps {
  player: { name: string; level: number; day: number; streak: number } | null;
  currentTheme: ThemeKey;
  currentVoice: VoiceKey;
  currentDensity: DensityKey;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  const { theme } = useApp();
  return (
    <div className="ls-mono" style={{
      fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
      color: theme.inkMute, marginTop: 32, marginBottom: 12,
      paddingBottom: 8, borderBottom: `1px solid ${theme.rule}`,
    }}>
      {children}
    </div>
  );
}

function OptionRow({ label, sub, onClick, active }: { label: string; sub?: string; onClick: () => void; active?: boolean }) {
  const { theme } = useApp();
  return (
    <button onClick={onClick} className="ls-press" style={{
      width: '100%', background: 'transparent', border: 'none', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 0', borderBottom: `1px solid ${theme.rule2}`, textAlign: 'left',
      color: 'inherit',
    }}>
      <div>
        <div style={{ fontFamily: 'Newsreader, serif', fontSize: 16, color: theme.ink }}>{label}</div>
        {sub && <div className="ls-mono" style={{ fontSize: 10, color: theme.inkMute, marginTop: 2 }}>{sub}</div>}
      </div>
      <div style={{
        width: 8, height: 8, borderRadius: '50%',
        background: active ? theme.accent : 'transparent',
        border: `1.5px solid ${active ? theme.accent : theme.rule}`,
        flexShrink: 0,
      }} />
    </button>
  );
}

function EnvRow({ label, envKey }: { label: string; envKey: string }) {
  const { theme } = useApp();
  return (
    <div style={{
      padding: '10px 0', borderBottom: `1px solid ${theme.rule2}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <span style={{ fontFamily: 'Newsreader, serif', fontSize: 14, color: theme.ink }}>{label}</span>
      <div className="ls-mono" style={{ fontSize: 10, color: theme.inkMute }}>
        {envKey}
      </div>
    </div>
  );
}

export default function SettingsClient({ player, currentTheme, currentVoice, currentDensity }: SettingsClientProps) {
  const { theme, setThemeKey, setVoiceKey, setDensityKey, themeKey, voiceKey, densityKey } = useApp();
  const router = useRouter();

  const handleTheme = async (k: ThemeKey) => {
    setThemeKey(k);
    await setThemeAction(k);
  };

  const handleVoice = async (k: VoiceKey) => {
    setVoiceKey(k);
    await setVoiceAction(k);
  };

  const handleDensity = async (k: DensityKey) => {
    setDensityKey(k);
    await setDensityAction(k);
  };

  return (
    <div className="ls-scroll" style={{ height: '100%', overflowY: 'auto' }}>
      <div style={{ padding: '28px 24px 60px', maxWidth: 720 }}>
        {/* Header */}
        <div className="ls-mono" style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: theme.inkMute }}>
          SETTINGS
        </div>
        <h1 style={{ fontFamily: 'Newsreader, serif', fontSize: 32, fontWeight: 400, marginTop: 10, color: theme.ink, letterSpacing: '-0.01em' }}>
          Configuration
        </h1>

        {/* Player */}
        <SectionTitle>Player</SectionTitle>
        <div style={{ padding: '16px', border: `1px solid ${theme.rule}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div>
              <div style={{ fontFamily: 'Newsreader, serif', fontSize: 22, color: theme.ink }}>{player?.name ?? 'ONE'}</div>
              <div className="ls-mono" style={{ fontSize: 10, color: theme.inkMute, marginTop: 2 }}>PLAYER · SINGLE USER SYSTEM</div>
            </div>
            <div className="ls-mono" style={{ fontSize: 10, color: theme.inkMute, textAlign: 'right' }}>
              LVL {player?.level ?? 1}<br />
              DAY {String(player?.day ?? 1).padStart(3, '0')}<br />
              STK {player?.streak ?? 0}
            </div>
          </div>
        </div>

        {/* Appearance — Theme */}
        <SectionTitle>Theme</SectionTitle>
        {(Object.keys(THEMES) as ThemeKey[]).map(k => (
          <OptionRow
            key={k}
            label={THEMES[k].name}
            sub={k === 'vellum' ? 'Warm dark — manuscript on charcoal' : k === 'graphite' ? 'Cool dark — clean and structural' : 'Light — high-contrast paper'}
            active={themeKey === k}
            onClick={() => handleTheme(k)}
          />
        ))}

        {/* Voice */}
        <SectionTitle>Voice Mode</SectionTitle>
        {(Object.keys(VOICE) as VoiceKey[]).map(k => (
          <OptionRow
            key={k}
            label={VOICE[k].name}
            sub={k === 'cold' ? 'Terse, dry, mildly sardonic' : k === 'judicial' ? 'Formal, contractual, authoritative' : 'Cryptic, oracular, restrained'}
            active={voiceKey === k}
            onClick={() => handleVoice(k)}
          />
        ))}

        {/* Density */}
        <SectionTitle>Density</SectionTitle>
        {(Object.keys(DENSITY) as DensityKey[]).map(k => (
          <OptionRow
            key={k}
            label={DENSITY[k].name}
            sub={k === 'comfortable' ? 'Standard padding and spacing' : 'Compact — more content visible per screen'}
            active={densityKey === k}
            onClick={() => handleDensity(k)}
          />
        ))}

        {/* Notion Integration */}
        <SectionTitle>Notion Integration</SectionTitle>
        <div style={{ padding: '14px 16px', border: `1px solid ${theme.rule}`, marginBottom: 8 }}>
          <div className="ls-mono" style={{ fontSize: 10, color: theme.accent, letterSpacing: '0.14em', marginBottom: 8 }}>SET IN .env.local</div>
          {[
            ['Notion Token', 'NOTION_TOKEN'],
            ['Player Profile', 'NOTION_DB_PLAYER_PROFILE'],
            ['Character Sheet', 'NOTION_DB_CHARACTER_SHEET'],
            ['Quest Log', 'NOTION_DB_QUEST_LOG'],
            ['Quest Library', 'NOTION_DB_QUEST_LIBRARY'],
            ['Stat History', 'NOTION_DB_STAT_HISTORY'],
            ['Check-in Log', 'NOTION_DB_CHECKIN_LOG'],
            ['Weekly Ledger', 'NOTION_DB_WEEKLY_LEDGER'],
            ['Penalty Log', 'NOTION_DB_PENALTY_LOG'],
            ['Passive Library', 'NOTION_DB_PASSIVE_LIBRARY'],
            ['Arc Tracker', 'NOTION_DB_ARC_TRACKER'],
            ['Skill Registry', 'NOTION_DB_SKILL_REGISTRY'],
            ['Financial Log', 'NOTION_DB_FINANCIAL_LOG'],
          ].map(([label, key]) => (
            <EnvRow key={key} label={label} envKey={key} />
          ))}
        </div>

        {/* Claude API */}
        <SectionTitle>Claude API</SectionTitle>
        <div style={{ padding: '14px 16px', border: `1px solid ${theme.rule}`, marginBottom: 8 }}>
          <div className="ls-mono" style={{ fontSize: 10, color: theme.accent, letterSpacing: '0.14em', marginBottom: 8 }}>SET IN .env.local</div>
          <EnvRow label="Anthropic API Key" envKey="ANTHROPIC_API_KEY" />
          <div style={{ marginTop: 12, padding: '10px 12px', background: theme.surface }}>
            <div className="ls-mono" style={{ fontSize: 10, color: theme.inkMute }}>
              MODEL: claude-opus-4-7 · PROMPT CACHING ENABLED<br />
              DIRECTIVE GENERATION: ~800 TOKENS + CACHE<br />
              PROOF SCORING: ~300 TOKENS<br />
              SKILL DELIVERABLES: ~500 TOKENS
            </div>
          </div>
        </div>

        {/* Enforcement */}
        <SectionTitle>Enforcement</SectionTitle>
        <div style={{ padding: '14px 16px', border: `1px solid ${theme.rule}` }}>
          {[
            ['Weekly Penalty (full)', '₹5,000'],
            ['Penalty Threshold (full)', '< 75% completion'],
            ['Penalty Threshold (half)', '75–89% completion'],
            ['Clean week', '≥ 90% completion'],
            ['Recipient', 'Dad'],
            ['Referee', 'Mom'],
            ['Enforcement Time', '22:00 IST daily'],
          ].map(([l, v]) => (
            <div key={l} style={{
              padding: '8px 0', borderBottom: `1px solid ${theme.rule2}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            }}>
              <span style={{ fontFamily: 'Newsreader, serif', fontSize: 14, color: theme.ink }}>{l}</span>
              <span className="ls-mono" style={{ fontSize: 11, color: theme.inkDim }}>{v}</span>
            </div>
          ))}
          <div style={{ marginTop: 10 }}>
            <div className="ls-mono" style={{ fontSize: 10, color: theme.inkMute }}>
              TO CHANGE: Update values in Notion Player Profile database.
            </div>
          </div>
        </div>

        {/* About */}
        <SectionTitle>About</SectionTitle>
        <div style={{ padding: '14px 16px', border: `1px solid ${theme.rule}` }}>
          <div style={{ fontFamily: 'Newsreader, serif', fontSize: 18, color: theme.ink }}>THE SYSTEM · LifeOS</div>
          <div className="ls-mono" style={{ fontSize: 10, color: theme.inkMute, marginTop: 4 }}>
            SOVEREIGN POLYMATH PROTOCOL<br />
            BUILT WITH NEXT.JS 16 · NOTION · CLAUDE<br />
            SINGLE-USER · NO ANALYTICS · NO TELEMETRY
          </div>
          <div style={{ marginTop: 12 }}>
            <a href="https://github.com" className="ls-mono" style={{
              fontSize: 10, color: theme.accent, textDecoration: 'none', letterSpacing: '0.12em',
            }}>
              VIEW SOURCE →
            </a>
          </div>
        </div>

        {/* Danger zone */}
        <SectionTitle>Data</SectionTitle>
        <div style={{ padding: '14px 16px', border: `1px solid ${theme.danger}` }}>
          <div className="ls-mono" style={{ fontSize: 10, color: theme.danger, marginBottom: 8 }}>DESTRUCTIVE ACTIONS</div>
          <div style={{ fontFamily: 'Newsreader, serif', fontSize: 14, color: theme.inkDim, fontStyle: 'italic' }}>
            All data lives in your Notion workspace. Delete records there directly. There is no "wipe data" button. This is intentional.
          </div>
        </div>
      </div>
    </div>
  );
}
