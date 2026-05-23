import { getActiveArc } from '@/lib/notion/arcs';
import ArcTrackerClient from '@/components/quests/ArcTrackerClient';

export default async function ArcPage() {
  let arc = null;
  try { arc = await getActiveArc(); } catch {}
  return <ArcTrackerClient arc={arc} />;
}
