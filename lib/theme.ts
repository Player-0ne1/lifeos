// Design tokens — three atmospheric variants. Same skeleton, different climate.
// Ported from prototype theme.jsx

export type ThemeKey = 'vellum' | 'graphite' | 'paper';
export type VoiceKey = 'cold' | 'judicial' | 'oracular';
export type DensityKey = 'comfortable' | 'dense';

export interface Theme {
  name: string;
  bg: string;
  surface: string;
  surface2: string;
  rule: string;
  rule2: string;
  ink: string;
  inkDim: string;
  inkMute: string;
  inkFaint: string;
  accent: string;
  accentDim: string;
  warn: string;
  danger: string;
  good: string;
  stamp: string;
  cardBorder: string;
  cardShadow: string;
  stat: Record<string, string>;
}

export const THEMES: Record<ThemeKey, Theme> = {
  vellum: {
    name: 'Vellum',
    bg:        '#17140f',
    surface:   '#1d1914',
    surface2:  '#252019',
    rule:      '#3a3127',
    rule2:     '#2a2419',
    ink:       '#f0e6d2',
    inkDim:    '#b8a98a',
    inkMute:   '#6e6353',
    inkFaint:  '#4a4136',
    accent:    '#b8862e',
    accentDim: '#8b6624',
    warn:      '#c9763e',
    danger:    '#a8482d',
    good:      '#9aa07a',
    stamp:     '#7a1c1c',
    cardBorder: 'rgba(240,230,210,0.08)',
    cardShadow: '0 1px 0 rgba(255,255,255,0.02) inset',
    stat: {
      CRAFT:   '#c8956a',
      BUILDER: '#a8946a',
      CAPITAL: '#c4a05a',
      BODY:    '#b07560',
      MIND:    '#8a9572',
      SIGNAL:  '#6f8995',
      ART:     '#9c759c',
    },
  },
  graphite: {
    name: 'Graphite',
    bg:        '#0e0f10',
    surface:   '#15171a',
    surface2:  '#1c1f23',
    rule:      '#2a2e34',
    rule2:     '#1e2126',
    ink:       '#e8e9eb',
    inkDim:    '#9aa0a9',
    inkMute:   '#5e6470',
    inkFaint:  '#3e434c',
    accent:    '#aab1bd',
    accentDim: '#7d838d',
    warn:      '#b88c4e',
    danger:    '#a64a3a',
    good:      '#8a9b8a',
    stamp:     '#933131',
    cardBorder: 'rgba(220,225,232,0.07)',
    cardShadow: '0 1px 0 rgba(255,255,255,0.02) inset',
    stat: {
      CRAFT:   '#b5b0a0',
      BUILDER: '#a0a4a8',
      CAPITAL: '#c2b18c',
      BODY:    '#b08070',
      MIND:    '#8e9c8e',
      SIGNAL:  '#7d8e98',
      ART:     '#9d8aa0',
    },
  },
  paper: {
    name: 'Paper',
    bg:        '#f1ece1',
    surface:   '#e9e3d4',
    surface2:  '#e0d8c5',
    rule:      '#9c8d75',
    rule2:     '#c2b59c',
    ink:       '#1c1812',
    inkDim:    '#4a4136',
    inkMute:   '#766c5a',
    inkFaint:  '#b0a48c',
    accent:    '#7a1c1c',
    accentDim: '#5a1414',
    warn:      '#8b4a1c',
    danger:    '#7a1c1c',
    good:      '#3e5238',
    stamp:     '#7a1c1c',
    cardBorder: 'rgba(28,24,18,0.12)',
    cardShadow: '0 1px 0 rgba(255,255,255,0.4) inset',
    stat: {
      CRAFT:   '#8b5e2e',
      BUILDER: '#6e5a32',
      CAPITAL: '#7a5e1c',
      BODY:    '#8a3e2a',
      MIND:    '#4a5a32',
      SIGNAL:  '#2e4a5e',
      ART:     '#6e3a6e',
    },
  },
};

export interface Density {
  name: string;
  padCard: number;
  padScreen: number;
  rowHeight: number;
  fontBody: number;
  fontMeta: number;
  fontHead: number;
  fontDisplay: number;
  gap: number;
}

