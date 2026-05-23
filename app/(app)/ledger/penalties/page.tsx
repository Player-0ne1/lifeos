import { getPenalties } from '@/lib/notion/penalties';
import PenaltyLogClient from '@/components/ledger/PenaltyLogClient';
import type { Penalty } from '@/lib/notion/types';

export default async function PenaltiesPage() {
  let penalties: Penalty[] = [];
  try { penalties = await getPenalties(); } catch {}
  return <PenaltyLogClient penalties={penalties} />;
}
