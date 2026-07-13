import { getQuestLibrary } from '@/lib/notion/quests';
import QuestLibraryClient from '@/components/quests/QuestLibraryClient';
import type { QuestTemplate } from '@/lib/notion/types';

export default async function QuestLibraryPage() {
  let library: QuestTemplate[] = [];
  let notionError = false;
  try { library = await getQuestLibrary(); } catch (e) {
    notionError = true;
    console.error('Notion error on quest library:', e);
  }
  return <QuestLibraryClient library={library} notionError={notionError} />;
}
