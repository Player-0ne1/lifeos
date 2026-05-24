// state.jsx — Shared app state for LifeOS.
// One source of truth; phone + desktop both render the same state.

const { createContext, useContext, useState, useReducer, useMemo, useCallback, useEffect, useRef } = React;

// ── Seed data ────────────────────────────────────────────────────────────────
// "Real arc names, anonymized numbers" — One is shown as "ONE" in the UI;
// number scales kept honest but specific values are stylized.

const STATS = ['CRAFT','BUILDER','CAPITAL','BODY','MIND','SIGNAL','ART'];

const STAT_DESC = {
  CRAFT:   'Writing, content, editorial standard',
  BUILDER: 'Entrepreneurial execution. Shipped work.',
  CAPITAL: 'Financial discipline. Corpus progress.',
  BODY:    'Physical condition. Multiplies all else.',
  MIND:    'Depth of reasoning. Signal over noise.',
  SIGNAL:  'Network density. Strategic relationships.',
  ART:     'Creative pursuits with no commercial floor.',
};

const SEED_QUESTS = [
  {
    id: 'q1',
    stat: 'CRAFT',
    title: 'Draft 600 words on the Graham margin-of-safety framework.',
    brief: 'Substack format. Plain prose. Argue the case for valuing what you can already prove. The world does not require this essay. You do.',
    difficulty: 'Medium',
    xp: 40,
    points: 2,
    proofType: 'Text paste',
    proofStandard: 'Paste \u2265 600 words into the Quest Log. Word count enforced.',
    deadline: '22:00 IST',
    isArc: false,
    state: 'open',
  },
  {
    id: 'q2',
    stat: 'BUILDER',
    title: 'Send one PickleJam pitch to a prospective customer.',
    brief: 'Cold outreach to one (1) named operator who fits the ICP. Personalised. Not a template. Screenshot the sent message before 22:00.',
    difficulty: 'Hard',
    xp: 60,
    points: 3,
    proofType: 'Screenshot',
    proofStandard: 'Sent-message screenshot from Gmail or LinkedIn. Recipient name visible. Timestamp visible.',
    deadline: '22:00 IST',
    isArc: true,
    arcName: 'PickleJam · First Sale',
    state: 'open',
  },
  {
    id: 'q3',
    stat: 'BODY',
    title: 'Run 5K. Sub 32:00.',
    brief: 'Outdoor or treadmill. Phase 1 of the GT Cup arc requires the base. Photograph the watch.',
    difficulty: 'Medium',
    xp: 40,
    points: 2,
    proofType: 'Health screenshot',
    proofStandard: 'Garmin / Apple Health / Strava screenshot. Distance \u2265 5.00 km. Today\u2019s date.',
    deadline: '22:00 IST',
    isArc: false,
    state: 'open',
  },
  {
    id: 'q4',
    stat: 'SIGNAL',
    title: 'Reach out to one GT Cup alumnus on LinkedIn.',
    brief: 'Bonus. Optional. Move SIGNAL by one. Choose someone whose name you already know.',
    difficulty: 'Easy',
    xp: 20,
    points: 1,
    proofType: 'Screenshot',
    proofStandard: 'Screenshot of the sent message.',
    deadline: '22:00 IST',
    isArc: false,
    isBonus: true,
    state: 'open',
  },
];

const SEED_PILLARS = {
  corpus:     { label: 'Rs. 2 Crore Corpus',         current: 8.4,  target: 100, unit: '%',  status: 'building' },
  consulting: { label: 'First Consulting Engagement',current: 0,    target: 1,   unit: 'signed', status: 'open' },
  livingWork: { label: 'Living Work (PickleJam / Substack)', current: 12, target: 100, unit: '%', status: 'building' },
};

const SEED_ARC = {
  id: 'arc-picklejam-1',
  title: 'PickleJam: First Sale',
  stat: 'BUILDER',
  dayElapsed: 14,
  dayTotal: 30,
  percent: 38,
  paceRequired: 4.4,
  pace: 'behind',
  successCondition: 'One paying customer. Not a friend. Not a sample.',
};

