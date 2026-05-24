// primitives.jsx — Shared UI primitives for LifeOS.
// Disciplined, ledger-coded. Cards have rules, not rounded corners.

const { useState: useS, useEffect: useE, useMemo: useM, useRef: useR } = React;

// ── Small atoms ─────────────────────────────────────────────────────────────

function Rule({ kind = 'solid', color, style }) {
  const { theme } = useApp();
  const c = color || theme.rule;
  if (kind === 'dash') return <div style={{ color: c, ...style }} className="ls-rule-dash" />;
  if (kind === 'double') return <div style={{ color: c, ...style }} className="ls-rule-double" />;
  return <div style={{ height: 1, background: c, width: '100%', ...style }} />;
}

function Mono({ children, style, dim, size, bold }) {
  const { theme } = useApp();
  return <span className="ls-mono" style={{
    color: dim ? theme.inkDim : 'inherit',
    fontSize: size,
    fontWeight: bold ? 600 : 400,
    letterSpacing: '0.01em',
    ...style,
  }}>{children}</span>;
}

function Meta({ children, style }) {
  const { theme, density } = useApp();
  return <div className="ls-mono" style={{
    fontSize: density.fontMeta,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: theme.inkMute,
    ...style,
  }}>{children}</div>;
}

function Pill({ children, color, bg, border, style }) {
  const { theme } = useApp();
  return <span className="ls-mono" style={{
    display: 'inline-flex', alignItems: 'center', gap: 6,
    fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
    padding: '3px 8px',
    border: `1px solid ${border || theme.rule}`,
    color: color || theme.inkDim,
    background: bg || 'transparent',
    borderRadius: 2,
    ...style,
  }}>{children}</span>;
}

// Procedural button. Sharp corners. Two variants: 'primary' (filled accent),
// 'ghost' (outline only). No drop shadows, no hover lifts.
function Btn({ children, onClick, variant = 'ghost', danger, full, size = 'md', disabled, style }) {
  const { theme } = useApp();
  const isPrimary = variant === 'primary';
  const color = danger ? theme.danger : (isPrimary ? theme.bg : theme.ink);
  const bg = isPrimary ? (danger ? theme.danger : theme.ink) : 'transparent';
  const border = isPrimary ? bg : (danger ? theme.danger : theme.rule);
  const pad = size === 'sm' ? '6px 12px' : size === 'lg' ? '14px 22px' : '10px 16px';
  return <button
    className="ls-press ls-mono"
    onClick={onClick}
    disabled={disabled}
    style={{
      appearance: 'none', border: `1px solid ${border}`, background: bg, color,
      padding: pad, letterSpacing: '0.16em', fontSize: 11, fontWeight: 500,
      textTransform: 'uppercase', width: full ? '100%' : 'auto',
      borderRadius: 0, ...style,
    }}>
    {children}
  </button>;
}

// A pressable list-row chevron control.
function RowLink({ children, right, onClick, style }) {
  const { theme, density } = useApp();
  return <button onClick={onClick} className="ls-press" style={{
    appearance: 'none', border: 'none', background: 'transparent', color: 'inherit',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
    padding: `${density.padCard - 4}px 0`,
    borderBottom: `1px solid ${theme.rule2}`,
    width: '100%', textAlign: 'left',
    fontSize: density.fontBody,
    ...style,
  }}>
    <span style={{ flex: 1 }}>{children}</span>
    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {right && <span style={{ color: theme.inkDim }}>{right}</span>}
      <span style={{ color: theme.inkMute, fontFamily: 'JetBrains Mono, monospace' }}>›</span>
    </span>
  </button>;
}

// ── Card ────────────────────────────────────────────────────────────────────
// A "card" here means: optional top label rule, flush content, dim bottom rule.
// No rounded corners. The whole UI is paper grid.

function Card({ label, meta, children, style, accent, dense, onClick }) {
  const { theme, density } = useApp();
  return <div
    onClick={onClick}
    style={{
      borderTop: `1px solid ${accent || theme.rule}`,
      paddingTop: 10,
      paddingBottom: density.padCard,
      cursor: onClick ? 'pointer' : 'default',
      ...style,
    }}>
    {(label || meta) && (
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        marginBottom: dense ? 6 : 10,
      }}>
        {label && <Meta>{label}</Meta>}
        {meta && <Meta style={{ letterSpacing: '0.06em' }}>{meta}</Meta>}
      </div>
    )}
    {children}
  </div>;
}

// ── Page header ────────────────────────────────────────────────────────────
function PageHeader({ overline, title, meta, right, style }) {
  const { theme, density } = useApp();
  return <div style={{
    paddingTop: 18, paddingBottom: 18, borderBottom: `1px solid ${theme.rule}`,
    display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16,
    ...style,
  }}>
    <div style={{ minWidth: 0 }}>
      {overline && <Meta style={{ marginBottom: 6 }}>{overline}</Meta>}
      <h1 style={{ fontSize: density.fontHead, fontWeight: 500, color: theme.ink, letterSpacing: '-0.01em' }}>{title}</h1>
      {meta && <div style={{ marginTop: 4 }}><Meta>{meta}</Meta></div>}
    </div>
    {right && <div style={{ flexShrink: 0 }}>{right}</div>}
  </div>;
}

