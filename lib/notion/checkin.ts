import { getNotionClient } from './client';
import { DB } from './databases';
import type { DailyCheckin, CheckinStatus } from './types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatEntryTitle(isoDate: string, time: 'Morning' | 'Evening' = 'Morning'): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${d} ${months[m - 1]} ${y} — ${time}`;
}

// ─── Notion property extractor ────────────────────────────────────────────────

function prop(page: any, name: string, type: string): any {
  const p = page.properties?.[name];
  if (!p) return null;
  if (type === 'title') return p.title?.[0]?.plain_text ?? '';
  if (type === 'number') return p.number ?? 0;
  if (type === 'number_or_null') return p.number ?? null;
  if (type === 'rich_text') return p.rich_text?.[0]?.plain_text ?? '';
  if (type === 'select') return p.select?.name ?? '';
  if (type === 'date') return p.date?.start ?? null;
  if (type === 'checkbox') return p.checkbox ?? false;
  if (type === 'relation') return p.relation?.map((r: any) => r.id) ?? [];
  return null;
}

// ─── Mapper ───────────────────────────────────────────────────────────────────

function mapCheckin(page: any): DailyCheckin {
  return {
    id: page.id,
    date: prop(page, 'Date', 'date') ?? '',
    energy: prop(page, 'Energy Level', 'number'),
    constraints: prop(page, 'Hard Constraints', 'rich_text'),
    mindNote: prop(page, 'One Thing On Mind', 'rich_text'),
    directiveText: undefined, // not stored in Notion schema
    questIds: prop(page, 'Quest Log Entries', 'relation'),
    closeEnergy: undefined, // not stored in Notion schema
    dayNote: prop(page, 'One Sentence On The Day', 'rich_text') || undefined,
    status: 'active' as CheckinStatus, // derived field, not stored
  };
}

// ─── Query functions ──────────────────────────────────────────────────────────

export async function getTodayCheckin(): Promise<DailyCheckin | null> {
  const notion = getNotionClient();
  const today = new Date().toISOString().split('T')[0];

  const res = await notion.dataSources.query({
    data_source_id: DB.CHECKIN_LOG,
    filter: {
      property: 'Date',
      date: { equals: today },
    },
    page_size: 1,
  });

  const page = res.results.find((p) => p.object === 'page');
  if (!page) return null;
  return mapCheckin(page);
}

export async function createCheckin(
  data: Omit<DailyCheckin, 'id'>
): Promise<DailyCheckin> {
  const notion = getNotionClient();

  const properties: Record<string, any> = {
    Entry: { title: [{ text: { content: formatEntryTitle(data.date, 'Morning') } }] },
    Date: { date: { start: data.date } },
    'Check-in Time': { select: { name: 'Morning' } },
    'Energy Level': { number: data.energy },
    'Hard Constraints': { rich_text: [{ text: { content: data.constraints || '' } }] },
    'One Thing On Mind': { rich_text: [{ text: { content: data.mindNote || '' } }] },
  };

  if (data.questIds && data.questIds.length > 0) {
    properties['Quest Log Entries'] = {
      relation: data.questIds.map((id) => ({ id })),
    };
  }

  if (data.dayNote) {
    properties['One Sentence On The Day'] = {
      rich_text: [{ text: { content: data.dayNote } }],
    };
  }

  const page = await notion.pages.create({
    parent: { database_id: DB.CHECKIN_LOG },
    properties,
  });

  return mapCheckin(page);
}

export async function updateCheckin(
  id: string,
  updates: Partial<Omit<DailyCheckin, 'id'>>
): Promise<void> {
  const notion = getNotionClient();
  const properties: Record<string, any> = {};

  if (updates.date !== undefined) {
    properties['Date'] = { date: { start: updates.date } };
    properties['Entry'] = { title: [{ text: { content: formatEntryTitle(updates.date, 'Morning') } }] };
  }
  if (updates.energy !== undefined) {
    properties['Energy Level'] = { number: updates.energy };
  }
  if (updates.constraints !== undefined) {
    properties['Hard Constraints'] = {
      rich_text: [{ text: { content: updates.constraints } }],
    };
  }
  if (updates.mindNote !== undefined) {
    properties['One Thing On Mind'] = {
      rich_text: [{ text: { content: updates.mindNote } }],
    };
  }
  if (updates.questIds !== undefined) {
    properties['Quest Log Entries'] = {
      relation: updates.questIds.map((qid) => ({ id: qid })),
    };
  }
  if (updates.dayNote !== undefined) {
    properties['One Sentence On The Day'] = {
      rich_text: [{ text: { content: updates.dayNote } }],
    };
  }

  await notion.pages.update({ page_id: id, properties });
}

export async function getRecentCheckins(days: number = 7): Promise<DailyCheckin[]> {
  const notion = getNotionClient();

  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString().split('T')[0];

  const res = await notion.dataSources.query({
    data_source_id: DB.CHECKIN_LOG,
    filter: {
      property: 'Date',
      date: { on_or_after: sinceStr },
    },
    sorts: [{ property: 'Date', direction: 'descending' }],
    page_size: 100,
  });

  return res.results
    .filter((page) => page.object === 'page')
    .map(mapCheckin);
}
