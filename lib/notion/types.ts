// ─── Shared enums ────────────────────────────────────────────────────────────

export type Stat =
  | 'CRAFT'
  | 'BUILDER'
  | 'CAPITAL'
  | 'BODY'
  | 'MIND'
  | 'SIGNAL'
  | 'ART';

export const ALL_STATS: Stat[] = [
  'CRAFT',
  'BUILDER',
  'CAPITAL',
  'BODY',
  'MIND',
  'SIGNAL',
  'ART',
];

export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type EnergyLevel = 'Low' | 'Medium' | 'High';
export type QuestStatus = 'open' | 'complete' | 'failed' | 'abandoned';
export type CheckinStatus = 'pending' | 'active' | 'complete' | 'failed';
export type LedgerStatus = 'open' | 'closed';
export type PassiveStatus = 'active' | 'building' | 'broken';
export type ArcPace = 'on-track' | 'behind' | 'ahead';
export type ArcStatus = 'active' | 'complete' | 'paused';
export type SkillTier = 1 | 2 | 3 | 4;
export type SkillStatus = 'locked' | 'active' | 'unlocked';
export type FinancialType = 'income' | 'expense';

// ─── Player Profile ───────────────────────────────────────────────────────────

export interface PlayerProfile {
  /** Notion page ID */
  id: string;
  name: string;
  level: number;
  totalXP: number;
  xpToNext: number;
  /** Current game day number */
  day: number;
  streak: number;
  bestStreak: number;
}

// ─── Character Sheet ──────────────────────────────────────────────────────────

export interface CharacterStat {
  /** Notion page ID */
  id: string;
  stat: Stat;
  score: number;
  /** ISO date string */
  lastActive: string;
  decayDays: number;
}

// ─── Quest Log ────────────────────────────────────────────────────────────────

export interface Quest {
  /** Notion page ID */
  id: string;
  title: string;
  stat: Stat;
  xp: number;
  points: number;
  difficulty: Difficulty;
  status: QuestStatus;
  dayAssigned: number;
  proofType: string;
  proofStandard: string;
  proofText?: string;
  proofUrl?: string;
  isArc?: boolean;
  arcName?: string;
  isBonus?: boolean;
  /** ISO date string */
  deadline: string | null;
  brief: string;
}

// ─── Quest Library ────────────────────────────────────────────────────────────

export interface QuestTemplate {
  /** Notion page ID */
  id: string;
  title: string;
  stat: Stat;
  xpValue: number;
  difficulty: Difficulty;
  proofStandard: string;
  brief: string;
  timeEstimate: string;
  energyLevel: EnergyLevel;
}

// ─── Stat History Log ─────────────────────────────────────────────────────────

export interface StatHistoryEntry {
  /** Notion page ID */
  id: string;
  stat: Stat;
  score: number;
  /** ISO date string */
  date: string;
  delta: number;
  reason: string;
}

// ─── Daily Check-in Log ───────────────────────────────────────────────────────

export interface DailyCheckin {
  /** Notion page ID */
  id: string;
  /** ISO date string */
  date: string;
  /** 1–5 energy rating */
  energy: number;
  constraints: string;
  mindNote: string;
  directiveText?: string;
  /** Quest page IDs linked to this check-in */
  questIds: string[];
  /** Optional close-of-day energy rating */
  closeEnergy?: number;
  dayNote?: string;
  status: CheckinStatus;
}

// ─── Weekly Ledger ────────────────────────────────────────────────────────────

export interface WeeklyLedger {
  /** Notion page ID */
  id: string;
  weekNum: number;
  weekRange: string;
  questsCompleted: number;
  questsTotal: number;
  completionPct: number;
  penaltyAmount: number;
  xpEarned: number;
  status: LedgerStatus;
}

// ─── Penalty Log ──────────────────────────────────────────────────────────────

export interface Penalty {
  /** Notion page ID */
  id: string;
  weekNum: number;
  amount: number;
  reason: string;
  /** ISO date string — set when paid */
  paidDate?: string;
  upiRef?: string;
  isPaid: boolean;
}

// ─── Passive Library ──────────────────────────────────────────────────────────

export interface PassiveHabit {
  /** Notion page ID */
  id: string;
  title: string;
  stat: Stat;
  completionCount: number;
  status: PassiveStatus;
  streakDays: number;
  dailyXp?: number;
  lapsedDays?: number;
}

// ─── Arc Quest Tracker ────────────────────────────────────────────────────────

export interface ArcTracker {
  /** Notion page ID */
  id: string;
  title: string;
  stat: Stat;
  dayElapsed: number;
  dayTotal: number;
  completedQuests: number;
  totalQuests: number;
  percent: number;
  successCondition: string;
  pace: ArcPace;
  status: ArcStatus;
}

// ─── Skill Registry ───────────────────────────────────────────────────────────

export interface Skill {
  /** Notion page ID */
  id: string;
  name: string;
  stat: Stat;
  tier: SkillTier;
  scoreThreshold: number;
  status: SkillStatus;
  description: string;
  deliverable?: string;
}

// ─── Financial Log ────────────────────────────────────────────────────────────

export interface FinancialEntry {
  /** Notion page ID */
  id: string;
  /** ISO date string */
  date: string;
  type: FinancialType;
  amount: number;
  category: string;
  note: string;
}

// ─── Financial summary (computed, not stored in Notion) ──────────────────────

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  net: number;
  byCategory: Record<string, number>;
}
