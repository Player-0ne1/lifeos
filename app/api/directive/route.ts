import type { NextRequest } from 'next/server';
import { getAnthropicClient } from '@/lib/claude/client';
import { SYSTEM_PERSONA } from '@/lib/claude/prompts';
import { getPlayerProfile, getCharacterStats } from '@/lib/notion/player';
import { getQuestLibrary } from '@/lib/notion/quests';

export async function POST(request: NextRequest) {
  const { energy, constraints, mindNote } = await request.json();

  try {
    const [player, stats, library] = await Promise.all([
      getPlayerProfile(),
      getCharacterStats(),
      getQuestLibrary(),
    ]);

    const client = getAnthropicClient();

    const statsContext = stats
      .map(s =>
        `${s.stat}: ${s.score}/100${s.decayDays >= 10 ? ` (DORMANT ${s.decayDays}d)` : ''}`
      )
      .join('\n');

    const libraryContext = library
      .map(q => `[${q.stat}/${q.difficulty}] "${q.title}" — ${q.xpValue}XP`)
      .join('\n');

    const stream = await client.messages.stream({
      model: 'claude-opus-4-7',
      max_tokens: 1024,
      system: SYSTEM_PERSONA,
      messages: [
        {
          role: 'user',
          content: `Generate a directive for Day ${player.day}. Energy: ${energy}/5. Stats:\n${statsContext}\nConstraints: ${constraints || 'None'}. Mind: ${mindNote || 'None'}.\n\nAvailable quests:\n${libraryContext}\n\nReturn JSON: { directiveText, systemVoice, mandatoryQuests: [3 quests], bonusQuest }`,
        },
      ],
    });

    return new Response(stream.toReadableStream(), {
      headers: { 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('directive stream error:', error);
    return Response.json({ error: 'Generation failed' }, { status: 500 });
  }
}
