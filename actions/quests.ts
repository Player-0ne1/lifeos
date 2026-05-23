'use server';
import { revalidatePath } from 'next/cache';
import { updateQuestStatus, getQuestById } from '@/lib/notion/quests';
import { scoreQuestProof } from '@/lib/claude/quest-score';
import { addStatHistoryEntry } from '@/lib/notion/stats';
import { updateCharacterStat, getCharacterStats } from '@/lib/notion/player';
import { todayIST, wordCount } from '@/lib/utils';

export async function completeQuest(
  questId: string,
  proofText?: string,
  proofUrl?: string
): Promise<{ xpAwarded: number }> {
  const quest = await getQuestById(questId);
  if (!quest) return { xpAwarded: 0 };

  await updateQuestStatus(questId, 'complete', {
    proofText,
    proofUrl,
  });

  // Log stat history
  const stats = await getCharacterStats();
  const stat = stats.find(s => s.stat === quest.stat);
  if (stat) {
    const newScore = Math.min(100, stat.score + quest.points);
    await updateCharacterStat(quest.stat, newScore);
    await addStatHistoryEntry({
      stat: quest.stat,
      score: newScore,
      date: todayIST(),
      delta: quest.points,
      reason: `Quest: ${quest.title}`,
    });
  }

  revalidatePath('/directive');
  revalidatePath('/character');
  return { xpAwarded: quest.xp };
}

export async function failQuest(questId: string): Promise<void> {
  await updateQuestStatus(questId, 'failed');
  revalidatePath('/directive');
}

export async function submitProof(
  questId: string,
  text: string,
  url: string,
  wc: number
): Promise<{ approved: boolean; xpAwarded: number; feedback: string }> {
  const quest = await getQuestById(questId);
  if (!quest) return { approved: false, xpAwarded: 0, feedback: 'Quest not found.' };

  const result = await scoreQuestProof(
    {
      questTitle: quest.title,
      questBrief: quest.brief,
      proofStandard: quest.proofStandard,
      proofType: quest.proofType,
      proofText: text,
      proofUrl: url,
      wordCount: wc,
    },
    quest.xp
  );

  if (result.approved) {
    await updateQuestStatus(questId, 'complete', { proofText: text, proofUrl: url });

    const stats = await getCharacterStats();
    const stat = stats.find(s => s.stat === quest.stat);
    if (stat) {
      const newScore = Math.min(100, stat.score + quest.points);
      await updateCharacterStat(quest.stat, newScore);
      await addStatHistoryEntry({
        stat: quest.stat,
        score: newScore,
        date: todayIST(),
        delta: quest.points,
        reason: `Quest proof: ${quest.title}`,
      });
    }
  }

  revalidatePath('/directive');
  return result;
}
