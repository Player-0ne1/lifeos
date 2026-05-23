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
  return {
    id: page.id,
    title: prop(page, 'Title', 'title'),
    stat: prop(page, 'Stat', 'select') as Stat,
    xp: prop(page, 'XP', 'number'),
    points: prop(page, 'Points', 'number'),
    difficulty: prop(page, 'Difficulty', 'select') as Difficulty,
    status: prop(page, 'Status', 'select') as QuestStatus,
    dayAssigned: prop(page, 'Day Assigned', 'number'),
    proofType: prop(page, 'Proof Type', 'select') ?? '',
    proofStandard: prop(page, 'Proof Standard', 'rich_text'),
    proofText: prop(page, 'Proof Text', 'rich_text') || undefined,
    proofUrl: prop(page, 'Proof URL', 'url') || undefined,
    isArc: prop(page, 'Is Arc', 'checkbox'),
    arcName: prop(page, 'Arc Name', 'rich_text') || undefined,
    isBonus: prop(page, 'Is Bonus', 'checkbox'),
    deadline: prop(page, 'Deadline', 'date'),
    brief: prop(page, 'Brief', 'rich_text'),
  };
}

function mapQuestTemplate(page: any): QuestTemplate {
  return {
    id: page.id,
    title: prop(page, 'Title', 'title'),
    stat: prop(page, 'Stat', 'select') as Stat,
    xpValue: prop(page, 'XP Value', 'number'),
    difficulty: prop(page, 'Difficulty', 'select') as Difficulty,
    proofStandard: prop(page, 'Proof Standard', 'rich_text'),
    brief: prop(page, 'Brief', 'rich_text'),
    timeEstimate: prop(page, 'Time Estimate', 'rich_text'),
    energyLevel: prop(page, 'Energy Level', 'select') as EnergyLevel,
  };
}

// ─── Query functions ──────────────────────────────────────────────────────────

export async function getActiveQuests(): Promise<Quest[]> {
  const notion = getNotionClient();
  const res = await notion.dataSources.query({
    data_source_id: DB.QUEST_LOG,
    filter: {
      property: 'Status',
      select: { equals: 'open' },
    },
    sorts: [{ property: 'Day Assigned', direction: 'ascending' }],
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
    filters.push({ property: 'Status', select: { equals: filter.status } });
  }
  if (filter?.stat) {
    filters.push({ property: 'Stat', select: { equals: filter.stat } });
  }
  if (filter?.day !== undefined) {
    filters.push({ property: 'Day Assigned', number: { equals: filter.day } });
  }

  const queryParams: any = {
    data_source_id: DB.QUEST_LOG,
    sorts: [{ property: 'Day Assigned', direction: 'descending' }],
    page_size: 100,
  };

  if (filters.length === 1) {
    queryParams.filter = filters[0];
  } else if (filters.length > 1) {
    queryParams.filter = { and: filters };
  }

  const res = await notion.dataSources.query(queryParams);

  return res.results
    .filter((page) => page.object === 'page')
    .map(mapQuest);
}

export async function getQuestLibrary(statFilter?: Stat): Promise<QuestTemplate[]> {
  const notion = getNotionClient();

  const queryParams: any = {
    data_source_id: DB.QUEST_LIBRARY,
    sorts: [{ property: 'Title', direction: 'ascending' }],
    page_size: 100,
  };

  if (statFilter) {
    queryParams.filter = {
      property: 'Stat',
      select: { equals: statFilter },
    };
  }

  const res = await notion.dataSources.query(queryParams);

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

  const properties: Record<string, any> = {
    Title: { title: [{ text: { content: data.title } }] },
    Stat: { select: { name: data.stat } },
    XP: { number: data.xp },
    Points: { number: data.points },
    Difficulty: { select: { name: data.difficulty } },
    Status: { select: { name: data.status } },
    'Day Assigned': { number: data.dayAssigned },
    'Proof Type': { select: { name: data.proofType } },
    'Proof Standard': { rich_text: [{ text: { content: data.proofStandard } }] },
    Brief: { rich_text: [{ text: { content: data.brief } }] },
  };

  if (data.proofText) {
    properties['Proof Text'] = { rich_text: [{ text: { content: data.proofText } }] };
  }
  if (data.proofUrl) {
    properties['Proof URL'] = { url: data.proofUrl };
  }
  if (data.isArc !== undefined) {
    properties['Is Arc'] = { checkbox: data.isArc };
  }
  if (data.arcName) {
    properties['Arc Name'] = { rich_text: [{ text: { content: data.arcName } }] };
  }
  if (data.isBonus !== undefined) {
    properties['Is Bonus'] = { checkbox: data.isBonus };
  }
  if (data.deadline) {
    properties['Deadline'] = { date: { start: data.deadline } };
  }

  const page = await notion.pages.create({
    parent: { data_source_id: DB.QUEST_LOG },
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

  const properties: Record<string, any> = {
    Status: { select: { name: status } },
  };

  if (proofData?.proofText) {
    properties['Proof Text'] = {
      rich_text: [{ text: { content: proofData.proofText } }],
    };
  }
  if (proofData?.proofUrl) {
    properties['Proof URL'] = { url: proofData.proofUrl };
  }

  await notion.pages.update({ page_id: id, properties });
}
