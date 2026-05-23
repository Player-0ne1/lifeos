import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import './globals.css';
import { THEMES, DENSITY, type ThemeKey, type DensityKey, themeToCssVars } from '@/lib/theme';

export const metadata: Metadata = {
  title: 'THE SYSTEM · LifeOS',
  description: 'Sovereign Polymath Protocol',
  icons: { icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⬡</text></svg>' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#17140f',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const themeKey = (cookieStore.get('ls-theme')?.value ?? 'vellum') as ThemeKey;
  const densityKey = (cookieStore.get('ls-density')?.value ?? 'comfortable') as DensityKey;

  const theme = THEMES[themeKey] ?? THEMES.vellum;
  const density = DENSITY[densityKey] ?? DENSITY.comfortable;

  const cssVars = {
    ...themeToCssVars(theme),
    '--ls-font-body': `${density.fontBody}px`,
    '--ls-font-meta': `${density.fontMeta}px`,
    '--ls-font-head': `${density.fontHead}px`,
    '--ls-font-display': `${density.fontDisplay}px`,
    '--ls-pad-card': `${density.padCard}px`,
    '--ls-pad-screen': `${density.padScreen}px`,
    '--ls-row-height': `${density.rowHeight}px`,
    '--ls-gap': `${density.gap}px`,
  };

  return (
    <html lang="en" data-theme={themeKey} style={cssVars as React.CSSProperties}>
      <body>{children}</body>
    </html>
  );
}
