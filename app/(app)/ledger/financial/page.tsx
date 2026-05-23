import { getFinancialEntries, getFinancialSummary } from '@/lib/notion/financial';
import FinancialLogClient from '@/components/ledger/FinancialLogClient';
import type { FinancialEntry, FinancialSummary } from '@/lib/notion/types';

export default async function FinancialPage() {
  let entries: FinancialEntry[] = [];
  let summary: FinancialSummary | null = null;
  try {
    [entries, summary] = await Promise.all([getFinancialEntries(), getFinancialSummary()]);
  } catch {}
  return <FinancialLogClient entries={entries} summary={summary} />;
}
