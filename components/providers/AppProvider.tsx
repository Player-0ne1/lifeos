'use client';
import { createContext, useContext, useState, useMemo, useCallback, type ReactNode } from 'react';
import { THEMES, VOICE, DENSITY, type Theme, type Voice, type Density, type ThemeKey, type VoiceKey, type DensityKey } from '@/lib/theme';

export type DayState = 'onboarding' | 'pre-checkin' | 'mid-day' | 'evening' | 'all-complete' | 'failed';
export type OverlayKind = 'morning' | 'evening' | 'proof' | 'fail-confirm' | 'sunday';

export interface OverlayState {
  kind: OverlayKind;
  questId?: string;
}

export interface AppContextType {
  theme: Theme;
  themeKey: ThemeKey;
  setThemeKey: (k: ThemeKey) => void;
  voice: Voice;
  voiceKey: VoiceKey;
  setVoiceKey: (k: VoiceKey) => void;
  density: Density;
  densityKey: DensityKey;
  setDensityKey: (k: DensityKey) => void;
  dayState: DayState;
  setDayState: (s: DayState) => void;
  overlay: OverlayState | null;
  setOverlay: (o: OverlayState | null) => void;
  flash: 'invert' | null;
  setFlash: (f: 'invert' | null) => void;
  tab: string;
  setTab: (t: string) => void;
}

const AppCtx = createContext<AppContextType | null>(null);

export function useApp(): AppContextType {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

interface Props {
  children: ReactNode;
  initialTheme?: ThemeKey;
  initialVoice?: VoiceKey;
  initialDensity?: DensityKey;
  initialDayState?: DayState;
  initialTab?: string;
}

export function AppProvider({
  children,
  initialTheme = 'vellum',
  initialVoice = 'cold',
  initialDensity = 'comfortable',
  initialDayState = 'pre-checkin',
  initialTab = 'directive',
}: Props) {
  const [themeKey, setThemeKeyState] = useState<ThemeKey>(initialTheme);
  const [voiceKey, setVoiceKeyState] = useState<VoiceKey>(initialVoice);
  const [densityKey, setDensityKeyState] = useState<DensityKey>(initialDensity);
  const [dayState, setDayStateState] = useState<DayState>(initialDayState);
  const [overlay, setOverlay] = useState<OverlayState | null>(null);
  const [flash, setFlash] = useState<'invert' | null>(null);
  const [tab, setTab] = useState<string>(initialTab);

  const setThemeKey = useCallback((k: ThemeKey) => {
    setThemeKeyState(k);
    document.cookie = `ls-theme=${k};path=/;max-age=${365 * 24 * 3600}`;
    const t = THEMES[k];
    if (t) {
      const root = document.documentElement;
      root.style.setProperty('--ls-bg', t.bg);
      root.style.setProperty('--ls-surface', t.surface);
      root.style.setProperty('--ls-surface2', t.surface2);
      root.style.setProperty('--ls-rule', t.rule);
      root.style.setProperty('--ls-rule2', t.rule2);
      root.style.setProperty('--ls-ink', t.ink);
      root.style.setProperty('--ls-ink-dim', t.inkDim);
      root.style.setProperty('--ls-ink-mute', t.inkMute);
      root.style.setProperty('--ls-ink-faint', t.inkFaint);
      root.style.setProperty('--ls-accent', t.accent);
      root.style.setProperty('--ls-accent-dim', t.accentDim);
      root.style.setProperty('--ls-warn', t.warn);
      root.style.setProperty('--ls-danger', t.danger);
      root.style.setProperty('--ls-good', t.good);
      root.style.setProperty('--ls-stamp', t.stamp);
      Object.entries(t.stat).forEach(([statKey, v]) => {
        root.style.setProperty(`--ls-stat-${statKey.toLowerCase()}`, v);
      });
    }
  }, []);

  const setDensityKey = useCallback((k: DensityKey) => {
    setDensityKeyState(k);
    document.cookie = `ls-density=${k};path=/;max-age=${365 * 24 * 3600}`;
  }, []);

  const setVoiceKey = useCallback((k: VoiceKey) => {
    setVoiceKeyState(k);
    document.cookie = `ls-voice=${k};path=/;max-age=${365 * 24 * 3600}`;
  }, []);

  const setDayState = useCallback((s: DayState) => {
    setDayStateState(s);
  }, []);

  const value = useMemo(
    () => ({
      theme: THEMES[themeKey] ?? THEMES.vellum,
      themeKey,
      setThemeKey,
      voice: VOICE[voiceKey] ?? VOICE.cold,
      voiceKey,
      setVoiceKey,
      density: DENSITY[densityKey] ?? DENSITY.comfortable,
      densityKey,
      setDensityKey,
      dayState,
      setDayState,
      overlay,
      setOverlay,
      flash,
      setFlash,
      tab,
      setTab,
    }),
    [
      themeKey, voiceKey, densityKey, dayState, overlay, flash, tab,
      setThemeKey, setVoiceKey, setDensityKey, setDayState,
    ],
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
