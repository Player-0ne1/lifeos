import { getQuestLog } from '@/lib/notion/quests';
import QuestLogClient from '@/components/quests/QuestLogClient';
import type { Quest } from '@/lib/notion/types';

export default async function QuestLogPage() {
  let questLog: Quest[] = [];
  try { questLog = await getQuestLog(); } catch {}
  return <QuestLogClient questLog={questLog} />;
}
