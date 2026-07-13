import { getQuestLog } from '@/lib/notion/quests';
import QuestLogClient from '@/components/quests/QuestLogClient';
import type { Quest } from '@/lib/notion/types';

export default async function QuestLogPage() {
  let questLog: Quest[] = [];
  let notionError = false;
  try { questLog = await getQuestLog(); } catch (e) {
    notionError = true;
    console.error('Notion error on quest log:', e);
  }
  return <QuestLogClient questLog={questLog} notionError={notionError} />;
}
