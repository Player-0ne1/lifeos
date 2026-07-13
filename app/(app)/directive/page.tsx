import { getTodayCheckin } from '@/lib/notion/checkin';
import { getActiveQuests, getQuestLog } from '@/lib/notion/quests';
import { getActiveArc } from '@/lib/notion/arcs';
import { getPlayerProfile, getCharacterStats } from '@/lib/notion/player';
import { getCurrentWeekLedger } from '@/lib/notion/ledger';
import DirectiveTabClient from '@/components/directive/DirectiveTabClient';

export default async function DirectivePage() {
  let checkin = null, quests: any[] = [], arc = null, stats: any[] = [], week = null;

  try {
    // Fetch checkin + player profile first so we know the System Day
    const [checkinResult, playerResult] = await Promise.all([
      getTodayCheckin(),
      getPlayerProfile().catch(() => null),
    ]);
    checkin = checkinResult;

    // If checked in, fetch ALL quests for today's System Day (not just active) so
    // completed/failed quests remain visible and the "Close Day" button can appear.
    const questsPromise = (checkin && playerResult?.day != null)
      ? getQuestLog({ day: playerResult.day })
      : getActiveQuests();

    [quests, arc, stats, week] = await Promise.all([
      questsPromise,
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
