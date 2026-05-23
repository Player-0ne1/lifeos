'use client';
import { type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '@/components/providers/AppProvider';

// ─── Player data type ─────────────────────────────────────────────────────────

export interface PlayerData {
  name: string;
  level: number;
  day: number;
  streak: number;
}

// ─── Tabs config ──────────────────────────────────────────────────────────────

interface TabDef {
  key: string;
  label: string;
  glyph: string;
  href: string;
}

const TABS: TabDef[] = [
  { key: 'directive', label: 'Directive', glyph: 'I',   href: '/directive' },
  { key: 'character', label: 'Character', glyph: 'II',  href: '/character' },
  { key: 'quests',    label: 'Quests',    glyph: 'III', href: '/quests' },
  { key: 'ledger',    label: 'Ledger',    glyph: 'IV',  href: '/ledger' },
  { key: 'settings',  label: 'Settings',  glyph: '⚙',  href: '/settings' },
];

// ─── PhoneHeader ──────────────────────────────────────────────────────────────

interface PhoneHeaderProps {
  player?: PlayerData;
}

export function PhoneHeader({ player }: PhoneHeaderProps) {
  const { theme, voice, density } = useApp();
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `${density.padCard * 0.7}px ${density.padScreen}px`,
        borderBottom: `1px solid ${theme.rule}`,
        background: theme.surface,
        flexShrink: 0,
        minHeight: 48,
      }}
    >
      <div>
        <div
          className="ls-mono"
          style={{
            fontSize: density.fontMeta,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: theme.accent,
            lineHeight: 1,
          }}
        >
          {voice.appName}
        </div>
        {player && (
          <div
            className="ls-mono"
            style={{
              fontSize: density.fontMeta - 1,
              color: theme.inkMute,
              marginTop: 1,
            }}
          >
            Lv.{player.level} · Day {player.day}
          </div>
        )}
      </div>
      {player && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ textAlign: 'right' }}>
            <div
              className="ls-mono"
              style={{ fontSize: density.fontMeta, color: theme.inkDim }}
            >
              {player.streak}d streak
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PhoneTabBar ──────────────────────────────────────────────────────────────

