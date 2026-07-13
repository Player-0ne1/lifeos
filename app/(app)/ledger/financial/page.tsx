import { getFinancialEntries, getFinancialSummary } from '@/lib/notion/financial';
import FinancialLogClient from '@/components/ledger/FinancialLogClient';
import type { FinancialEntry, FinancialSummary } from '@/lib/notion/types';

export default async function FinancialPage() {
  let entries: FinancialEntry[] = [];
  let summary: FinancialSummary | null = null;
  let notionError = false;
  try {
    [entries, summary] = await Promise.all([getFinancialEntries(), getFinancialSummary()]);
  } catch (e) {
    notionError = true;
    console.error('Notion error on financial:', e);
  }
  return <FinancialLogClient entries={entries} summary={summary} notionError={notionError} />;
}
