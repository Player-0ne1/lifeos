import { getNotionClient } from './client';
import { DB } from './databases';
import type { FinancialEntry, FinancialSummary, FinancialType } from './types';

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

function mapEntry(page: any): FinancialEntry {
  return {
    id: page.id,
    date: prop(page, 'Date', 'date') ?? '',
    type: prop(page, 'Type', 'select') as FinancialType,
    amount: prop(page, 'Amount', 'number'),
    category: prop(page, 'Category', 'select') ?? '',
    note: prop(page, 'Note', 'rich_text'),
  };
}

// ─── Query functions ──────────────────────────────────────────────────────────

export async function getFinancialEntries(filter?: {
  type?: FinancialType;
  category?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}): Promise<FinancialEntry[]> {
  const notion = getNotionClient();

  const filters: any[] = [];

  if (filter?.type) {
    filters.push({ property: 'Type', select: { equals: filter.type } });
  }
  if (filter?.category) {
    filters.push({ property: 'Category', select: { equals: filter.category } });
  }
  if (filter?.startDate) {
    filters.push({ property: 'Date', date: { on_or_after: filter.startDate } });
  }
  if (filter?.endDate) {
    filters.push({ property: 'Date', date: { on_or_before: filter.endDate } });
  }

  const queryParams: any = {
    data_source_id: DB.FINANCIAL_LOG,
    sorts: [{ property: 'Date', direction: 'descending' }],
    page_size: filter?.limit ? Math.min(filter.limit, 100) : 100,
  };

  if (filters.length === 1) {
    queryParams.filter = filters[0];
  } else if (filters.length > 1) {
    queryParams.filter = { and: filters };
  }

  const res = await notion.dataSources.query(queryParams);

  return res.results
    .filter((page) => page.object === 'page')
    .map(mapEntry);
}

export async function addFinancialEntry(
  data: Omit<FinancialEntry, 'id'>
): Promise<FinancialEntry> {
  const notion = getNotionClient();

  const page = await notion.pages.create({
    parent: { data_source_id: DB.FINANCIAL_LOG },
    properties: {
      Date: { date: { start: data.date } },
      Type: { select: { name: data.type } },
      Amount: { number: data.amount },
      Category: { select: { name: data.category } },
      Note: { rich_text: [{ text: { content: data.note } }] },
    },
  });

  return mapEntry(page);
}

export async function getFinancialSummary(filter?: {
  startDate?: string;
  endDate?: string;
}): Promise<FinancialSummary> {
  const entries = await getFinancialEntries({
    startDate: filter?.startDate,
    endDate: filter?.endDate,
    limit: 100,
  });

  let totalIncome = 0;
  let totalExpenses = 0;
  const byCategory: Record<string, number> = {};

  for (const entry of entries) {
    if (entry.type === 'income') {
      totalIncome += entry.amount;
    } else {
      totalExpenses += entry.amount;
    }

    const key = `${entry.type}:${entry.category}`;
    byCategory[key] = (byCategory[key] ?? 0) + entry.amount;
  }

  return {
    totalIncome,
    totalExpenses,
    net: totalIncome - totalExpenses,
    byCategory,
  };
}
