// nav.jsx — top app chrome and bottom tab bar (phone) + sidebar (desktop).

function AppChrome({ children, device }) {
  const { theme, voice, data, density } = useApp();
  return <div className="ls-app" style={{
    width: '100%', height: '100%', background: theme.bg, color: theme.ink,
    display: 'flex', flexDirection: device === 'phone' ? 'column' : 'row',
    fontSize: density.fontBody,
    position: 'relative', overflow: 'hidden',
  }}>{children}</div>;
}

// ── Phone: bottom tabs ──────────────────────────────────────────────────────
const TABS = [
  { key: 'directive', label: 'Directive', glyph: 'I' },
  { key: 'character', label: 'Character', glyph: 'II' },
  { key: 'quests',    label: 'Quests',    glyph: 'III' },
  { key: 'ledger',    label: 'Ledger',    glyph: 'IV' },
];

function PhoneTabBar() {
  const { theme, route, setRoute } = useApp();
  return <div style={{
    display: 'flex', borderTop: `1px solid ${theme.rule}`, background: theme.surface,
    padding: '8px 0 14px',
  }}>
    {TABS.map(t => {
      const active = route.tab === t.key;
      return <button key={t.key} onClick={() => setRoute({ tab: t.key, sub: null, params: {} })}
        className="ls-press"
        style={{
          flex: 1, background: 'transparent', border: 'none', padding: '4px 4px',
          color: active ? theme.ink : theme.inkMute, cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
        }}>
        <span className="ls-mono" style={{ fontSize: 10, letterSpacing: '0.18em', fontWeight: 500 }}>{t.glyph}</span>
        <span style={{ fontSize: 11, letterSpacing: '0.02em', fontFamily: 'Newsreader, serif' }}>{t.label}</span>
      </button>;
    })}
  </div>;
}

function PhoneHeader() {
  const { theme, voice, data } = useApp();
  return <div style={{
    padding: '14px 18px 12px', borderBottom: `1px solid ${theme.rule}`,
    background: theme.bg, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
  }}>
    <div>
      <div className="ls-mono" style={{
        fontSize: 10, letterSpacing: '0.24em', color: theme.inkMute,
      }}>{voice.appName}</div>
      <div style={{ fontFamily: 'Newsreader, serif', fontSize: 13, color: theme.inkDim, marginTop: 2, fontStyle: 'italic', fontWeight: 300 }}>
        {voice.appSub}
      </div>
    </div>
    <Mono dim size={10} style={{ letterSpacing: '0.14em' }}>
      DAY <span style={{ color: 'inherit' }}>{String(data.player.day).padStart(2,'0')}</span> · LVL {data.player.level}
    </Mono>
  </div>;
}

// ── Desktop: sidebar ───────────────────────────────────────────────────────
function DesktopSidebar() {
  const { theme, voice, data, route, setRoute } = useApp();
  return <div style={{
    width: 220, flexShrink: 0, borderRight: `1px solid ${theme.rule}`,
    background: theme.surface,
    display: 'flex', flexDirection: 'column',
  }}>
    <div style={{ padding: '24px 22px 20px', borderBottom: `1px solid ${theme.rule}` }}>
      <div className="ls-mono" style={{ fontSize: 10, letterSpacing: '0.28em', color: theme.ink, fontWeight: 600 }}>
        {voice.appName}
      </div>
      <div style={{ fontFamily: 'Newsreader, serif', fontSize: 13, fontStyle: 'italic', color: theme.inkDim, marginTop: 4, fontWeight: 300 }}>
        {voice.appSub}
      </div>
    </div>
    <div style={{ padding: '18px 0', flex: 1 }}>
      {TABS.map(t => {
        const active = route.tab === t.key;
        return <button key={t.key} onClick={() => setRoute({ tab: t.key, sub: null, params: {} })}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            width: '100%', padding: '10px 22px',
            color: active ? theme.ink : theme.inkDim,
            display: 'flex', alignItems: 'baseline', gap: 12, textAlign: 'left',
            borderLeft: `2px solid ${active ? theme.accent : 'transparent'}`,
          }}>
          <span className="ls-mono" style={{ fontSize: 10, letterSpacing: '0.18em', minWidth: 24, color: active ? theme.accent : theme.inkMute }}>
            {t.glyph}
          </span>
          <span style={{ fontFamily: 'Newsreader, serif', fontSize: 16, letterSpacing: '-0.005em' }}>{t.label}</span>
        </button>;
      })}
    </div>
    <div style={{ padding: '18px 22px', borderTop: `1px solid ${theme.rule}` }}>
      <Meta>Player</Meta>
      <div style={{ marginTop: 4, fontFamily: 'Newsreader, serif', fontSize: 18, color: theme.ink }}>
        {data.player.name} <span className="ls-mono" style={{ fontSize: 11, color: theme.inkMute, letterSpacing: '0.1em' }}>· LVL {data.player.level}</span>
      </div>
      <Mono dim size={10} style={{ letterSpacing: '0.14em', display: 'block', marginTop: 4 }}>
        DAY {String(data.player.day).padStart(3,'0')} · STREAK {data.player.streak}
      </Mono>
    </div>
  </div>;
}

Object.assign(window, { AppChrome, PhoneTabBar, PhoneHeader, DesktopSidebar });
