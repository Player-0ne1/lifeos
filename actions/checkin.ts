'use server';
import { revalidatePath } from 'next/cache';
import { getTodayCheckin, createCheckin, updateCheckin } from '@/lib/notion/checkin';
import { getQuestLibrary, createQuest } from '@/lib/notion/quests';
import { getCharacterStats, getPlayerProfile } from '@/lib/notion/player';
import { generateDirective } from '@/lib/claude/directive';
import { todayIST } from '@/lib/utils';

export async function submitMorningCheckin(
  energy: number,
  constraints: string,
  mindNote: string
): Promise<{ success: boolean; directiveText?: string; questIds?: string[]; error?: string }> {
  try {
    // Create or update today's check-in
    const today = todayIST();
    let checkin = await getTodayCheckin();

    if (!checkin) {
      checkin = await createCheckin({
        date: today,
        energy,
        constraints,
        mindNote,
        status: 'active',
        questIds: [],
      });
    } else {
      await updateCheckin(checkin.id, { energy, constraints, mindNote, status: 'active' });
    }

    // Generate directive via Claude
    const [player, stats, library] = await Promise.all([
      getPlayerProfile(),
      getCharacterStats(),
      getQuestLibrary(),
    ]);

    const result = await generateDirective(player, stats, { energy, constraints, mindNote }, library);

    // Create quest log entries from directive
    const questIds: string[] = [];
    for (const q of [...result.mandatoryQuests, result.bonusQuest]) {
      if (!q) continue;
      const created = await createQuest({
        title: q.title,
        stat: q.stat as import('@/lib/notion/types').Stat,
        xp: q.xp,
        points: q.xp,
        difficulty: q.difficulty,
        brief: q.brief,
        proofStandard: q.proofStandard,
        proofType: q.proofType,
        status: 'open',
        isBonus: q.isBonus ?? false,
        deadline: '22:00 IST',
        dayAssigned: player.day,
      });
      questIds.push(created.id);
    }

    // Update check-in with directive text and quest IDs
    await updateCheckin(checkin.id, {
      directiveText: result.directiveText,
      questIds,
    });

    revalidatePath('/directive');
    return { success: true, directiveText: result.directiveText, questIds };
  } catch (error) {
    console.error('submitMorningCheckin error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function submitEveningClose(
  closeEnergy: number,
  dayNote: string,
  status: 'all-complete' | 'failed'
): Promise<void> {
  const checkin = await getTodayCheckin();
  if (!checkin) return;

  await updateCheckin(checkin.id, {
    closeEnergy,
    dayNote,
    status: status === 'all-complete' ? 'complete' : 'failed',
  });

  revalidatePath('/directive');
  revalidatePath('/ledger');
}
