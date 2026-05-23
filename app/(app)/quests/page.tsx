import { getActiveArc } from '@/lib/notion/arcs';
import { getQuestLog, getQuestLibrary } from '@/lib/notion/quests';
import QuestsHomeClient from '@/components/quests/QuestsHomeClient';
import type { ArcTracker, Quest, QuestTemplate } from '@/lib/notion/types';

export default async function QuestsPage() {
  let arc: ArcTracker | null = null;
  let questLog: Quest[] = [];
  let library: QuestTemplate[] = [];
  try {
    [arc, questLog, library] = await Promise.all([
      getActiveArc(),
      getQuestLog(),
      getQuestLibrary(),
    ]);
  } catch {}

  return <QuestsHomeClient arc={arc} questLog={questLog} library={library} />;
}
