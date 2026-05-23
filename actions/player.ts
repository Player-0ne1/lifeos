'use server';
import { revalidatePath } from 'next/cache';
import { updatePlayerProfile } from '@/lib/notion/player';
import { cookies } from 'next/headers';

export async function updatePlayerSettingsAction(updates: {
  name?: string;
  penaltyAmount?: number;
}): Promise<void> {
  await updatePlayerProfile(updates);
  revalidatePath('/settings');
  revalidatePath('/');
}

export async function setThemeAction(theme: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('ls-theme', theme, { path: '/', maxAge: 365 * 24 * 3600 });
}

export async function setVoiceAction(voice: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('ls-voice', voice, { path: '/', maxAge: 365 * 24 * 3600 });
}

export async function setDensityAction(density: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('ls-density', density, { path: '/', maxAge: 365 * 24 * 3600 });
}