const SEED_GT = {
  phase: 1,
  phaseName: 'Foundation',
  fund: 27800,
  fundTarget: 250000,
  fiveK: '34:12',
  fiveKTarget: '28:00',
  trainingDays: 8,
  trackDays: 0,
  contacts: 2,
  registrationOpens: 'April 2027',
  gear: {
    Suit: 'Needed', Helmet: 'Owned', Boots: 'Needed', Gloves: 'Needed', 'Neck Brace': 'Needed',
  },
};

const SEED_WEEK = {
  number: 4,
  range: '02\u201308 Jun 2026',
  assigned: 21,   // 3 mandatory * 7 days
  complete: 16,
  failed: 3,
  pending: 2,
  bonusComplete: 4,
  xp: 720,
  rate: 76,       // 16 / 21 -> 76.2%
};

const SEED_PASSIVES = {
  active: [
    { name: 'Daily 5K base', stat: 'BODY', count: 26, daily: 0.5 },
    { name: 'Morning pages', stat: 'CRAFT', count: 22, daily: 0.3 },
  ],
  building: [
    { name: 'No phone before 9am', stat: 'MIND', count: 14 },
    { name: 'Weekly portfolio review', stat: 'CAPITAL', count: 9 },
    { name: 'One outreach per day', stat: 'SIGNAL', count: 6 },
  ],
  broken: [
    { name: 'Daily ink marbling sketch', stat: 'ART', lapsedDays: 21 },
  ],
};

const SEED_FINANCIAL = [
  { id:'f1', dt:'08 Jun 2026', dir:'in',  cat:'Salary',         amt: 142000, note:'Elior India' },
  { id:'f2', dt:'08 Jun 2026', dir:'out', cat:'GT Cup Fund',    amt: 25000,  note:'Monthly transfer' },
  { id:'f3', dt:'06 Jun 2026', dir:'out', cat:'Investment',     amt: 40000,  note:'Index fund SIP' },
  { id:'f4', dt:'05 Jun 2026', dir:'out', cat:'Rent',           amt: 38000,  note:'June' },
  { id:'f5', dt:'04 Jun 2026', dir:'out', cat:'Food',           amt: 4200,   note:'Groceries + meals' },
  { id:'f6', dt:'03 Jun 2026', dir:'in',  cat:'Freelance',      amt: 22000,  note:'Substack tip jar' },
  { id:'f7', dt:'02 Jun 2026', dir:'out', cat:'Food',           amt: 1800,   note:'Dinner out' },
  { id:'f8', dt:'01 Jun 2026', dir:'out', cat:'GT Cup Fund',    amt: 5000,   note:'Top-up' },
];

const SEED_PENALTIES = [
  { week: 2, date: '24 May 2026', amount: 2500, note: 'Two missed mandatory quests.' },
  { week: 3, date: '31 May 2026', amount: 0,    note: 'Clean week.' },
];

const SEED_PAST_WEEKS = [
  { number: 1, range:'12\u201318 May 2026', rate: 95, penalty: 0,    status: 'Clean' },
  { number: 2, range:'19\u201325 May 2026', rate: 81, penalty: 2500, status: 'Partial' },
  { number: 3, range:'26 May\u201301 Jun 2026', rate: 92, penalty: 0, status: 'Clean' },
];