// ── Stat bar ────────────────────────────────────────────────────────────────
// Hand-drawn (CSS) tick-marked progress bar. No round caps.
function StatBar({ stat, value, max = 100, ticks = 10, height = 10, showLabel = true, decay }) {
  const { theme, density } = useApp();
  const color = theme.stat[stat] || theme.accent;
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return <div>
    {showLabel && (
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
        <Meta style={{ color: color }}>{stat}</Meta>
        <span className="ls-num" style={{ color: theme.ink, fontSize: density.fontBody, fontWeight: 500 }}>
          {String(value).padStart(2, '0')}<span style={{ color: theme.inkFaint }}>/100</span>
          {decay !== undefined && decay >= 10 && (
            <span className="ls-mono" style={{
              fontSize: 9.5, color: decay >= 14 ? theme.danger : theme.warn,
              marginLeft: 8, letterSpacing: '0.1em',
            }}>{decay}D DORMANT</span>
          )}
        </span>
      </div>
    )}
    <div style={{ position: 'relative', height, background: theme.rule2 }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0,
        width: `${pct}%`, background: color, opacity: 0.85,
      }} />
      {/* tick marks */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
        {Array.from({ length: ticks - 1 }).map((_, i) => (
          <div key={i} style={{
            flex: 1, borderRight: `1px solid ${theme.bg}`, opacity: 0.45,
          }} />
        ))}
      </div>
    </div>
  </div>;
}

// ── Stamp ───────────────────────────────────────────────────────────────────
// Rubber-stamp graphic, drops onto things. Used on completed/failed cards
// and on day-close.
function Stamp({ text, color, sub, angle = -4, size = 'md', style, animate }) {
  const { theme } = useApp();
  const c = color || theme.stamp;
  const isLg = size === 'lg';
  return <div
    className={animate ? 'ls-stamp-anim' : ''}
    style={{
      display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
      padding: isLg ? '12px 22px' : '7px 14px',
      border: `${isLg ? 2.5 : 2}px solid ${c}`,
      color: c,
      transform: `rotate(${angle}deg)`,
      letterSpacing: isLg ? '0.18em' : '0.16em',
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: isLg ? 22 : 13,
      fontWeight: 600,
      textTransform: 'uppercase',
      borderRadius: 2,
      // Slight ink-bleed effect with double border
      boxShadow: `inset 0 0 0 1px ${c}, 0 0 0 1px ${theme.bg}, 0 0 0 ${isLg ? 3 : 2}px ${c}`,
      background: 'transparent',
      ...style,
    }}>
    <span>{text}</span>
    {sub && <span style={{ fontSize: isLg ? 9 : 8, opacity: 0.85, letterSpacing: '0.18em', marginTop: 2 }}>{sub}</span>}
  </div>;
}

// ── Pillar progress ring ────────────────────────────────────────────────────
function Ring({ value, max = 100, size = 80, color, label, sub }) {
  const { theme } = useApp();
  const stroke = 1.5;
  const r = (size / 2) - stroke - 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / max));
  return <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
    <svg width={size} height={size} style={{ display: 'block' }}>
      <circle cx={size/2} cy={size/2} r={r} stroke={theme.rule} strokeWidth={stroke} fill="none" />
      <circle
        cx={size/2} cy={size/2} r={r}
        stroke={color || theme.accent} strokeWidth={stroke + 0.5} fill="none"
        strokeDasharray={`${pct * circ} ${circ}`}
        transform={`rotate(-90 ${size/2} ${size/2})`} />
      {/* notches at quarters */}
      {[0,90,180,270].map(d => {
        const a = (d - 90) * Math.PI / 180;
        const x1 = size/2 + Math.cos(a) * (r - 4);
        const y1 = size/2 + Math.sin(a) * (r - 4);
        const x2 = size/2 + Math.cos(a) * (r + 4);
        const y2 = size/2 + Math.sin(a) * (r + 4);
        return <line key={d} x1={x1} y1={y1} x2={x2} y2={y2} stroke={theme.rule} strokeWidth={1} />;
      })}
      <text x={size/2} y={size/2 + 4} textAnchor="middle" fontFamily="JetBrains Mono, monospace"
        fontSize={size * 0.24} fill={theme.ink} fontWeight={500}>
        {Math.round(value)}<tspan fontSize={size * 0.14} fill={theme.inkFaint}>%</tspan>
      </text>
    </svg>
    {label && <Meta style={{ textAlign: 'center', lineHeight: 1.2 }}>{label}</Meta>}
    {sub && <Mono dim size={10}>{sub}</Mono>}
  </div>;
}

