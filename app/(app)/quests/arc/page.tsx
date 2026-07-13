import { getActiveArc } from '@/lib/notion/arcs';
import ArcTrackerClient from '@/components/quests/ArcTrackerClient';

export default async function ArcPage() {
  let arc = null;
  let notionError = false;
  try { arc = await getActiveArc(); } catch (e) {
    notionError = true;
    console.error('Notion error on arc:', e);
  }
  return <ArcTrackerClient arc={arc} notionError={notionError} />;
}
