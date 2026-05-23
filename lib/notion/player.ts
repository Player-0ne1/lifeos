import { getNotionClient } from './client';
import { DB } from './databases';
import type { PlayerProfile, CharacterStat, Stat } from './types';

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
  if (type === 'people') return p.people?.map((u: any) => u.id) ?? [];
  return null;
}

// ─── Player Profile ───────────────────────────────────────────────────────────

export async function getPlayerProfile(): Promise<PlayerProfile> {
  const notion = getNotionClient();
  const res = await notion.dataSources.query({
    data_source_id: DB.PLAYER_PROFILE,
    page_size: 1,
  });

  const page = res.results[0];
  if (!page || page.object !== 'page') {
    throw new Error('Player profile not found in Notion database');
  }

  return {
    id: page.id,
    name: prop(page, 'Name', 'title'),
    level: prop(page, 'Level', 'number'),
    totalXP: prop(page, 'Total XP', 'number'),
    xpToNext: prop(page, 'XP to Next', 'number'),
    day: prop(page, 'Day', 'number'),
    streak: prop(page, 'Streak', 'number'),
    bestStreak: prop(page, 'Best Streak', 'number'),
  };
}

export async function updatePlayerProfile(
  updates: Partial<PlayerProfile>
): Promise<void> {
  const notion = getNotionClient();

  // Fetch the current profile to get the page ID
  const profile = await getPlayerProfile();

  const properties: Record<string, any> = {};

  if (updates.name !== undefined) {
    properties['Name'] = {
      title: [{ text: { content: updates.name } }],
    };
  }
  if (updates.level !== undefined) {
    properties['Level'] = { number: updates.level };
  }
  if (updates.totalXP !== undefined) {
    properties['Total XP'] = { number: updates.totalXP };
  }
  if (updates.xpToNext !== undefined) {
    properties['XP to Next'] = { number: updates.xpToNext };
  }
  if (updates.day !== undefined) {
    properties['Day'] = { number: updates.day };
  }
  if (updates.streak !== undefined) {
    properties['Streak'] = { number: updates.streak };
  }
  if (updates.bestStreak !== undefined) {
    properties['Best Streak'] = { number: updates.bestStreak };
  }

  await notion.pages.update({
    page_id: profile.id,
    properties,
  });
}

// ─── Character Sheet ──────────────────────────────────────────────────────────

export async function getCharacterStats(): Promise<CharacterStat[]> {
  const notion = getNotionClient();
  const res = await notion.dataSources.query({
    data_source_id: DB.CHARACTER_SHEET,
    page_size: 100,
    sorts: [{ property: 'Stat', direction: 'ascending' }],
  });

  return res.results
    .filter((page) => page.object === 'page')
    .map((page) => ({
      id: page.id,
      stat: prop(page, 'Stat', 'select') as Stat,
      score: prop(page, 'Score', 'number'),
      lastActive: prop(page, 'Last Active', 'date') ?? '',
      decayDays: prop(page, 'Decay Days', 'number'),
    }));
}

export async function updateCharacterStat(
  stat: string,
  score: number
): Promise<void> {
  const notion = getNotionClient();

  // Find the page for the given stat
  const res = await notion.dataSources.query({
    data_source_id: DB.CHARACTER_SHEET,
    filter: {
      property: 'Stat',
      select: { equals: stat },
    },
    page_size: 1,
  });

  const page = res.results[0];
  if (!page || page.object !== 'page') {
    throw new Error(`Character stat "${stat}" not found`);
  }

  const today = new Date().toISOString().split('T')[0];

  await notion.pages.update({
    page_id: page.id,
    properties: {
      Score: { number: score },
      'Last Active': { date: { start: today } },
    },
  });
}