const SEED_QUEST_LOG = [
  // A few past entries for the log screen
  { id:'qh1', day: 13, dt:'13 Jun', stat:'CRAFT',   title:'200-word weekly observation note', status:'complete', xp:20 },
  { id:'qh2', day: 13, dt:'13 Jun', stat:'BUILDER', title:'PickleJam supplier follow-up',     status:'complete', xp:40 },
  { id:'qh3', day: 13, dt:'13 Jun', stat:'SIGNAL',  title:'Comment thoughtfully on 3 posts',  status:'failed',   xp:0  },
  { id:'qh4', day: 12, dt:'12 Jun', stat:'BODY',    title:'4K morning run',                   status:'complete', xp:20 },
  { id:'qh5', day: 12, dt:'12 Jun', stat:'MIND',    title:'30 pages of Twist of the Wrist',   status:'complete', xp:40 },
  { id:'qh6', day: 12, dt:'12 Jun', stat:'CAPITAL', title:'Log all expenses since Sunday',    status:'complete', xp:20 },
  { id:'qh7', day: 11, dt:'11 Jun', stat:'CRAFT',   title:'Edit Friday\u2019s Substack draft', status:'complete', xp:40 },
  { id:'qh8', day: 11, dt:'11 Jun', stat:'BODY',    title:'5K outdoor run sub-33',             status:'failed',   xp:0  },
];

const SEED_LIBRARY = [
  { stat:'CRAFT',   difficulty:'Easy',   title:'Write 200 words on today\u2019s observation',         xp:20, time:'20 min', energy:'Low' },
  { stat:'CRAFT',   difficulty:'Medium', title:'600-word essay (Substack-ready)',                      xp:40, time:'60 min', energy:'Medium' },
  { stat:'CRAFT',   difficulty:'Hard',   title:'Publish a full piece (\u22651000 words)',              xp:60, time:'120 min', energy:'High' },
  { stat:'BUILDER', difficulty:'Easy',   title:'Update one PickleJam asset',                           xp:20, time:'20 min', energy:'Low' },
  { stat:'BUILDER', difficulty:'Medium', title:'One cold outreach pitch sent',                         xp:40, time:'45 min', energy:'Medium' },
  { stat:'BUILDER', difficulty:'Hard',   title:'Close a sales conversation. Yes or no.',               xp:60, time:'90 min', energy:'High' },
  { stat:'CAPITAL', difficulty:'Easy',   title:'Log today\u2019s expenses',                            xp:20, time:'10 min', energy:'Low' },
  { stat:'CAPITAL', difficulty:'Medium', title:'Reconcile the Financial Log',                          xp:40, time:'45 min', energy:'Medium' },
  { stat:'CAPITAL', difficulty:'Hard',   title:'Monthly portfolio audit (Graham framework)',           xp:60, time:'120 min', energy:'High' },
  { stat:'BODY',    difficulty:'Easy',   title:'30-minute walk',                                       xp:20, time:'30 min', energy:'Low' },
  { stat:'BODY',    difficulty:'Medium', title:'5K run sub-target',                                    xp:40, time:'60 min', energy:'Medium' },
  { stat:'BODY',    difficulty:'Hard',   title:'10K run',                                              xp:60, time:'90 min', energy:'High' },
  { stat:'MIND',    difficulty:'Easy',   title:'Read 20 pages',                                        xp:20, time:'30 min', energy:'Low' },
  { stat:'MIND',    difficulty:'Medium', title:'Write a 400-word reflection on what you read',         xp:40, time:'45 min', energy:'Medium' },
  { stat:'SIGNAL',  difficulty:'Easy',   title:'Comment thoughtfully on 3 posts in your field',        xp:20, time:'15 min', energy:'Low' },
  { stat:'SIGNAL',  difficulty:'Medium', title:'Send one cold DM with reason',                         xp:40, time:'30 min', energy:'Medium' },
  { stat:'SIGNAL',  difficulty:'Hard',   title:'Schedule a real call with someone you have not met',   xp:60, time:'60 min', energy:'High' },
  { stat:'ART',     difficulty:'Easy',   title:'15 minutes of ink marbling',                           xp:20, time:'15 min', energy:'Low' },
  { stat:'ART',     difficulty:'Medium', title:'Build a 30-minute DJ mix outline',                     xp:40, time:'60 min', energy:'Medium' },
];

