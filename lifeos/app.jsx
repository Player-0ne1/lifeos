// app.jsx — LifeOS main app composition.
// Renders the active tab. Hosts the failure-flash overlay. Hosts flow overlays.

function LifeOSApp({ device }) {
  const { theme, route, flash, dayState } = useApp();

  // Onboarding takes over completely
  if (dayState === 'onboarding') {
    return <OnboardingFlow device={device} />;
  }

  return <AppChrome device={device}>
    {device === 'phone' ? <PhoneHeader /> : <DesktopSidebar />}
    <div className={flash === 'invert' ? 'ls-invert' : ''} style={{ flex: 1, minWidth: 0, position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {route.tab === 'directive' && <DirectiveTab device={device} />}
        {route.tab === 'character' && <CharacterTab device={device} />}
        {route.tab === 'quests'    && <QuestsTab    device={device} />}
        {route.tab === 'ledger'    && <LedgerTab    device={device} />}
      </div>
      {device === 'phone' && <PhoneTabBar />}
    </div>
    <FlowOverlay device={device} />
  </AppChrome>;
}

// ── Tweaks Panel ────────────────────────────────────────────────────────────
function TweaksUI() {
  const { themeKey, voiceKey, densityKey, dayState, setDayState } = useApp();
  // we need to set the parent tweaks
  return null; // panel mounted at root with its own state
}

Object.assign(window, { LifeOSApp });
