import { getPenalties } from '@/lib/notion/penalties';
import PenaltyLogClient from '@/components/ledger/PenaltyLogClient';
import type { Penalty } from '@/lib/notion/types';

export default async function PenaltiesPage() {
  let penalties: Penalty[] = [];
  let notionError = false;
  try { penalties = await getPenalties(); } catch (e) {
    notionError = true;
    console.error('Notion error on penalties:', e);
  }
  return <PenaltyLogClient penalties={penalties} notionError={notionError} />;
}
