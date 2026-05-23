import { getWeeklyHistory } from '@/lib/notion/ledger';
import WeeklyHistoryClient from '@/components/ledger/WeeklyHistoryClient';
import type { WeeklyLedger } from '@/lib/notion/types';

export default async function HistoryPage() {
  let weeks: WeeklyLedger[] = [];
  try { weeks = await getWeeklyHistory(12); } catch {}
  return <WeeklyHistoryClient weeks={weeks} />;
}
