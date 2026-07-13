import { getWeeklyHistory } from '@/lib/notion/ledger';
import WeeklyHistoryClient from '@/components/ledger/WeeklyHistoryClient';
import type { WeeklyLedger } from '@/lib/notion/types';

export default async function HistoryPage() {
  let weeks: WeeklyLedger[] = [];
  let notionError = false;
  try { weeks = await getWeeklyHistory(12); } catch (e) {
    notionError = true;
    console.error('Notion error on history:', e);
  }
  return <WeeklyHistoryClient weeks={weeks} notionError={notionError} />;
}