export const DENSITY: Record<DensityKey, Density> = {
  comfortable: {
    name: 'Comfortable',
    padCard: 18,
    padScreen: 22,
    rowHeight: 52,
    fontBody: 14,
    fontMeta: 11,
    fontHead: 22,
    fontDisplay: 40,
    gap: 14,
  },
  dense: {
    name: 'Ledger-dense',
    padCard: 12,
    padScreen: 16,
    rowHeight: 40,
    fontBody: 13,
    fontMeta: 10.5,
    fontHead: 19,
    fontDisplay: 36,
    gap: 10,
  },
};

export interface Voice {
  name: string;
  appName: string;
  appSub: string;
  morningGreeting: (day: number) => string;
  afterCheckin: (energy: number) => string;
  directiveNote: () => string;
  questCTA: string;
  completeCTA: string;
  failCTA: string;
  abandonConfirm: string;
  allComplete: string;
  partialMsg: (n: number) => string;
  failureBanner: (date: string | number) => string;
  sundayOpen: string;
  sundayPenalty: (rs: number) => string;
  pillarLock: (n: number) => string;
  decayWarn: (stat: string, days: number) => string;
  onboardingHook: string;
}

export const VOICE: Record<VoiceKey, Voice> = {
  cold: {
    name: 'Cold',
    appName: 'THE SYSTEM',
    appSub: 'Sovereign Polymath Protocol',
    morningGreeting: (day) => `Day ${day}. Input required.`,
    afterCheckin: (energy) =>
      energy <= 2
        ? `Energy: ${energy}. The directive adjusts. The deadline does not.`
        : energy === 3
        ? `Energy: ${energy}. The System has read your state.`
        : `Energy: ${energy}. There is no excuse coded for this energy level.`,
    directiveNote: () =>
      `Yesterday you closed two of three. SIGNAL has not moved in 13 days. This is not a coincidence; it is a choice. Today corrects it.`,
    questCTA: 'EXECUTE',
    completeCTA: 'COMPLETE',
    failCTA: 'ABANDON',
    abandonConfirm:
      'This logs a failure. Penalty Dungeon queues for tomorrow. The arc pauses. No appeal.',
    allComplete: 'DAY COMPLETE',
    partialMsg: (n) => `${n} of 3. The remainder counts as failure.`,
    failureBanner: (date) =>
      `Day ${date} closed with default. Penalty Dungeon active. Arc frozen until cleared.`,
    sundayOpen: 'WEEK CLOSE · LEDGER OPEN',
    sundayPenalty: (rs) =>
      rs === 0
        ? 'No transfer owed. Clean week.'
        : `Transfer Rs. ${rs.toLocaleString('en-IN')} to Dad. Mom verifies.`,
    pillarLock: (n) => `${n} of 3 pillars closed. Monarch Mode awaits the rest.`,
    decayWarn: (stat, days) => `${stat} dormant for ${days} days. Decay imminent.`,
    onboardingHook:
      'You are about to sign a contract with a system designed for a person you are not yet.',
  },
  judicial: {
    name: 'Judicial',
    appName: 'THE SYSTEM',
    appSub: 'A Personal Operating Contract',
    morningGreeting: (day) => `Day ${day}, hour seven. You are under contract.`,
    afterCheckin: (energy) =>
      energy <= 2
        ? `Energy reported at ${energy}. The obligations are adjusted under clause 4.2; the deadline stands.`
        : `Energy reported at ${energy}. Obligations proceed without amendment.`,
    directiveNote: () =>
      `The record reflects two completions and one default on Day 13. SIGNAL has shown no activity for 13 days. The court takes note.`,
    questCTA: 'ACCEPT',
    completeCTA: 'FILE PROOF',
    failCTA: 'DEFAULT',
    abandonConfirm:
      'Default will be entered into the docket. Penalty proceedings open tomorrow. No appeal lies.',
    allComplete: 'OBLIGATIONS DISCHARGED',
    partialMsg: (n) => `${n} of 3 discharged. Remainder enters default.`,
    failureBanner: (date) =>
      `Default entered on Day ${date}. Penalty Dungeon convened. Arc proceedings stayed.`,
    sundayOpen: 'WEEK CLOSURE PROCEEDING',
    sundayPenalty: (rs) =>
      rs === 0
        ? 'No penalty assessed.'
        : `Transfer of Rs. ${rs.toLocaleString('en-IN')} ordered to recipient. Referee to witness.`,
    pillarLock: (n) => `${n} of 3 conditions fulfilled. Monarch status withheld.`,
    decayWarn: (stat, days) => `${stat} inactive ${days} days. Decay clause engages.`,
    onboardingHook:
      'You are about to execute a binding instrument. Read what follows as you would a contract you cannot escape.',
  },
  oracular: {
    name: 'Oracular',
    appName: 'THE SYSTEM',
    appSub: 'It has read your state',
    morningGreeting: (day) => `Day ${day}. The morning is open.`,
    afterCheckin: (energy) =>
      energy <= 2
        ? `Energy of ${energy}. The path is narrower today. The destination unchanged.`
        : `Energy of ${energy}. The road accepts what you bring.`,
    directiveNote: () =>
      `Yesterday two thresholds were crossed and one was not. The thread of SIGNAL has gone slack thirteen days. Today you take it up again.`,
    questCTA: 'TAKE UP',
    completeCTA: 'OFFER PROOF',
    failCTA: 'RELINQUISH',
    abandonConfirm: 'The thread is set down. Tomorrow asks more of you. The arc waits.',
    allComplete: 'THE DAY IS CLOSED',
    partialMsg: (n) => `${n} of three. The rest is left undone.`,
    failureBanner: (date) =>
      `Day ${date} ended unclean. The dungeon opens. The arc holds its breath.`,
    sundayOpen: 'THE WEEK IS BEING SEALED',
    sundayPenalty: (rs) =>
      rs === 0
        ? 'Nothing is owed.'
        : `Rs. ${rs.toLocaleString('en-IN')} passes from your hand to your father’s. Your mother stands as witness.`,
    pillarLock: (n) =>
      `${n} of three pillars stand closed. The Monarch waits behind the others.`,
    decayWarn: (stat, days) => `${stat} has gone untouched ${days} days. The room grows cold.`,
    onboardingHook:
      'What follows is a contract written for a person you have not yet become.',
  },
};

