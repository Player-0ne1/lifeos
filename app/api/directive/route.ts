import type { NextRequest } from 'next/server';
import { getGroqClient } from '@/lib/claude/client';
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

    const client = getGroqClient();

    const statsContext = stats
      .map(s =>
        `${s.stat}: ${s.score}/100${s.decayDays >= 10 ? ` (DORMANT ${s.decayDays}d)` : ''}`
      )
      .join('\n');

    const libraryContext = library
      .map(q => `[${q.stat}/${q.difficulty}] "${q.title}" — ${q.xpValue}XP`)
      .join('\n');

    const stream = await client.chat.completions.create({
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      max_tokens: 1024,
      stream: true,
      messages: [
        { role: 'system', content: SYSTEM_PERSONA },
        {
          role: 'user',
          content: `Generate a directive for Day ${player.day}. Energy: ${energy}/5. Stats:\n${statsContext}\nConstraints: ${constraints || 'None'}. Mind: ${mindNote || 'None'}.\n\nAvailable quests:\n${libraryContext}\n\nReturn JSON: { directiveText, systemVoice, mandatoryQuests: [3 quests], bonusQuest }`,
        },
      ],
    });

    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || '';
          if (text) controller.enqueue(new TextEncoder().encode(text));
        }
        controller.close();
      },
    });

    return new Response(readableStream, {
      headers: { 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('directive stream error:', error);
    return Response.json({ error: 'Generation failed' }, { status: 500 });
  }
}
