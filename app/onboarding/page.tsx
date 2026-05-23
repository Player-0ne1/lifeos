import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import OnboardingClient from '@/components/onboarding/OnboardingClient';
import { THEMES, VOICE, type ThemeKey, type VoiceKey, type DensityKey } from '@/lib/theme';
import { AppProvider } from '@/components/providers/AppProvider';

export default async function OnboardingPage() {
  const cookieStore = await cookies();
  const themeKey = (cookieStore.get('ls-theme')?.value ?? 'vellum') as ThemeKey;
  const voiceKey = (cookieStore.get('ls-voice')?.value ?? 'cold') as VoiceKey;
  const densityKey = (cookieStore.get('ls-density')?.value ?? 'comfortable') as DensityKey;

  return (
    <AppProvider
      initialTheme={themeKey}
      initialVoice={voiceKey}
      initialDensity={densityKey}
      initialDayState="onboarding"
    >
      <OnboardingClient />
    </AppProvider>
  );
}