const SEED_SKILLS = [
  // CRAFT 4
  { stat:'CRAFT',   tier:1, name:'The Sharpener',   req:30, status:'active',      desc:'Weekly single-sentence writing observation from the System.' },
  { stat:'CRAFT',   tier:2, name:'The Baseline Method', req:50, status:'locked', desc:'Monthly dual-format rewrite of your strongest piece.' },
  { stat:'CRAFT',   tier:3, name:'The Ghost',       req:70, status:'locked',     desc:'Full draft generation on demand from bullet notes.' },
  { stat:'CRAFT',   tier:4, name:'The Canon',       req:90, status:'locked',     desc:'Quarterly curation of your ten strongest works.' },
  // BUILDER 4
  { stat:'BUILDER', tier:1, name:'The Scoper',      req:30, status:'locked',     desc:'Post-meeting scope document generated from notes.' },
  { stat:'BUILDER', tier:2, name:'Contractor Mode', req:50, status:'locked',     desc:'Three weekly consulting outreach drafts in your voice.' },
  { stat:'BUILDER', tier:3, name:'The Operator',    req:70, status:'locked',     desc:'Weekly auto-updated project dashboard.' },
  { stat:'BUILDER', tier:4, name:'The Portfolio',   req:90, status:'locked',     desc:'Living consulting deck self-updates from system data.' },
  // CAPITAL
  { stat:'CAPITAL', tier:1, name:'The Ledger',      req:30, status:'locked',     desc:'Monthly P&L summary auto-generated.' },
  { stat:'CAPITAL', tier:2, name:'The Graham Lens', req:50, status:'locked',     desc:'Monthly portfolio audit against margin-of-safety.' },
  { stat:'CAPITAL', tier:3, name:'\u2014',          req:70, status:'locked',     desc:'Reserved.' },
  { stat:'CAPITAL', tier:4, name:'\u2014',          req:90, status:'locked',     desc:'Reserved.' },
  // BODY
  { stat:'BODY',    tier:1, name:'\u2014',          req:30, status:'locked',     desc:'Reserved.' },
  { stat:'BODY',    tier:2, name:'\u2014',          req:50, status:'locked',     desc:'Reserved.' },
  { stat:'BODY',    tier:3, name:'\u2014',          req:70, status:'locked',     desc:'Reserved.' },
  { stat:'BODY',    tier:4, name:'\u2014',          req:90, status:'locked',     desc:'Reserved.' },
  // MIND
  { stat:'MIND',    tier:1, name:'\u2014',          req:30, status:'locked',     desc:'Reserved.' },
  { stat:'MIND',    tier:2, name:'\u2014',          req:50, status:'locked',     desc:'Reserved.' },
  { stat:'MIND',    tier:3, name:'\u2014',          req:70, status:'locked',     desc:'Reserved.' },
  { stat:'MIND',    tier:4, name:'\u2014',          req:90, status:'locked',     desc:'Reserved.' },
  // SIGNAL
  { stat:'SIGNAL',  tier:1, name:'The Spotter',     req:30, status:'locked',     desc:'Three weekly outreach targets with reason \u2014 names not categories.' },
  { stat:'SIGNAL',  tier:2, name:'The Drafter',     req:50, status:'locked',     desc:'Personalised outreach message drafted per Spotter target.' },
  { stat:'SIGNAL',  tier:3, name:'\u2014',          req:70, status:'locked',     desc:'Reserved.' },
  { stat:'SIGNAL',  tier:4, name:'\u2014',          req:90, status:'locked',     desc:'Reserved.' },
  // ART
  { stat:'ART',     tier:1, name:'\u2014',          req:30, status:'locked',     desc:'Reserved.' },
  { stat:'ART',     tier:2, name:'The Set',         req:50, status:'locked',     desc:'Monthly DJ set structure with transition cues.' },
  { stat:'ART',     tier:3, name:'\u2014',          req:70, status:'locked',     desc:'Reserved.' },
  { stat:'ART',     tier:4, name:'\u2014',          req:90, status:'locked',     desc:'Reserved.' },
];

