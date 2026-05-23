import { getCurrentWeekLedger, getWeeklyHistory } from '@/lib/notion/ledger';
import { getPenalties } from '@/lib/notion/penalties';
import { getFinancialSummary } from '@/lib/notion/financial';
import LedgerHomeClient from '@/components/ledger/LedgerHomeClient';
import type { WeeklyLedger, Penalty, FinancialSummary } from '@/lib/notion/types';

export default async function LedgerPage() {
  let week: WeeklyLedger | null = null;
  let pastWeeks: WeeklyLedger[] = [];
  let penalties: Penalty[] = [];
  let financial: FinancialSummary | null = null;
  try {
    [week, pastWeeks, penalties, financial] = await Promise.all([
      getCurrentWeekLedger(),
      getWeeklyHistory(12),
      getPenalties(),
      getFinancialSummary(),
    ]);
  } catch {}

  return <LedgerHomeClient week={week} pastWeeks={pastWeeks} penalties={penalties} financial={financial} />;
}
