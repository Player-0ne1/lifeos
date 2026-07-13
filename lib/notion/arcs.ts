import { getNotionClient } from './client';
import { DB } from './databases';
import type { ArcTracker, ArcStatus, ArcPace, Stat } from './types';

// ─── Notion property extractor ────────────────────────────────────────────────

function prop(page: any, name: string, type: string): any {
  const p = page.properties?.[name];
  if (!p) return null;
  if (type === 'title') return p.title?.[0]?.plain_text ?? '';
  if (type === 'number') return p.number ?? 0;
  if (type === 'rich_text') return p.rich_text?.[0]?.plain_text ?? '';
  if (type === 'select') return p.select?.name ?? '';
  return null;
}

// ─── Mapper ───────────────────────────────────────────────────────────────────

function mapArc(page: any): ArcTracker {
  return {
    id: page.id,
    title: prop(page, 'Title', 'title'),
    stat: prop(page, 'Stat', 'select') as Stat,
    dayElapsed: prop(page, 'Day Elapsed', 'number'),
    dayTotal: prop(page, 'Day Total', 'number'),
    completedQuests: prop(page, 'Completed Quests', 'number'),
    totalQuests: prop(page, 'Total Quests', 'number'),
    percent: prop(page, 'Percent', 'number'),
    successCondition: prop(page, 'Success Condition', 'rich_text'),
    pace: prop(page, 'Pace', 'select') as ArcPace,
    status: prop(page, 'Status', 'select') as ArcStatus,
  };
}

// ─── Query functions ──────────────────────────────────────────────────────────

export async function getActiveArc(): Promise<ArcTracker | null> {
  const notion = getNotionClient();

  // Note: no sorts here — 'Day Elapsed' is not a direct property in this DB schema.
  // The filter for Status='active' is sufficient since only one arc is active at a time.
  const res = await notion.databases.query({
    database_id: DB.ARC_TRACKER,
    filter: {
      property: 'Status',
      select: { equals: 'active' },
    },
    page_size: 1,
  });

  const page = res.results.find((p) => p.object === 'page');
  if (!page) return null;
  return mapArc(page);
}

export async function getAllArcs(): Promise<ArcTracker[]> {
  const notion = getNotionClient();

  const res = await notion.databases.query({
    database_id: DB.ARC_TRACKER,
    sorts: [{ property: 'Status', direction: 'ascending' }],
    page_size: 100,
  });

  return res.results
    .filter((page) => page.object === 'page')
    .map(mapArc);
}

export async function updateArcProgress(
  id: string,
  updates: Partial<Pick<ArcTracker, 'dayElapsed' | 'completedQuests' | 'totalQuests' | 'percent' | 'pace' | 'status'>>
): Promise<void> {
  const notion = getNotionClient();
  const properties: Record<string, any> = {};

  if (updates.dayElapsed !== undefined) {
    properties['Day Elapsed'] = { number: updates.dayElapsed };
  }
  if (updates.completedQuests !== undefined) {
    properties['Completed Quests'] = { number: updates.completedQuests };
  }
  if (updates.totalQuests !== undefined) {
    properties['Total Quests'] = { number: updates.totalQuests };
  }
  if (updates.percent !== undefined) {
    properties['Percent'] = { number: updates.percent };
  }
  if (updates.pace !== undefined) {
    properties['Pace'] = { select: { name: updates.pace } };
  }
  if (updates.status !== undefined) {
    properties['Status'] = { select: { name: updates.status } };
  }

  await notion.pages.update({ page_id: id, properties });
}
