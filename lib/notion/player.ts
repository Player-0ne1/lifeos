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
  return null;
}

// ─── Player Profile ───────────────────────────────────────────────────────────

export async function getPlayerProfile(): Promise<PlayerProfile> {
  const notion = getNotionClient();
  const res = await notion.databases.query({
    database_id: DB.PLAYER_PROFILE,
    page_size: 1,
  });

  const page = res.results[0];
  if (!page || page.object !== 'page') {
    throw new Error('Player profile not found in Notion database');
  }

  return {
    id: page.id,
    name: prop(page, 'Player', 'title'),
    level: prop(page, 'Level', 'number'),
    totalXP: prop(page, 'Total XP', 'number'),
    xpToNext: prop(page, 'XP to Next Level', 'number'),
    day: prop(page, 'System Day', 'number'),
    streak: prop(page, 'Current Streak', 'number'),
    bestStreak: prop(page, 'Longest Streak', 'number'),
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
    properties['Player'] = {
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
    properties['XP to Next Level'] = { number: updates.xpToNext };
  }
  if (updates.day !== undefined) {
    properties['System Day'] = { number: updates.day };
  }
  if (updates.streak !== undefined) {
    properties['Current Streak'] = { number: updates.streak };
  }
  if (updates.bestStreak !== undefined) {
    properties['Longest Streak'] = { number: updates.bestStreak };
  }

  await notion.pages.update({
    page_id: profile.id,
    properties,
  });
}

// ─── Character Sheet ──────────────────────────────────────────────────────────

export async function getCharacterStats(): Promise<CharacterStat[]> {
  const notion = getNotionClient();
  const res = await notion.databases.query({
    database_id: DB.CHARACTER_SHEET,
    page_size: 100,
    sorts: [{ property: 'Stat Name', direction: 'ascending' }],
  });

  return res.results
    .filter((page) => page.object === 'page')
    .map((page) => ({
      id: page.id,
      stat: prop(page, 'Stat Name', 'title') as Stat,
      score: prop(page, 'Current Score', 'number'),
      lastActive: '',   // rollup — not directly readable via API
      decayDays: 0,     // formula — read via page if needed
    }));
}

export async function updateCharacterStat(
  stat: string,
  score: number
): Promise<void> {
  const notion = getNotionClient();

  // Find the page for the given stat by title
  const res = await notion.databases.query({
    database_id: DB.CHARACTER_SHEET,
    filter: {
      property: 'Stat Name',
      title: { equals: stat },
    },
    page_size: 1,
  });

  const page = res.results[0];
  if (!page || page.object !== 'page') {
    throw new Error(`Character stat "${stat}" not found`);
  }

  await notion.pages.update({
    page_id: page.id,
    properties: {
      'Current Score': { number: score },
    },
  });
}
