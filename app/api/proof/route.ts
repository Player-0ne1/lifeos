import type { NextRequest } from 'next/server';
import { scoreQuestProof } from '@/lib/claude/quest-score';
import type { ProofSubmission } from '@/lib/claude/quest-score';

export async function POST(request: NextRequest) {
  let body: ProofSubmission & { xpBase?: number };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  try {
    const result = await scoreQuestProof(body, body.xpBase ?? 40);
    return Response.json(result);
  } catch (error) {
    console.error('proof scoring error:', error);
    return Response.json({ error: 'Scoring failed' }, { status: 500 });
  }
}
