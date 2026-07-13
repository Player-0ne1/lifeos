import { getGroqClient } from './client';
import { SYSTEM_PERSONA } from './prompts';
import type { Skill } from '../notion/types';

export async function generateSkillDeliverable(
  skill: Skill,
  playerContext: { name: string; statScore: number; recentWork?: string }
): Promise<string> {
  const client = getGroqClient();

  const skillPrompts: Record<string, string> = {
    'The Sharpener': `Generate 3 specific, observational writing insights for ${playerContext.name} based on their CRAFT stat (score: ${playerContext.statScore}/100). These should be craft-level observations about their writing: clarity, precision, rhythm, word choice. Cold and specific. No generic advice. Each observation in 1 sentence.`,
    'The Scoper': `Generate a brief scope document template for a consulting engagement. Professional, structured. 5 sections: Objective, Deliverables, Timeline, Constraints, Success Metric. Each section 1-2 sentences.`,
    'The Spotter': `Identify 3 specific outreach targets for ${playerContext.name} (SIGNAL score: ${playerContext.statScore}/100). These should be real categories of people in: tech, GT Cup racing community, investment/finance. Each target: Name category, Why relevant, Suggested opening angle.`,
    'The Ledger': `Generate a monthly P&L summary template for a solo knowledge worker. Include: Income categories, Expense categories, Savings rate target, Corpus progress metric. Terse, accounting style.`,
  };

  const basePrompt = skillPrompts[skill.name] || `Generate a skill deliverable for: ${skill.name}. Stat: ${skill.stat}. Description: ${skill.description}`;

  const response = await client.chat.completions.create({
    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    max_tokens: 512,
    messages: [
      { role: 'system', content: SYSTEM_PERSONA },
      { role: 'user', content: basePrompt },
    ],
  });

  return response.choices[0].message.content || '';
}
