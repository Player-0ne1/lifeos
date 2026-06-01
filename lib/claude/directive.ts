import { getAnthropicClient } from './client';
import { SYSTEM_PERSONA, getVoiceInstruction, VoiceMode } from './prompts';
import type { PlayerProfile, CharacterStat, QuestTemplate, DailyCheckin } from '../notion/types';

export interface DirectiveResult {
  directiveText: string;       // 2-3 sentence "THE SYSTEM SAYS" declaration
  mandatoryQuests: SelectedQuest[];  // exactly 3
  bonusQuest: SelectedQuest;         // exactly 1
  systemVoice: string;         // post-checkin voice line
}

export interface SelectedQuest {
  libraryItemId?: string;
  title: string;
  stat: string;
  xp: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  brief: string;
  proofStandard: string;
  proofType: string;
  isBonus?: boolean;
}

export async function generateDirective(
  player: PlayerProfile,
  stats: CharacterStat[],
  checkin: Pick<DailyCheckin, 'energy' | 'constraints' | 'mindNote'>,
  library: QuestTemplate[],
  voice: VoiceMode = 'cold'
): Promise<DirectiveResult> {
  const client = getAnthropicClient();

  const statsContext = stats.map(s =>
    `${s.stat}: ${s.score}/100${s.decayDays >= 10 ? ` (DORMANT ${s.decayDays} days — CRITICAL)` : s.decayDays >= 5 ? ` (dormant ${s.decayDays} days)` : ''}`
  ).join('\n');

  const libraryContext = library.map(q =>
    `[${q.stat}/${q.difficulty}] "${q.title}" — ${q.xpValue}XP — Proof: ${q.proofStandard}`
  ).join('\n');

  const prompt = `${getVoiceInstruction(voice)}

PLAYER STATE:
- Name: ${player.name}
- Level: ${player.level} | Day: ${player.day} | Streak: ${player.streak}
- Today's energy: ${checkin.energy}/5
- Constraints/notes: ${checkin.constraints || 'None'}
- Mind state: ${checkin.mindNote || 'None'}

CURRENT STATS:
${statsContext}

AVAILABLE QUESTS FROM LIBRARY:
${libraryContext}

OUTPUT FORMAT (JSON only, no other text):
{
  "directiveText": "2-3 sentence THE SYSTEM declaration for today. Cold. Based on player state and stat gaps.",
  "systemVoice": "1 short line reacting to today's energy level. Mildly sardonic if energy is low.",
  "mandatoryQuests": [
    {
      "title": "...",
      "stat": "CRAFT|BUILDER|CAPITAL|BODY|MIND|SIGNAL|ART",
      "xp": 20|40|60,
      "difficulty": "Easy|Medium|Hard",
      "brief": "specific brief for today, not generic",
      "proofStandard": "exact proof requirement",
      "proofType": "Text paste|Screenshot|Health screenshot|Link"
    }
    // exactly 3 mandatory quests
  ],
  "bonusQuest": { same shape as above }
}

SELECTION RULES:
1. Prioritize stats with highest decay (days dormant). If SIGNAL is dormant 13+ days, assign a SIGNAL quest.
2. Balance across stats — don't assign 2 quests to same stat unless decay demands it.
3. Match quest difficulty to energy: energy 1-2 → mostly Easy, energy 3 → Mix, energy 4-5 → Hard+Medium.
4. Make the brief specific and personal — reference the player's actual projects (PickleJam, Substack, GT Cup, corpus).
5. Bonus quest should be a different stat from all 3 mandatory quests.`;

  const response = await client.messages.create({
    model: (process.env.CLAUDE_MODEL || 'claude-sonnet-4-5') as string,
    max_tokens: 1024,
    system: [
      {
        type: 'text',
        text: SYSTEM_PERSONA,
        cache_control: { type: 'ephemeral' },
      }
    ],
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';

  // Parse JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON in Claude response');

  const result = JSON.parse(jsonMatch[0]);
  return result as DirectiveResult;
}