// ── Tick / cross / circle (used inline as status glyphs) ───────────────────
function Glyph({ kind, color, size = 12 }) {
  const { theme } = useApp();
  const c = color || theme.ink;
  if (kind === 'check') return <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
    <path d="M2 6.5 L5 9.5 L10 3" stroke={c} strokeWidth="1.5" strokeLinecap="square" />
  </svg>;
  if (kind === 'cross') return <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
    <path d="M2.5 2.5 L9.5 9.5 M9.5 2.5 L2.5 9.5" stroke={c} strokeWidth="1.5" strokeLinecap="square" />
  </svg>;
  if (kind === 'circle') return <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
    <circle cx="6" cy="6" r="4.5" stroke={c} strokeWidth="1.4" fill="none" />
  </svg>;
  if (kind === 'arrow-right') return <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
    <path d="M2 6 H9 M6.5 3 L9 6 L6.5 9" stroke={c} strokeWidth="1.4" strokeLinecap="square" fill="none" />
  </svg>;
  if (kind === 'lock') return <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
    <rect x="2.5" y="5.5" width="7" height="5" stroke={c} strokeWidth="1.2" fill="none" />
    <path d="M4 5.5 V4 a2 2 0 0 1 4 0 V5.5" stroke={c} strokeWidth="1.2" fill="none" />
  </svg>;
  return null;
}

// ── Sparkline / bar chart ───────────────────────────────────────────────────
function Spark({ data, height = 36, color }) {
  const { theme } = useApp();
  const c = color || theme.accent;
  if (!data || !data.length) return null;
  const max = Math.max(...data, 1);
  const w = 100;
  const pts = data.map((v,i) => {
    const x = (i / (data.length - 1)) * w;
    const y = height - (v / max) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  return <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" style={{ width: '100%', height, display: 'block' }}>
    <polyline points={pts} fill="none" stroke={c} strokeWidth="1.2" />
  </svg>;
}

function MiniBars({ data, height = 36, color, max }) {
  const { theme } = useApp();
  const c = color || theme.accent;
  if (!data || !data.length) return null;
  const m = max || Math.max(...data, 1);
  const w = 100;
  const gap = 1;
  const bw = (w / data.length) - gap;
  return <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" style={{ width: '100%', height, display: 'block' }}>
    {data.map((v,i) => {
      const h = (v / m) * (height - 2);
      return <rect key={i} x={i * (bw + gap)} y={height - h} width={bw} height={h} fill={c} opacity={0.7} />;
    })}
  </svg>;
}

// ── Spider chart (used in Onboarding stat preview & Character overview) ────
function Spider({ values, labels, size = 220, color }) {
  const { theme } = useApp();
  const c = color || theme.accent;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 30;
  const n = values.length;
  const pts = values.map((v,i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const rr = (v / 100) * r;
    return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr];
  });
  const polyStr = pts.map(p => p.join(',')).join(' ');
  const axes = labels.map((l,i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    const lx = cx + Math.cos(a) * (r + 16);
    const ly = cy + Math.sin(a) * (r + 16);
    return { x, y, lx, ly, label: l };
  });
  return <svg width={size} height={size}>
    {[0.25, 0.5, 0.75, 1].map((k, i) => (
      <polygon key={i}
        points={labels.map((_,j) => {
          const a = (j / n) * Math.PI * 2 - Math.PI / 2;
          return `${cx + Math.cos(a) * r * k},${cy + Math.sin(a) * r * k}`;
        }).join(' ')}
        fill="none" stroke={theme.rule2} strokeWidth={0.7} />
    ))}
    {axes.map((a,i) => (
      <line key={i} x1={cx} y1={cy} x2={a.x} y2={a.y} stroke={theme.rule2} strokeWidth={0.7} />
    ))}
    <polygon points={polyStr} fill={c} fillOpacity={0.15} stroke={c} strokeWidth={1.2} />
    {pts.map((p,i) => (
      <circle key={i} cx={p[0]} cy={p[1]} r={2} fill={c} />
    ))}
    {axes.map((a,i) => (
      <text key={i} x={a.lx} y={a.ly} fontSize={9} fontFamily="JetBrains Mono, monospace"
        fill={theme.inkDim} textAnchor="middle" dominantBaseline="middle"
        letterSpacing="0.12em">{a.label}</text>
    ))}
  </svg>;
}

// ── Section helpers ─────────────────────────────────────────────────────────
function ScreenScroll({ children, style }) {
  return <div className="ls-scroll" style={{
    height: '100%', overflowY: 'auto', overflowX: 'hidden', ...style,
  }}>{children}</div>;
}

Object.assign(window, {
  Rule, Mono, Meta, Pill, Btn, RowLink, Card, PageHeader,
  StatBar, Stamp, Ring, Glyph, Spark, MiniBars, Spider, ScreenScroll,
});
