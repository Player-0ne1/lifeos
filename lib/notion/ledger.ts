import { getNotionClient } from './client';
import { DB } from './databases';
import type { WeeklyLedger, LedgerStatus } from './types';

// ─── Notion property extractor ────────────────────────────────────────────────

function prop(page: any, name: string, type: string): any {
  const p = page.properties?.[name];
  if (!p) return null;
  if (type === 'title') return p.title?.[0]?.plain_text ?? '';
  if (type === 'number') return p.number ?? 0;
  if (type === 'rich_text') return p.rich_text?.[0]?.plain_text ?? '';
  if (type === 'select') return p.select?.name ?? '';
  if (type === 'date') return p.date?.start ?? null;
  return null;
}

// ─── Mapper ───────────────────────────────────────────────────────────────────

function mapLedger(page: any): WeeklyLedger {
  return {
    id: page.id,
    weekNum: prop(page, 'Week Num', 'number'),
    weekRange: prop(page, 'Week Range', 'rich_text'),
    questsCompleted: prop(page, 'Quests Completed', 'number'),
    questsTotal: prop(page, 'Quests Total', 'number'),
    completionPct: prop(page, 'Completion Pct', 'number'),
    penaltyAmount: prop(page, 'Penalty Amount', 'number'),
    xpEarned: prop(page, 'XP Earned', 'number'),
    status: prop(page, 'Status', 'select') as LedgerStatus,
  };
}

// ─── Query functions ──────────────────────────────────────────────────────────

export async function getCurrentWeekLedger(): Promise<WeeklyLedger | null> {
  const notion = getNotionClient();

  // Note: no sorts here — the 'Week Num' property does not exist in this DB schema.
  // The filter for Status='open' is sufficient since only one week is open at a time.
  const res = await notion.databases.query({
    database_id: DB.WEEKLY_LEDGER,
    filter: {
      property: 'Status',
      select: { equals: 'open' },
    },
    page_size: 1,
  });

  const page = res.results.find((p) => p.object === 'page');
  if (!page) return null;
  return mapLedger(page);
}

export async function getWeeklyHistory(limit: number = 12): Promise<WeeklyLedger[]> {
  const notion = getNotionClient();

  const res = await notion.databases.query({
    database_id: DB.WEEKLY_LEDGER,
    sorts: [{ property: 'Week Num', direction: 'descending' }],
    page_size: Math.min(limit, 100),
  });

  return res.results
    .filter((page) => page.object === 'page')
    .map(mapLedger);
}

export async function createOrUpdateWeekLedger(
  data: Omit<WeeklyLedger, 'id'>
): Promise<WeeklyLedger> {
  const notion = getNotionClient();

  // Check if a ledger for this week already exists
  const existing = await notion.databases.query({
    database_id: DB.WEEKLY_LEDGER,
    filter: {
      property: 'Week Num',
      number: { equals: data.weekNum },
    },
    page_size: 1,
  });

  const buildProperties = (): Record<string, any> => ({
    'Week Num': { number: data.weekNum },
    'Week Range': { rich_text: [{ text: { content: data.weekRange } }] },
    'Quests Completed': { number: data.questsCompleted },
    'Quests Total': { number: data.questsTotal },
    'Completion Pct': { number: data.completionPct },
    'Penalty Amount': { number: data.penaltyAmount },
    'XP Earned': { number: data.xpEarned },
    Status: { select: { name: data.status } },
  });

  const existingPage = existing.results.find((p) => p.object === 'page');

  if (existingPage) {
    await notion.pages.update({
      page_id: existingPage.id,
      properties: buildProperties(),
    });
    return mapLedger({ ...existingPage, properties: { ...((existingPage as any).properties ?? {}), ...buildProperties() } });
  }

  const page = await notion.pages.create({
    parent: { database_id: DB.WEEKLY_LEDGER },
    properties: buildProperties(),
  });

  return mapLedger(page);
}

export async function closeWeek(
  weekId: string,
  data: Partial<Pick<WeeklyLedger, 'questsCompleted' | 'questsTotal' | 'completionPct' | 'penaltyAmount' | 'xpEarned'>>
): Promise<void> {
  const notion = getNotionClient();

  const properties: Record<string, any> = {
    Status: { select: { name: 'closed' } },
  };

  if (data.questsCompleted !== undefined) {
    properties['Quests Completed'] = { number: data.questsCompleted };
  }
  if (data.questsTotal !== undefined) {
    properties['Quests Total'] = { number: data.questsTotal };
  }
  if (data.completionPct !== undefined) {
    properties['Completion Pct'] = { number: data.completionPct };
  }
  if (data.penaltyAmount !== undefined) {
    properties['Penalty Amount'] = { number: data.penaltyAmount };
  }
  if (data.xpEarned !== undefined) {
    properties['XP Earned'] = { number: data.xpEarned };
  }

  await notion.pages.update({ page_id: weekId, properties });
}
