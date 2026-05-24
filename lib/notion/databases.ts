// All 12 Notion database IDs from environment variables
export const DB = {
    PLAYER_PROFILE:   process.env.NOTION_PLAYER_PROFILE_DB!,
    CHARACTER_SHEET:  process.env.NOTION_CHARACTER_SHEET_DB!,
    QUEST_LOG:        process.env.NOTION_QUEST_LOG_DB!,
    QUEST_LIBRARY:    process.env.NOTION_QUEST_LIBRARY_DB!,
    STAT_HISTORY:     process.env.NOTION_STAT_HISTORY_DB!,
    CHECKIN_LOG:      process.env.NOTION_DAILY_CHECKIN_DB!,
    WEEKLY_LEDGER:    process.env.NOTION_WEEKLY_LEDGER_DB!,
    PENALTY_LOG:      process.env.NOTION_PENALTY_LOG_DB!,
    PASSIVE_LIBRARY:  process.env.NOTION_PASSIVE_LIBRARY_DB!,
    ARC_TRACKER:      process.env.NOTION_ARC_QUEST_DB!,
    SKILL_REGISTRY:   process.env.NOTION_SKILL_REGISTRY_DB!,
    FINANCIAL_LOG:    process.env.NOTION_FINANCIAL_LOG_DB!,
} as const;
