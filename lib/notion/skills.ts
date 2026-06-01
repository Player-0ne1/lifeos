import { getNotionClient } from './client';
import { DB } from './databases';
import type { Skill, SkillStatus, SkillTier, Stat } from './types';

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

function mapSkill(page: any): Skill {
  return {
    id: page.id,
    name: prop(page, 'Name', 'title'),
    stat: prop(page, 'Stat', 'select') as Stat,
    tier: prop(page, 'Tier', 'number') as SkillTier,
    scoreThreshold: prop(page, 'Score Threshold', 'number'),
    status: prop(page, 'Status', 'select') as SkillStatus,
    description: prop(page, 'Description', 'rich_text'),
    deliverable: prop(page, 'Deliverable', 'rich_text') || undefined,
  };
}

// ─── Query functions ──────────────────────────────────────────────────────────

export async function getSkills(statFilter?: Stat): Promise<Skill[]> {
  const notion = getNotionClient();

  const queryParams: any = {
    database_id: DB.SKILL_REGISTRY,
    sorts: [
      { property: 'Stat', direction: 'ascending' },
      { property: 'Tier', direction: 'ascending' },
    ],
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
    .map(mapSkill);
}

export async function getUnlockedSkills(): Promise<Skill[]> {
  const notion = getNotionClient();

  const res = await notion.databases.query({
    data_source_id: DB.SKILL_REGISTRY,
    filter: {
      property: 'Status',
      select: { equals: 'unlocked' },
    },
    sorts: [
      { property: 'Stat', direction: 'ascending' },
      { property: 'Tier', direction: 'ascending' },
    ],
    page_size: 100,
  });

  return res.results
    .filter((page) => page.object === 'page')
    .map(mapSkill);
}

export async function unlockSkill(
  id: string,
  deliverable: string
): Promise<void> {
  const notion = getNotionClient();

  await notion.pages.update({
    page_id: id,
    properties: {
      Status: { select: { name: 'unlocked' } },
      Deliverable: {
        rich_text: [{ text: { content: deliverable } }],
      },
    },
  });
}
