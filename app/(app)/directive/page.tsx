import { getTodayCheckin } from '@/lib/notion/checkin';
import { getActiveQuests } from '@/lib/notion/quests';
import { getActiveArc } from '@/lib/notion/arcs';
import { getCharacterStats } from '@/lib/notion/player';
import { getCurrentWeekLedger } from '@/lib/notion/ledger';
import DirectiveTabClient from '@/components/directive/DirectiveTabClient';

export default async function DirectivePage() {
  let checkin = null, quests: any[] = [], arc = null, stats: any[] = [], week = null;

  try {
    [checkin, quests, arc, stats, week] = await Promise.all([
      getTodayCheckin(),
      getActiveQuests(),
      getActiveArc(),
      getCharacterStats(),
      getCurrentWeekLedger(),
    ]);
  } catch {
    // Notion not configured — show skeleton/pre-checkin state
  }

  // Determine day state from check-in status
  const dayState = !checkin ? 'pre-checkin' :
    checkin.status === 'pending' ? 'pre-checkin' :
    checkin.status === 'active' ? 'mid-day' :
    checkin.status === 'complete' ? 'all-complete' :
    'failed';

  return (
    <DirectiveTabClient
      dayState={dayState}
      checkin={checkin}
      quests={quests}
      arc={arc}
      stats={stats}
      week={week}
    />
  );
}
