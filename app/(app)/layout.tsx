import { cookies } from 'next/headers';
import { AppProvider } from '@/components/providers/AppProvider';
import { AppChrome } from '@/components/nav';
import { getPlayerProfile } from '@/lib/notion/player';
import type { ThemeKey, VoiceKey, DensityKey } from '@/lib/theme';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const themeKey = (cookieStore.get('ls-theme')?.value ?? 'vellum') as ThemeKey;
  const voiceKey = (cookieStore.get('ls-voice')?.value ?? 'cold') as VoiceKey;
  const densityKey = (cookieStore.get('ls-density')?.value ?? 'comfortable') as DensityKey;

  // Gracefully handle case where Notion isn't configured yet
  let player;
  try {
    player = await getPlayerProfile();
  } catch {
    player = { id: 'fallback', name: 'ONE', level: 1, totalXP: 0, xpToNext: 500, day: 1, streak: 0, bestStreak: 0 };
  }

  return (
    <AppProvider
      initialTheme={themeKey}
      initialVoice={voiceKey}
      initialDensity={densityKey}
    >
      <AppChrome player={player}>
        {children}
      </AppChrome>
    </AppProvider>
  );
}