export function PhoneTabBar() {
  const { theme, density } = useApp();
  const router = useRouter();
  const pathname = usePathname();

  const activeKey = TABS.find(
    (t) => pathname === t.href || pathname?.startsWith(t.href + '/'),
  )?.key ?? 'directive';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'stretch',
        borderTop: `1px solid ${theme.rule}`,
        background: theme.surface,
        flexShrink: 0,
        height: 56,
      }}
    >
      {TABS.map((tab) => {
        const isActive = tab.key === activeKey;
        return (
          <button
            key={tab.key}
            onClick={() => router.push(tab.href)}
            className="ls-press"
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              background: 'none',
              border: 'none',
              borderTop: `2px solid ${isActive ? theme.accent : 'transparent'}`,
              cursor: 'pointer',
              padding: '6px 0',
            }}
          >
            <span
              className="ls-mono"
              style={{
                fontSize: 11,
                color: isActive ? theme.accent : theme.inkMute,
                letterSpacing: '0.04em',
              }}
            >
              {tab.glyph}
            </span>
            <span
              className="ls-mono"
              style={{
                fontSize: density.fontMeta - 1,
                color: isActive ? theme.accent : theme.inkMute,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── DesktopSidebar ───────────────────────────────────────────────────────────

interface DesktopSidebarProps {
  player?: PlayerData;
}

export function DesktopSidebar({ player }: DesktopSidebarProps) {
  const { theme, voice, density } = useApp();
  const pathname = usePathname();

  const activeKey = TABS.find(
    (t) => pathname === t.href || pathname?.startsWith(t.href + '/'),
  )?.key ?? 'directive';

  return (
    <div
      style={{
        width: 200,
        display: 'flex',
        flexDirection: 'column',
        background: theme.surface,
        borderRight: `1px solid ${theme.rule}`,
        flexShrink: 0,
        height: '100%',
      }}
    >
      {/* App name */}
      <div
        style={{
          padding: `${density.padScreen}px ${density.padCard}px ${density.padCard}px`,
          borderBottom: `1px solid ${theme.rule}`,
        }}
      >
        <div
          className="ls-mono"
          style={{
            fontSize: density.fontMeta,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: theme.accent,
          }}
        >
          {voice.appName}
        </div>
        <div
          className="ls-mono"
          style={{
            fontSize: density.fontMeta - 1.5,
            color: theme.inkFaint,
            marginTop: 2,
            letterSpacing: '0.04em',
          }}
        >
          {voice.appSub}
        </div>
      </div>

      {/* Player info */}
      {player && (
        <div
          style={{
            padding: `${density.padCard}px`,
            borderBottom: `1px solid ${theme.rule2}`,
          }}
        >
          <div style={{ fontSize: density.fontBody, color: theme.ink, marginBottom: 2 }}>
            {player.name}
          </div>
          <div
            className="ls-mono"
            style={{ fontSize: density.fontMeta, color: theme.inkMute }}
          >
            Lv.{player.level} · Day {player.day} · {player.streak}d streak
          </div>
        </div>
      )}

      {/* Nav links */}
      <nav style={{ flex: 1, padding: `${density.gap}px 0` }}>
        {TABS.map((tab) => {
          const isActive = tab.key === activeKey;
          return (
            <Link
              key={tab.key}
              href={tab.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: `10px ${density.padCard}px`,
                textDecoration: 'none',
                background: isActive ? `${theme.accent}14` : 'transparent',
                borderLeft: `2px solid ${isActive ? theme.accent : 'transparent'}`,
                transition: 'background 120ms ease',
              }}
            >
              <span
                className="ls-mono"
                style={{
                  fontSize: density.fontMeta,
                  color: isActive ? theme.accent : theme.inkMute,
                  width: 20,
                  textAlign: 'center',
                  letterSpacing: '0.04em',
                }}
              >
                {tab.glyph}
              </span>
              <span
                className="ls-mono"
                style={{
                  fontSize: density.fontMeta,
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                  color: isActive ? theme.accent : theme.inkDim,
                }}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

// ─── AppChrome ────────────────────────────────────────────────────────────────

interface AppChromeProps {
  children: ReactNode;
  player?: PlayerData;
  hideNav?: boolean;
}

export function AppChrome({ children, player, hideNav = false }: AppChromeProps) {
  const { theme, flash } = useApp();

  return (
    <div
      className={flash === 'invert' ? 'ls-invert' : undefined}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        maxWidth: '100vw',
        overflow: 'hidden',
        background: theme.bg,
        color: theme.ink,
        // Desktop: row layout
        // Phone: column layout (default)
      }}
    >
      {/* Desktop layout: sidebar + content */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
        }}
      >
        {/* Desktop sidebar – hidden on mobile via inline approach */}
        {!hideNav && (
          <>
            {/* Desktop sidebar (shown via CSS media but we use JS width trick) */}
            <DesktopSidebarResponsive player={player} />
          </>
        )}

        {/* Main content column */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Phone header (shown only on mobile) */}
          {!hideNav && <PhoneHeaderResponsive player={player} />}

          {/* Page content */}
          <main
            style={{
              flex: 1,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {children}
          </main>

          {/* Phone tab bar (shown only on mobile) */}
          {!hideNav && <PhoneTabBarResponsive />}
        </div>
      </div>
    </div>
  );
}

// Responsive wrappers using CSS media queries via style tags
function DesktopSidebarResponsive({ player }: { player?: PlayerData }) {
  return (
    <>
      <style>{`
        .ls-desktop-sidebar { display: none; }
        @media (min-width: 768px) {
          .ls-desktop-sidebar { display: flex; }
        }
      `}</style>
      <div className="ls-desktop-sidebar">
        <DesktopSidebar player={player} />
      </div>
    </>
  );
}

function PhoneHeaderResponsive({ player }: { player?: PlayerData }) {
  return (
    <>
      <style>{`
        .ls-phone-header { display: flex; }
        @media (min-width: 768px) {
          .ls-phone-header { display: none; }
        }
      `}</style>
      <div className="ls-phone-header" style={{ flexDirection: 'column' }}>
        <PhoneHeader player={player} />
      </div>
    </>
  );
}

function PhoneTabBarResponsive() {
  return (
    <>
      <style>{`
        .ls-phone-tabbar { display: flex; flex-direction: column; }
        @media (min-width: 768px) {
          .ls-phone-tabbar { display: none; }
        }
      `}</style>
      <div className="ls-phone-tabbar">
        <PhoneTabBar />
      </div>
    </>
  );
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export { TABS };
export type { TabDef };

export default {
  AppChrome,
  PhoneTabBar,
  PhoneHeader,
  DesktopSidebar,
  TABS,
};
