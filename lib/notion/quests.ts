import { getNotionClient } from './client';
import { DB } from './databases';
import type { Quest, QuestTemplate, QuestStatus, Stat, Difficulty, EnergyLevel } from './types';

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
  if (type === 'url') return p.url ?? '';
  return null;
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapQuest(page: any): Quest {
  const status = prop(page, 'Status', 'select') as string;
  // Map Notion status values to internal QuestStatus
  const statusMap: Record<string, QuestStatus> = {
    'Assigned': 'open',
    'Proof Submitted': 'open',
    'Complete': 'complete',
    'Failed': 'failed',
  };

  return {
    id: page.id,
    title: prop(page, 'Quest Name', 'title'),
    stat: prop(page, 'Stat', 'select') as Stat,
    xp: prop(page, 'XP Value', 'number'),
    points: prop(page, 'XP Value', 'number'), // mapped to XP Value
    difficulty: prop(page, 'Difficulty', 'select') as Difficulty,
    status: (statusMap[status] ?? 'open') as QuestStatus,
    dayAssigned: prop(page, 'System Day', 'number'),
    proofType: '',
    proofStandard: '',
    proofText: undefined,
    proofUrl: undefined,
    isArc: false,
    arcName: undefined,
    isBonus: prop(page, 'Type', 'select') === 'Bonus',
    deadline: prop(page, 'Date Assigned', 'date'),
    brief: prop(page, 'Notes', 'rich_text'),
  };
}

function mapQuestTemplate(page: any): QuestTemplate {
  return {
    id: page.id,
    title: prop(page, 'Quest Name', 'title'),
    stat: prop(page, 'Stat', 'select') as Stat,
    xpValue: prop(page, 'XP Value', 'number'),
    difficulty: prop(page, 'Difficulty', 'select') as Difficulty,
    proofStandard: prop(page, 'Proof Standard', 'rich_text'),
    brief: prop(page, 'Brief Template', 'rich_text'),
    timeEstimate: prop(page, 'Time Estimate', 'select') ?? '',
    energyLevel: prop(page, 'Energy Required', 'select') as EnergyLevel,
  };
}

// ─── Query functions ──────────────────────────────────────────────────────────

export async function getActiveQuests(): Promise<Quest[]> {
  const notion = getNotionClient();
  const res = await notion.databases.query({
    database_id: DB.QUEST_LOG,
    filter: {
      or: [
        { property: 'Status', select: { equals: 'Assigned' } },
        { property: 'Status', select: { equals: 'Proof Submitted' } },
      ],
    },
    sorts: [{ property: 'System Day', direction: 'ascending' }],
    page_size: 100,
  });

  return res.results
    .filter((page) => page.object === 'page')
    .map(mapQuest);
}

export async function getQuestLog(filter?: { status?: QuestStatus; stat?: Stat; day?: number }): Promise<Quest[]> {
  const notion = getNotionClient();

  const filters: any[] = [];

  if (filter?.status) {
    const notionStatus = filter.status === 'open' ? 'Assigned' :
                         filter.status === 'complete' ? 'Complete' :
                         filter.status === 'failed' ? 'Failed' : 'Assigned';
    filters.push({ property: 'Status', select: { equals: notionStatus } });
  }
  if (filter?.stat) {
    filters.push({ property: 'Stat', select: { equals: filter.stat } });
  }
  if (filter?.day !== undefined) {
    filters.push({ property: 'System Day', number: { equals: filter.day } });
  }

  const queryParams: any = {
    database_id: DB.QUEST_LOG,
    sorts: [{ property: 'System Day', direction: 'descending' }],
    page_size: 100,
  };

  if (filters.length === 1) {
    queryParams.filter = filters[0];
  } else if (filters.length > 1) {
    queryParams.filter = { and: filters };
  }

  const res = await notion.databases.query(queryParams);

  return res.results
    .filter((page) => page.object === 'page')
    .map(mapQuest);
}

export async function getQuestLibrary(statFilter?: Stat): Promise<QuestTemplate[]> {
  const notion = getNotionClient();

  const queryParams: any = {
    database_id: DB.QUEST_LIBRARY,
    sorts: [{ property: 'Quest Name', direction: 'ascending' }],
    page_size: 100,
  };

  if (statFilter) {
    queryParams.filter = {
      property: 'Stat',
      select: { equals: statFilter },
    };
  }

  const res = await notion.databases.query(queryParams);

  return res.results
    .filter((page) => page.object === 'page')
    .map(mapQuestTemplate);
}

export async function getQuestById(id: string): Promise<Quest> {
  const notion = getNotionClient();
  const page = await notion.pages.retrieve({ page_id: id });
  return mapQuest(page);
}

export async function createQuest(
  data: Omit<Quest, 'id'>
): Promise<Quest> {
  const notion = getNotionClient();
  const today = new Date().toISOString().split('T')[0];
  const weekNumber = Math.ceil((data.dayAssigned || 1) / 7);

  const properties: Record<string, any> = {
    'Quest Name': { title: [{ text: { content: data.title } }] },
    Stat: { select: { name: data.stat } },
    'XP Value': { number: data.xp },
    Difficulty: { select: { name: data.difficulty } },
    Status: { select: { name: 'Assigned' } },
    'System Day': { number: data.dayAssigned },
    'Week Number': { number: weekNumber },
    'Date Assigned': { date: { start: today } },
    Type: { select: { name: data.isBonus ? 'Bonus' : 'Daily' } },
  };

  if (data.brief) {
    properties['Notes'] = { rich_text: [{ text: { content: data.brief } }] };
  }

  const page = await notion.pages.create({
    parent: { database_id: DB.QUEST_LOG },
    properties,
  });

  return mapQuest(page);
}

export async function updateQuestStatus(
  id: string,
  status: QuestStatus,
  proofData?: { proofText?: string; proofUrl?: string }
): Promise<void> {
  const notion = getNotionClient();

  const notionStatus = status === 'open' ? 'Assigned' :
                       status === 'complete' ? 'Complete' :
                       status === 'failed' ? 'Failed' : 'Assigned';

  const properties: Record<string, any> = {
    Status: { select: { name: notionStatus } },
  };

  if (proofData?.proofText) {
    properties['Proof'] = {
      rich_text: [{ text: { content: proofData.proofText } }],
    };
  }

  await notion.pages.update({ page_id: id, properties });
}
