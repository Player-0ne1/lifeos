'use server';
import { revalidatePath } from 'next/cache';
import { createPenalty } from '@/lib/notion/penalties';
import { addFinancialEntry } from '@/lib/notion/financial';
import { getCurrentWeekLedger, closeWeek } from '@/lib/notion/ledger';
import { todayIST } from '@/lib/utils';

export async function addFinancialEntryAction(data: {
  type: 'income' | 'expense';
  amount: number;
  category: string;
  note: string;
}): Promise<void> {
  await addFinancialEntry({
    date: todayIST(),
    type: data.type,
    amount: data.amount,
    category: data.category,
    note: data.note,
  });
  revalidatePath('/ledger');
  revalidatePath('/ledger/financial');
}

export async function submitSundayRitual(data: {
  reflection: string;
  penaltyPaid: boolean;
  upiRef?: string;
}): Promise<void> {
  const ledger = await getCurrentWeekLedger();
  if (!ledger) return;

  if (ledger.penaltyAmount > 0) {
    await createPenalty({
      weekNum: ledger.weekNum,
      amount: ledger.penaltyAmount,
      reason: `Week ${ledger.weekNum} completion: ${ledger.completionPct}%`,
      paidDate: data.penaltyPaid ? todayIST() : undefined,
      upiRef: data.upiRef,
      isPaid: data.penaltyPaid,
    });
  }

  await closeWeek(ledger.id, {});

  revalidatePath('/ledger');
}

export async function recordPenaltyAction(
  weekNum: number,
  amount: number,
  reason: string
): Promise<void> {
  await createPenalty({
    weekNum,
    amount,
    reason,
    isPaid: false,
  });
  revalidatePath('/ledger/penalties');
}
