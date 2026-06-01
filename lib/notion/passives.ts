import { getNotionClient } from './client';
import { DB } from './databases';
import type { PassiveHabit, PassiveStatus, Stat } from './types';

// ─── Notion property extractor ────────────────────────────────────────────────

function prop(page: any, name: string, type: string): any {
  const p = page.properties?.[name];
  if (!p) return null;
  if (type === 'title') return p.title?.[0]?.plain_text ?? '';
  if (type === 'number') return p.number ?? 0;
  if (type === 'number_or_null') return p.number ?? null;
  if (type === 'rich_text') return p.rich_text?.[0]?.plain_text ?? '';
  if (type === 'select') return p.select?.name ?? '';
  return null;
}

// ─── Mapper ───────────────────────────────────────────────────────────────────

function mapPassive(page: any): PassiveHabit {
  return {
    id: page.id,
    title: prop(page, 'Title', 'title'),
    stat: prop(page, 'Stat', 'select') as Stat,
    completionCount: prop(page, 'Completion Count', 'number'),
    status: prop(page, 'Status', 'select') as PassiveStatus,
    streakDays: prop(page, 'Streak Days', 'number'),
    dailyXp: prop(page, 'Daily XP', 'number_or_null') ?? undefined,
    lapsedDays: prop(page, 'Lapsed Days', 'number_or_null') ?? undefined,
  };
}

// ─── Query functions ──────────────────────────────────────────────────────────

export async function getPassives(statusFilter?: PassiveStatus): Promise<PassiveHabit[]> {
  const notion = getNotionClient();

  const queryParams: any = {
    database_id: DB.PASSIVE_LIBRARY,
    sorts: [{ property: 'Title', direction: 'ascending' }],
    page_size: 100,
  };

  if (statusFilter) {
    queryParams.filter = {
      property: 'Status',
      select: { equals: statusFilter },
    };
  }

  const res = await notion.databases.query(queryParams);

  return res.results
    .filter((page) => page.object === 'page')
    .map(mapPassive);
}

export async function updatePassiveStatus(
  id: string,
  updates: Partial<Pick<PassiveHabit, 'status' | 'streakDays' | 'lapsedDays' | 'dailyXp' | 'completionCount'>>
): Promise<void> {
  const notion = getNotionClient();
  const properties: Record<string, any> = {};

  if (updates.status !== undefined) {
    properties['Status'] = { select: { name: updates.status } };
  }
  if (updates.streakDays !== undefined) {
    properties['Streak Days'] = { number: updates.streakDays };
  }
  if (updates.lapsedDays !== undefined) {
    properties['Lapsed Days'] = { number: updates.lapsedDays };
  }
  if (updates.dailyXp !== undefined) {
    properties['Daily XP'] = { number: updates.dailyXp };
  }
  if (updates.completionCount !== undefined) {
    properties['Completion Count'] = { number: updates.completionCount };
  }

  await notion.pages.update({ page_id: id, properties });
}

export async function incrementPassiveCount(id: string): Promise<void> {
  const notion = getNotionClient();

  // Fetch the current page to read the existing count
  const page = await notion.pages.retrieve({ page_id: id });
  const current = mapPassive(page);

  await notion.pages.update({
    page_id: id,
    properties: {
      'Completion Count': { number: current.completionCount + 1 },
    },
  });
}
