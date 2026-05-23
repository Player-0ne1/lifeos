// All 12 Notion database IDs from environment variables
export const DB = {
  PLAYER_PROFILE:  process.env.NOTION_DB_PLAYER_PROFILE!,
  CHARACTER_SHEET: process.env.NOTION_DB_CHARACTER_SHEET!,
  QUEST_LOG:       process.env.NOTION_DB_QUEST_LOG!,
  QUEST_LIBRARY:   process.env.NOTION_DB_QUEST_LIBRARY!,
  STAT_HISTORY:    process.env.NOTION_DB_STAT_HISTORY!,
  CHECKIN_LOG:     process.env.NOTION_DB_CHECKIN_LOG!,
  WEEKLY_LEDGER:   process.env.NOTION_DB_WEEKLY_LEDGER!,
  PENALTY_LOG:     process.env.NOTION_DB_PENALTY_LOG!,
  PASSIVE_LIBRARY: process.env.NOTION_DB_PASSIVE_LIBRARY!,
  ARC_TRACKER:     process.env.NOTION_DB_ARC_TRACKER!,
  SKILL_REGISTRY:  process.env.NOTION_DB_SKILL_REGISTRY!,
  FINANCIAL_LOG:   process.env.NOTION_DB_FINANCIAL_LOG!,
} as const;
