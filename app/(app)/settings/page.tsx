import { cookies } from 'next/headers';
import SettingsClient from '@/components/settings/SettingsClient';
import { getPlayerProfile } from '@/lib/notion/player';
import type { ThemeKey, VoiceKey, DensityKey } from '@/lib/theme';

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const themeKey = (cookieStore.get('ls-theme')?.value ?? 'vellum') as ThemeKey;
  const voiceKey = (cookieStore.get('ls-voice')?.value ?? 'cold') as VoiceKey;
  const densityKey = (cookieStore.get('ls-density')?.value ?? 'comfortable') as DensityKey;

  let player = null;
  try {
    player = await getPlayerProfile();
  } catch {
    player = { name: 'ONE', level: 1, day: 1, streak: 0 };
  }

  return (
    <SettingsClient
      player={player}
      currentTheme={themeKey}
      currentVoice={voiceKey}
      currentDensity={densityKey}
    />
  );
}
