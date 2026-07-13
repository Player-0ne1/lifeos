import { getTodayCheckin } from '@/lib/notion/checkin';
import { getActiveQuests, getQuestLog } from '@/lib/notion/quests';
import { getActiveArc } from '@/lib/notion/arcs';
import { getPlayerProfile, getCharacterStats } from '@/lib/notion/player';
import { getCurrentWeekLedger } from '@/lib/notion/ledger';
import DirectiveTabClient from '@/components/directive/DirectiveTabClient';

// Always render fresh — never serve a cached RSC payload.
// This ensures router.refresh() (fired after the check-in animation) sees
// newly created quests rather than a revalidation snapshot from milliseconds
// after createQuest() was called (Notion indexing hasn't caught up by then).
export const dynamic = 'force-dynamic';

export default async function DirectivePage() {
  let checkin = null, quests: any[] = [], arc = null, stats: any[] = [], week = null;

  try {
    // Fetch checkin + player profile first so we know the System Day
    const [checkinResult, playerResult] = await Promise.all([
      getTodayCheckin(),
      getPlayerProfile().catch((e) => {
        console.error('[directive] getPlayerProfile error:', e?.message ?? e);
        return null;
      }),
    ]);
    checkin = checkinResult;

    console.log('[directive] render — checkin:', !!checkin, '| playerDay:', playerResult?.day ?? 'null');

    // If checked in, fetch ALL quests for today's System Day (not just active) so
    // completed/failed quests remain visible and the "Close Day" button can appear.
    const questsPromise = (checkin && playerResult?.day != null)
      ? getQuestLog({ day: playerResult.day })
      : getActiveQuests();

    [quests, arc, stats, week] = await Promise.all([
      questsPromise.catch((e) => {
        console.error('[directive] questsPromise error:', e?.message ?? e);
        return [];
      }),
      getActiveArc().catch((e) => {
        console.error('[directive] getActiveArc error:', e?.message ?? e);
        return null;
      }),
      getCharacterStats().catch((e) => {
        console.error('[directive] getCharacterStats error:', e?.message ?? e);
        return [];
      }),
      getCurrentWeekLedger().catch((e) => {
        console.error('[directive] getCurrentWeekLedger error:', e?.message ?? e);
        return null;
      }),
    ]);

    console.log('[directive] result — quests:', quests.length, '| arc:', !!arc, '| stats:', stats.length, '| week:', !!week);
  } catch (e: unknown) {
    // Notion not configured — show skeleton/pre-checkin state
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[directive] outer catch:', msg);
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
