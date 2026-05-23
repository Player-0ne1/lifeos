import { getQuestLibrary } from '@/lib/notion/quests';
import QuestLibraryClient from '@/components/quests/QuestLibraryClient';
import type { QuestTemplate } from '@/lib/notion/types';

export default async function QuestLibraryPage() {
  let library: QuestTemplate[] = [];
  try { library = await getQuestLibrary(); } catch {}
  return <QuestLibraryClient library={library} />;
}
