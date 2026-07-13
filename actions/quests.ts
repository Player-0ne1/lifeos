'use server';
import { revalidatePath } from 'next/cache';
import { updateQuestStatus, getQuestById } from '@/lib/notion/quests';
import { scoreQuestProof } from '@/lib/claude/quest-score';
import { addStatHistoryEntry } from '@/lib/notion/stats';
import { updateCharacterStat, getCharacterStats } from '@/lib/notion/player';
import { todayIST } from '@/lib/utils';

export async function completeQuest(
  questId: string,
  proofText?: string,
  proofUrl?: string
): Promise<{ success: boolean; xpAwarded: number; error?: string }> {
  try {
    const quest = await getQuestById(questId);
    if (!quest) return { success: false, xpAwarded: 0, error: 'Quest not found.' };

    await updateQuestStatus(questId, 'complete', { proofText, proofUrl });

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
    return { success: true, xpAwarded: quest.xp };
  } catch (error) {
    console.error('completeQuest error:', error);
    return { success: false, xpAwarded: 0, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function failQuest(questId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await updateQuestStatus(questId, 'failed');
    revalidatePath('/directive');
    return { success: true };
  } catch (error) {
    console.error('failQuest error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function submitProof(
  questId: string,
  text: string,
  url: string,
  wc: number
): Promise<{ success: boolean; approved: boolean; xpAwarded: number; feedback: string; error?: string }> {
  try {
    const quest = await getQuestById(questId);
    if (!quest) return { success: false, approved: false, xpAwarded: 0, feedback: 'Quest not found.' };

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
    return { success: true, ...result };
  } catch (error) {
    console.error('submitProof error:', error);
    return {
      success: false,
      approved: false,
      xpAwarded: 0,
      feedback: 'Submission failed — Notion or Claude unreachable.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