const INITIAL_STATE = {
  player: { name: 'ONE', level: 4, totalXP: 1820, xpToNext: 675, day: 14, streak: 6, bestStreak: 11 },
  stats: { CRAFT: 32, BUILDER: 24, CAPITAL: 18, BODY: 28, MIND: 22, SIGNAL: 11, ART: 8 },
  decay: { CRAFT: 1, BUILDER: 0, CAPITAL: 4, BODY: 0, MIND: 2, SIGNAL: 13, ART: 21 },
  energy: 3,
  quests: SEED_QUESTS,
  pillars: SEED_PILLARS,
  arc: SEED_ARC,
  gt: SEED_GT,
  week: SEED_WEEK,
  passives: SEED_PASSIVES,
  financial: SEED_FINANCIAL,
  penalties: SEED_PENALTIES,
  pastWeeks: SEED_PAST_WEEKS,
  questLog: SEED_QUEST_LOG,
  library: SEED_LIBRARY,
  skills: SEED_SKILLS,
  // Yesterday — referenced by the "pre-checkin" banner
  yesterday: { complete: 2, failed: 1, penalty: 0 },
};

// ── Context ─────────────────────────────────────────────────────────────────

const AppCtx = createContext(null);

function AppProvider({ children, dayState, voice, theme, density, setDayState }) {
  const [data, setData] = useState(INITIAL_STATE);
  // route: which top-level tab is active; subroute: in-tab navigation
  const [route, setRoute] = useState({ tab: 'directive', sub: null, params: {} });
  // overlay: full-screen flows (morning, evening, proof, sunday, fail-confirm)
  const [overlay, setOverlay] = useState(null);
  const [flash, setFlash] = useState(null); // 'invert' | 'stamp' | null

  // Mirror dayState into quest states for visual demo.
  useEffect(() => {
    setData(d => {
      if (dayState === 'pre-checkin') {
        return { ...d, quests: d.quests.map(q => ({ ...q, state: 'open' })) };
      }
      if (dayState === 'mid-day') {
        return { ...d, quests: d.quests.map((q,i) => ({ ...q, state: i === 0 ? 'complete' : 'open' })) };
      }
      if (dayState === 'all-complete') {
        return { ...d, quests: d.quests.map(q => ({ ...q, state: q.isBonus ? 'open' : 'complete' })) };
      }
      if (dayState === 'failed') {
        return { ...d, quests: d.quests.map((q,i) => ({ ...q, state: i === 0 ? 'complete' : i === 2 ? 'failed' : 'open' })) };
      }
      return d;
    });
  }, [dayState]);

  // Actions ───────────────────────────────────────────────────────────────────
  const completeQuest = useCallback((id) => {
    setData(d => ({ ...d, quests: d.quests.map(q => q.id === id ? { ...q, state: 'complete' } : q) }));
  }, []);

  const failQuest = useCallback((id) => {
    setFlash('invert');
    setTimeout(() => setFlash(null), 1200);
    setData(d => ({ ...d, quests: d.quests.map(q => q.id === id ? { ...q, state: 'failed' } : q) }));
  }, []);

  const value = useMemo(() => ({
    data, setData,
    route, setRoute,
    overlay, setOverlay,
    flash, setFlash,
    completeQuest, failQuest,
    dayState, setDayState,
    voice: VOICE[voice] || VOICE.cold,
    theme: THEMES[theme] || THEMES.vellum,
    density: DENSITY[density] || DENSITY.comfortable,
    themeKey: theme,
    voiceKey: voice,
    densityKey: density,
  }), [data, route, overlay, flash, dayState, voice, theme, density, completeQuest, failQuest, setDayState]);

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

const useApp = () => useContext(AppCtx);

Object.assign(window, { AppProvider, AppCtx, useApp, STATS, STAT_DESC });
