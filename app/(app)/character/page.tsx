import { getCharacterStats, getPlayerProfile } from '@/lib/notion/player';
import { getSkills } from '@/lib/notion/skills';
import { getPassives } from '@/lib/notion/passives';
import { getActiveArc } from '@/lib/notion/arcs';
import CharacterTabClient from '@/components/character/CharacterTabClient';

export default async function CharacterPage() {
  let player: any, stats: any[], skills: any[], passives: any[], arc: any;
  try {
    [player, stats, skills, passives, arc] = await Promise.all([
      getPlayerProfile(),
      getCharacterStats(),
      getSkills(),
      getPassives(),
      getActiveArc(),
    ]);
  } catch {
    player = { id: 'fallback', name: 'ONE', level: 1, totalXP: 0, xpToNext: 500, day: 1, streak: 0, bestStreak: 0 };
    stats = []; skills = []; passives = []; arc = null;
  }

  // Group passives by status
  const passivesByStatus = {
    active: (passives ?? []).filter((p: any) => p.status === 'active'),
    building: (passives ?? []).filter((p: any) => p.status === 'building'),
    broken: (passives ?? []).filter((p: any) => p.status === 'broken'),
  };

  return (
    <CharacterTabClient
      player={player}
      stats={stats ?? []}
      skills={skills ?? []}
      passives={passivesByStatus}
      arc={arc}
    />
  );
}
