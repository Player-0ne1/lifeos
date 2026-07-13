import { getCharacterStats, getPlayerProfile } from '@/lib/notion/player';
import { getSkills } from '@/lib/notion/skills';
import { getPassives } from '@/lib/notion/passives';
import { getActiveArc } from '@/lib/notion/arcs';
import CharacterTabClient from '@/components/character/CharacterTabClient';

export default async function CharacterPage() {
  let player: any = null, stats: any[] = [], skills: any[] = [], passives: any[] = [], arc: any = null;
  let notionError = false;
  try {
    [player, stats, skills, passives, arc] = await Promise.all([
      getPlayerProfile(),
      getCharacterStats(),
      getSkills(),
      getPassives(),
      getActiveArc(),
    ]);
  } catch (e) {
    notionError = true;
    console.error('Notion error on character:', e);
  }

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
      notionError={notionError}
    />
  );
}
