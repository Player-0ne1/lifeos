import { getNotionClient } from './client';
import { DB } from './databases';
import type { Penalty } from './types';

// ─── Notion property extractor ────────────────────────────────────────────────

function prop(page: any, name: string, type: string): any {
  const p = page.properties?.[name];
  if (!p) return null;
  if (type === 'title') return p.title?.[0]?.plain_text ?? '';
  if (type === 'number') return p.number ?? 0;
  if (type === 'rich_text') return p.rich_text?.[0]?.plain_text ?? '';
  if (type === 'select') return p.select?.name ?? '';
  if (type === 'date') return p.date?.start ?? null;
  if (type === 'checkbox') return p.checkbox ?? false;
  return null;
}

// ─── Mapper ───────────────────────────────────────────────────────────────────

function mapPenalty(page: any): Penalty {
  return {
    id: page.id,
    weekNum: prop(page, 'Week Num', 'number'),
    amount: prop(page, 'Amount', 'number'),
    reason: prop(page, 'Reason', 'rich_text'),
    paidDate: prop(page, 'Paid Date', 'date') ?? undefined,
    upiRef: prop(page, 'UPI Ref', 'rich_text') || undefined,
    isPaid: prop(page, 'Is Paid', 'checkbox'),
  };
}

// ─── Query functions ──────────────────────────────────────────────────────────

export async function getPenalties(unpaidOnly: boolean = false): Promise<Penalty[]> {
  const notion = getNotionClient();

  const queryParams: any = {
    database_id: DB.PENALTY_LOG,
    sorts: [{ property: 'Week Num', direction: 'descending' }],
    page_size: 100,
  };

  if (unpaidOnly) {
    queryParams.filter = {
      property: 'Is Paid',
      checkbox: { equals: false },
    };
  }

  const res = await notion.dataSources.query(queryParams);

  return res.results
    .filter((page) => page.object === 'page')
    .map(mapPenalty);
}

export async function createPenalty(
  data: Omit<Penalty, 'id'>
): Promise<Penalty> {
  const notion = getNotionClient();

  const properties: Record<string, any> = {
    'Week Num': { number: data.weekNum },
    Amount: { number: data.amount },
    Reason: { rich_text: [{ text: { content: data.reason } }] },
    'Is Paid': { checkbox: data.isPaid },
  };

  if (data.paidDate) {
    properties['Paid Date'] = { date: { start: data.paidDate } };
  }
  if (data.upiRef) {
    properties['UPI Ref'] = { rich_text: [{ text: { content: data.upiRef } }] };
  }

  const page = await notion.pages.create({
    parent: { database_id: DB.PENALTY_LOG },
    properties,
  });

  return mapPenalty(page);
}

export async function markPenaltyPaid(
  id: string,
  upiRef: string
): Promise<void> {
  const notion = getNotionClient();
  const today = new Date().toISOString().split('T')[0];

  await notion.pages.update({
    page_id: id,
    properties: {
      'Is Paid': { checkbox: true },
      'Paid Date': { date: { start: today } },
      'UPI Ref': { rich_text: [{ text: { content: upiRef } }] },
    },
  });
}
