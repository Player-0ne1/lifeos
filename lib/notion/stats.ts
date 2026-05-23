import { getNotionClient } from './client';
import { DB } from './databases';
import type { StatHistoryEntry, Stat } from './types';

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

function mapEntry(page: any): StatHistoryEntry {
  return {
    id: page.id,
    stat: prop(page, 'Stat', 'select') as Stat,
    score: prop(page, 'Score', 'number'),
    date: prop(page, 'Date', 'date') ?? '',
    delta: prop(page, 'Delta', 'number'),
    reason: prop(page, 'Reason', 'rich_text'),
  };
}

// ─── Query functions ──────────────────────────────────────────────────────────

export async function getStatHistory(
  stat?: Stat,
  limit: number = 50
): Promise<StatHistoryEntry[]> {
  const notion = getNotionClient();

  const queryParams: any = {
    data_source_id: DB.STAT_HISTORY,
    sorts: [{ property: 'Date', direction: 'descending' }],
    page_size: Math.min(limit, 100),
  };

  if (stat) {
    queryParams.filter = {
      property: 'Stat',
      select: { equals: stat },
    };
  }

  const res = await notion.dataSources.query(queryParams);

  return res.results
    .filter((page) => page.object === 'page')
    .map(mapEntry);
}

export async function addStatHistoryEntry(
  entry: Omit<StatHistoryEntry, 'id'>
): Promise<StatHistoryEntry> {
  const notion = getNotionClient();

  const page = await notion.pages.create({
    parent: { data_source_id: DB.STAT_HISTORY },
    properties: {
      // Title is a required Notion field — use the stat + date as a readable label
      Stat: { select: { name: entry.stat } },
      Score: { number: entry.score },
      Date: { date: { start: entry.date } },
      Delta: { number: entry.delta },
      Reason: { rich_text: [{ text: { content: entry.reason } }] },
    },
  });

  return mapEntry(page);
}
