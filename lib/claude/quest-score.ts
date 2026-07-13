import { getGroqClient } from './client';
import { SYSTEM_PERSONA } from './prompts';

export interface ProofSubmission {
  questTitle: string;
  questBrief: string;
  proofStandard: string;
  proofType: string;
  proofText?: string;
  proofUrl?: string;
  wordCount?: number;
}

export interface ScoringResult {
  approved: boolean;
  xpAwarded: number;
  xpBase: number;
  feedback: string;  // cold, judicial 1-2 sentence assessment
}

export async function scoreQuestProof(
  submission: ProofSubmission,
  xpBase: number
): Promise<ScoringResult> {
  const client = getGroqClient();

  const userPrompt = `Evaluate this quest proof submission. Be exacting. The standard is the standard.

QUEST: ${submission.questTitle}
BRIEF: ${submission.questBrief}
PROOF STANDARD: ${submission.proofStandard}
PROOF TYPE REQUIRED: ${submission.proofType}

SUBMITTED PROOF:
${submission.proofText ? `Text (${submission.wordCount || 0} words):\n${submission.proofText.substring(0, 500)}` : ''}
${submission.proofUrl ? `URL/Link: ${submission.proofUrl}` : ''}

OUTPUT JSON only:
{
  "approved": true|false,
  "xpMultiplier": 0.5|0.75|1.0|1.25,
  "feedback": "1-2 sentence cold assessment of the proof quality"
}

Rules:
- approved=false if proof is clearly inadequate (missing proof type, too short, irrelevant)
- xpMultiplier: 1.25 for exceptional, 1.0 for meets standard, 0.75 for barely adequate, 0.5 for minimum
- Never give positive feedback with exclamation marks. State what was adequate or inadequate.`;

  const response = await client.chat.completions.create({
    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    max_tokens: 256,
    messages: [
      { role: 'system', content: SYSTEM_PERSONA },
      { role: 'user', content: userPrompt },
    ],
  });

  const text = response.choices[0].message.content || '{}';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return { approved: false, xpAwarded: 0, xpBase, feedback: 'Proof not evaluated.' };

  const { approved, xpMultiplier, feedback } = JSON.parse(jsonMatch[0]);
  return {
    approved: approved ?? false,
    xpBase,
    xpAwarded: approved ? Math.round(xpBase * (xpMultiplier ?? 1.0)) : 0,
    feedback: feedback ?? 'No assessment available.',
  };
}
