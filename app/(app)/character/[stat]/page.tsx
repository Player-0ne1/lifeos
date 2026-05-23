import { getCharacterStats, getPlayerProfile } from '@/lib/notion/player';
import { getSkills } from '@/lib/notion/skills';
import { getStatHistory } from '@/lib/notion/stats';
import { getQuestLog } from '@/lib/notion/quests';
import StatDetailClient from '@/components/character/StatDetailClient';
import type { Stat } from '@/lib/notion/types';

export default async function StatDetailPage({ params }: { params: Promise<{ stat: string }> }) {
  const { stat } = await params;
  const statKey = stat.toUpperCase() as Stat;

  let player: any, stats: any[], skills: any[], history: any[], questLog: any[];
  try {
    [player, stats, skills, history, questLog] = await Promise.all([
      getPlayerProfile(),
      getCharacterStats(),
      getSkills(statKey),
      getStatHistory(statKey, 30),
      getQuestLog({ stat: statKey }),
    ]);
  } catch {
    player = null; stats = []; skills = []; history = []; questLog = [];
  }

  return (
    <StatDetailClient
      stat={statKey}
      player={player}
      allStats={stats ?? []}
      skills={skills ?? []}
      history={history ?? []}
      questLog={questLog ?? []}
    />
  );
}