export const STATS = ['CRAFT', 'BUILDER', 'CAPITAL', 'BODY', 'MIND', 'SIGNAL', 'ART'] as const;
export type Stat = (typeof STATS)[number];

export const STAT_DESC: Record<Stat, string> = {
  CRAFT:   'Writing, content, editorial standard',
  BUILDER: 'Entrepreneurial execution. Shipped work.',
  CAPITAL: 'Financial discipline. Corpus progress.',
  BODY:    'Physical condition. Multiplies all else.',
  MIND:    'Depth of reasoning. Signal over noise.',
  SIGNAL:  'Network density. Strategic relationships.',
  ART:     'Creative pursuits with no commercial floor.',
};

/** Convert a Theme object to CSS custom properties string for injection. */
export function themeToCssVars(theme: Theme): Record<string, string> {
  return {
    '--ls-bg':         theme.bg,
    '--ls-surface':    theme.surface,
    '--ls-surface2':   theme.surface2,
    '--ls-rule':       theme.rule,
    '--ls-rule2':      theme.rule2,
    '--ls-ink':        theme.ink,
    '--ls-ink-dim':    theme.inkDim,
    '--ls-ink-mute':   theme.inkMute,
    '--ls-ink-faint':  theme.inkFaint,
    '--ls-accent':     theme.accent,
    '--ls-accent-dim': theme.accentDim,
    '--ls-warn':       theme.warn,
    '--ls-danger':     theme.danger,
    '--ls-good':       theme.good,
    '--ls-stamp':      theme.stamp,
    ...Object.entries(theme.stat).reduce((acc, [k, v]) => {
      acc[`--ls-stat-${k.toLowerCase()}`] = v;
      return acc;
    }, {} as Record<string, string>),
  };
}
