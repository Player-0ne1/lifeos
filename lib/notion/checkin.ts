import { getNotionClient } from './client';
import { DB } from './databases';
import type { DailyCheckin, CheckinStatus } from './types';

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
    energy: prop(page, 'Energy', 'number'),
    constraints: prop(page, 'Constraints', 'rich_text'),
    mindNote: prop(page, 'Mind Note', 'rich_text'),
    directiveText: prop(page, 'Directive Text', 'rich_text') || undefined,
    questIds: prop(page, 'Quests', 'relation'),
    closeEnergy: prop(page, 'Close Energy', 'number_or_null') ?? undefined,
    dayNote: prop(page, 'Day Note', 'rich_text') || undefined,
    status: prop(page, 'Status', 'select') as CheckinStatus,
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
    // Use date as the page title for readability
    Date: { date: { start: data.date } },
    Energy: { number: data.energy },
    Constraints: { rich_text: [{ text: { content: data.constraints } }] },
    'Mind Note': { rich_text: [{ text: { content: data.mindNote } }] },
    Status: { select: { name: data.status } },
  };

  if (data.directiveText) {
    properties['Directive Text'] = {
      rich_text: [{ text: { content: data.directiveText } }],
    };
  }
  if (data.questIds && data.questIds.length > 0) {
    properties['Quests'] = {
      relation: data.questIds.map((id) => ({ id })),
    };
  }
  if (data.closeEnergy !== undefined) {
    properties['Close Energy'] = { number: data.closeEnergy };
  }
  if (data.dayNote) {
    properties['Day Note'] = {
      rich_text: [{ text: { content: data.dayNote } }],
    };
  }

  const page = await notion.pages.create({
    parent: { data_source_id: DB.CHECKIN_LOG },
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
  }
  if (updates.energy !== undefined) {
    properties['Energy'] = { number: updates.energy };
  }
  if (updates.constraints !== undefined) {
    properties['Constraints'] = {
      rich_text: [{ text: { content: updates.constraints } }],
    };
  }
  if (updates.mindNote !== undefined) {
    properties['Mind Note'] = {
      rich_text: [{ text: { content: updates.mindNote } }],
    };
  }
  if (updates.directiveText !== undefined) {
    properties['Directive Text'] = {
      rich_text: [{ text: { content: updates.directiveText } }],
    };
  }
  if (updates.questIds !== undefined) {
    properties['Quests'] = {
      relation: updates.questIds.map((qid) => ({ id: qid })),
    };
  }
  if (updates.closeEnergy !== undefined) {
    properties['Close Energy'] = { number: updates.closeEnergy };
  }
  if (updates.dayNote !== undefined) {
    properties['Day Note'] = {
      rich_text: [{ text: { content: updates.dayNote } }],
    };
  }
  if (updates.status !== undefined) {
    properties['Status'] = { select: { name: updates.status } };
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
