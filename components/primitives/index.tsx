'use client';
import {
  useState,
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
  type MouseEventHandler,
} from 'react';
import { useApp } from '@/components/providers/AppProvider';

// ─── Rule ────────────────────────────────────────────────────────────────────

interface RuleProps {
  kind?: 'solid' | 'dash' | 'double';
  color?: string;
  style?: CSSProperties;
}

export function Rule({ kind = 'solid', color, style }: RuleProps) {
  const { theme } = useApp();
  const c = color || theme.rule;
  if (kind === 'dash') return <div style={{ color: c, ...style }} className="ls-rule-dash" />;
  if (kind === 'double') return <div style={{ color: c, ...style }} className="ls-rule-double" />;
  return <div style={{ height: 1, background: c, width: '100%', ...style }} />;
}

// ─── Mono ─────────────────────────────────────────────────────────────────────

interface MonoProps {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}

export function Mono({ children, style, className }: MonoProps) {
  return (
    <span
      className={`ls-mono${className ? ` ${className}` : ''}`}
      style={style}
    >
      {children}
    </span>
  );
}

// ─── Meta ─────────────────────────────────────────────────────────────────────

interface MetaProps {
  children: ReactNode;
  style?: CSSProperties;
  color?: string;
}

export function Meta({ children, style, color }: MetaProps) {
  const { theme, density } = useApp();
  return (
    <span
      className="ls-mono"
      style={{
        fontSize: density.fontMeta,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: color || theme.inkMute,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

// ─── Pill ─────────────────────────────────────────────────────────────────────

interface PillProps {
  children: ReactNode;
  color?: string;
  bg?: string;
  style?: CSSProperties;
}

export function Pill({ children, color, bg, style }: PillProps) {
  const { theme, density } = useApp();
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '1px 7px',
        borderRadius: 2,
        fontSize: density.fontMeta,
        fontFamily: 'inherit',
        background: bg || theme.surface2,
        color: color || theme.inkDim,
        border: `1px solid ${theme.rule}`,
        letterSpacing: '0.04em',
        ...style,
      }}
    >
      {children}
    </span>
  );
}

// ─── Btn ─────────────────────────────────────────────────────────────────────

interface BtnProps {
  children: ReactNode;
  variant?: 'primary' | 'ghost';
  danger?: boolean;
  full?: boolean;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  style?: CSSProperties;
  type?: 'button' | 'submit' | 'reset';
}

export function Btn({
  children,
  variant = 'primary',
  danger = false,
  full = false,
  size = 'md',
  disabled = false,
  onClick,
  style,
  type = 'button',
}: BtnProps) {
  const { theme, density } = useApp();

  const pad: Record<string, string> = {
    sm: '5px 14px',
    md: '9px 20px',
    lg: '13px 28px',
  };
  const fs: Record<string, number> = {
    sm: density.fontMeta,
    md: density.fontBody,
    lg: density.fontBody + 1,
  };

  let bg: string, borderColor: string, textColor: string;
  if (variant === 'ghost') {
    bg = 'transparent';
    borderColor = danger ? theme.danger : theme.rule;
    textColor = danger ? theme.danger : theme.inkDim;
  } else {
    bg = danger ? theme.danger : theme.accent;
    borderColor = danger ? theme.danger : theme.accent;
    textColor = danger ? '#fff' : theme.bg;
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="ls-press ls-mono"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: pad[size],
        fontSize: fs[size],
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        border: `1px solid ${borderColor}`,
        borderRadius: 2,
        background: bg,
        color: textColor,
        width: full ? '100%' : undefined,
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// ─── RowLink ──────────────────────────────────────────────────────────────────

interface RowLinkProps {
  children: ReactNode;
  meta?: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  style?: CSSProperties;
  disabled?: boolean;
}

export function RowLink({ children, meta, onClick, style, disabled }: RowLinkProps) {
  const { theme, density } = useApp();
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="ls-press"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        minHeight: density.rowHeight,
        padding: `0 ${density.padCard}px`,
        background: 'none',
        border: 'none',
        borderBottom: `1px solid ${theme.rule2}`,
        color: theme.ink,
        fontSize: density.fontBody,
        textAlign: 'left',
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...style,
      }}
    >
      <span style={{ flex: 1 }}>{children}</span>
      {meta && (
        <span style={{ color: theme.inkMute, fontSize: density.fontMeta, marginRight: 8 }}>
          {meta}
        </span>
      )}
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path
          d="M5 3l4 4-4 4"
          stroke={theme.inkMute}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

interface CardProps {
  children: ReactNode;
  label?: string;
  meta?: ReactNode;
  accent?: string;
  style?: CSSProperties;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

export function Card({ children, label, meta, accent, style, onClick }: CardProps) {
  const { theme, density } = useApp();
  const accentColor = accent || theme.accent;
  return (
    <div
      onClick={onClick}
      style={{
        background: theme.surface,
        border: `1px solid ${theme.cardBorder}`,
        boxShadow: theme.cardShadow,
        borderRadius: 3,
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}
    >
      {/* top accent rule */}
      <div style={{ height: 2, background: accentColor, width: '100%' }} />
      {(label || meta) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: `${density.padCard * 0.6}px ${density.padCard}px`,
            borderBottom: `1px solid ${theme.rule2}`,
          }}
        >
          {label && (
            <span
              className="ls-mono"
              style={{
                fontSize: density.fontMeta,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: accentColor,
              }}
            >
              {label}
            </span>
          )}
          {meta && (
            <span style={{ color: theme.inkMute, fontSize: density.fontMeta }}>{meta}</span>
          )}
        </div>
      )}
      <div style={{ padding: density.padCard }}>{children}</div>
    </div>
  );
}

// ─── PageHeader ───────────────────────────────────────────────────────────────

interface PageHeaderProps {
  overline?: string;
  title: ReactNode;
  meta?: ReactNode;
  right?: ReactNode;
  style?: CSSProperties;
}

export function PageHeader({ overline, title, meta, right, style }: PageHeaderProps) {
  const { theme, density } = useApp();
  return (
    <div
      style={{
        padding: `${density.padScreen}px ${density.padScreen}px ${density.padCard}px`,
        borderBottom: `1px solid ${theme.rule}`,
        ...style,
      }}
    >
      {overline && (
        <div
          className="ls-mono"
          style={{
            fontSize: density.fontMeta,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: theme.inkMute,
            marginBottom: 4,
          }}
        >
          {overline}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <h1
          style={{
            fontSize: density.fontHead,
            fontWeight: 500,
            color: theme.ink,
            lineHeight: 1.15,
          }}
        >
          {title}
        </h1>
        {right && <div style={{ marginLeft: 12 }}>{right}</div>}
      </div>
      {meta && (
        <div
          style={{
            fontSize: density.fontMeta,
            color: theme.inkMute,
            marginTop: 4,
          }}
        >
          {meta}
        </div>
      )}
    </div>
  );
}

// ─── StatBar ──────────────────────────────────────────────────────────────────

interface StatBarProps {
  stat: string;
  value: number; // 0–100
  decayDays?: number;
  style?: CSSProperties;
}

export function StatBar({ stat, value, decayDays = 0, style }: StatBarProps) {
  const { theme, density } = useApp();
  const statColor = theme.stat[stat] || theme.accent;
  const isWarn = decayDays >= 10 && decayDays < 14;
  const isDanger = decayDays >= 14;
  const decayColor = isDanger ? theme.danger : isWarn ? theme.warn : undefined;

  // 20 ticks
  const ticks = Array.from({ length: 20 }, (_, i) => i);
  const filled = Math.round((value / 100) * 20);

  return (
    <div style={{ ...style }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 5,
        }}
      >
        <span
          className="ls-mono"
          style={{
            fontSize: density.fontMeta,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: decayColor || statColor,
          }}
        >
          {stat}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {decayColor && (
            <span
              className="ls-mono"
              style={{ fontSize: density.fontMeta - 1, color: decayColor }}
            >
              {decayDays}d
            </span>
          )}
          <span
            className="ls-mono"
            style={{ fontSize: density.fontMeta, color: theme.inkDim }}
          >
            {value}
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 2, height: 6 }}>
        {ticks.map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: '100%',
              background: i < filled ? (decayColor || statColor) : theme.rule,
              borderRadius: 1,
              opacity: i < filled ? 1 : 0.5,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Stamp ────────────────────────────────────────────────────────────────────

interface StampProps {
  text: string;
  color?: string;
  sub?: string;
  angle?: number;
  size?: 'md' | 'lg';
  style?: CSSProperties;
  animate?: boolean;
}

export function Stamp({
  text,
  color,
  sub,
  angle = -4,
  size = 'md',
  style,
  animate = false,
}: StampProps) {
  const { theme } = useApp();
  const c = color || theme.stamp;
  const isLg = size === 'lg';
  return (
    <div
      className={animate ? 'ls-stamp-anim' : undefined}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        border: `${isLg ? 3 : 2}px solid ${c}`,
        borderRadius: 3,
        padding: isLg ? '8px 20px' : '5px 14px',
        color: c,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: isLg ? 28 : 18,
        fontWeight: 700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        transform: `rotate(${angle}deg)`,
        boxShadow: `2px 2px 0 ${c}40, inset 0 0 12px ${c}18`,
        opacity: 0.92,
        userSelect: 'none',
        ...style,
      }}
    >
      {text}
      {sub && (
        <span
          style={{
            fontSize: isLg ? 11 : 9,
            letterSpacing: '0.12em',
            marginTop: 2,
            opacity: 0.75,
          }}
        >
          {sub}
        </span>
      )}
    </div>
  );
}

// ─── Ring ─────────────────────────────────────────────────────────────────────

interface RingProps {
  value: number; // 0–100
  size?: number;
  color?: string;
  label?: string;
  sublabel?: string;
  style?: CSSProperties;
}

export function Ring({ value, size = 120, color, label, sublabel, style }: RingProps) {
  const { theme, density } = useApp();
  const c = color || theme.accent;
  const r = (size - 18) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  const notchAngles = [0, 90, 180, 270];

  return (
    <div style={{ position: 'relative', width: size, height: size, ...style }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* track */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={theme.rule}
          strokeWidth={6}
        />
        {/* fill */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={c}
          strokeWidth={6}
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="butt"
        />
        {/* notches at 0/90/180/270 */}
        {notchAngles.map((a) => {
          const rad = (a * Math.PI) / 180;
          const x1 = cx + (r - 5) * Math.cos(rad);
          const y1 = cy + (r - 5) * Math.sin(rad);
          const x2 = cx + (r + 5) * Math.cos(rad);
          const y2 = cy + (r + 5) * Math.sin(rad);
          return (
            <line
              key={a}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={theme.rule2}
              strokeWidth={2}
            />
          );
        })}
      </svg>
      {/* centre label */}
      {(label || sublabel) && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {label && (
            <span
              className="ls-mono"
              style={{ fontSize: density.fontBody + 2, color: theme.ink, lineHeight: 1 }}
            >
              {label}
            </span>
          )}
          {sublabel && (
            <span
              className="ls-mono"
              style={{ fontSize: density.fontMeta, color: theme.inkMute, marginTop: 2 }}
            >
              {sublabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Glyph ────────────────────────────────────────────────────────────────────

interface GlyphProps {
  kind: 'check' | 'cross' | 'circle' | 'arrow-right' | 'lock';
  size?: number;
  color?: string;
  style?: CSSProperties;
}

export function Glyph({ kind, size = 16, color, style }: GlyphProps) {
  const { theme } = useApp();
  const c = color || theme.inkDim;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      style={{ flexShrink: 0, ...style }}
    >
      {kind === 'check' && (
        <path
          d="M3 8.5l3.5 3.5 6.5-7"
          stroke={c}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {kind === 'cross' && (
        <path
          d="M4 4l8 8M12 4l-8 8"
          stroke={c}
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      )}
      {kind === 'circle' && (
        <circle cx="8" cy="8" r="5.5" stroke={c} strokeWidth="1.5" />
      )}
      {kind === 'arrow-right' && (
        <path
          d="M3 8h10M9 4l4 4-4 4"
          stroke={c}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {kind === 'lock' && (
        <path
          d="M5 7V5.5a3 3 0 016 0V7M4 7h8a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V8a1 1 0 011-1z"
          stroke={c}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

// ─── Spark ────────────────────────────────────────────────────────────────────

interface SparkProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  style?: CSSProperties;
}

export function Spark({ data, width = 80, height = 28, color, style }: SparkProps) {
  const { theme } = useApp();
  const c = color || theme.accent;

  if (!data.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1 || 1);

  const pts = data
    .map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} style={style} viewBox={`0 0 ${width} ${height}`}>
      <polyline
        points={pts}
        fill="none"
        stroke={c}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── MiniBars ─────────────────────────────────────────────────────────────────

interface MiniBarsProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  style?: CSSProperties;
}

export function MiniBars({ data, width = 60, height = 28, color, style }: MiniBarsProps) {
  const { theme } = useApp();
  const c = color || theme.accent;

  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const barW = (width / data.length) - 1;

  return (
    <svg width={width} height={height} style={style} viewBox={`0 0 ${width} ${height}`}>
      {data.map((v, i) => {
        const bh = Math.max(1, (v / max) * height);
        return (
          <rect
            key={i}
            x={i * (barW + 1)}
            y={height - bh}
            width={barW}
            height={bh}
            fill={c}
            opacity={0.85}
            rx={1}
          />
        );
      })}
    </svg>
  );
}

// ─── Spider ───────────────────────────────────────────────────────────────────

interface SpiderProps {
  data: Record<string, number>; // stat -> 0-100
  size?: number;
  style?: CSSProperties;
}

export function Spider({ data, size = 220, style }: SpiderProps) {
  const { theme, density } = useApp();
  const keys = Object.keys(data);
  const n = keys.length;
  if (n < 3) return null;

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 28;

  function polarToXY(angleRad: number, radius: number) {
    return {
      x: cx + radius * Math.cos(angleRad - Math.PI / 2),
      y: cy + radius * Math.sin(angleRad - Math.PI / 2),
    };
  }

  const angleStep = (2 * Math.PI) / n;
  const gridLevels = [0.25, 0.5, 0.75, 1];

  // Build grid polygons
  const gridPolygons = gridLevels.map((level) => {
    const pts = keys
      .map((_, i) => {
        const { x, y } = polarToXY(i * angleStep, r * level);
        return `${x},${y}`;
      })
      .join(' ');
    return pts;
  });

  // Build data polygon
  const dataPoints = keys.map((k, i) => {
    const val = (data[k] ?? 0) / 100;
    return polarToXY(i * angleStep, r * val);
  });
  const dataPoly = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <svg width={size} height={size} style={style} viewBox={`0 0 ${size} ${size}`}>
      {/* grid polygons */}
      {gridPolygons.map((pts, li) => (
        <polygon
          key={li}
          points={pts}
          fill="none"
          stroke={theme.rule}
          strokeWidth={0.75}
          opacity={0.6}
        />
      ))}
      {/* axis lines */}
      {keys.map((_, i) => {
        const { x, y } = polarToXY(i * angleStep, r);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke={theme.rule}
            strokeWidth={0.75}
            opacity={0.5}
          />
        );
      })}
      {/* data fill */}
      <polygon
        points={dataPoly}
        fill={theme.accent}
        fillOpacity={0.12}
        stroke={theme.accent}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      {/* data points */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill={theme.accent} />
      ))}
      {/* axis labels */}
      {keys.map((k, i) => {
        const labelR = r + 18;
        const { x, y } = polarToXY(i * angleStep, labelR);
        const statColor = theme.stat[k] || theme.inkDim;
        return (
          <text
            key={k}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={density.fontMeta - 0.5}
            fontFamily="'JetBrains Mono', monospace"
            fill={statColor}
            letterSpacing="0.06em"
          >
            {k}
          </text>
        );
      })}
    </svg>
  );
}

// ─── ScreenScroll ─────────────────────────────────────────────────────────────

interface ScreenScrollProps {
  children: ReactNode;
  style?: CSSProperties;
}

export function ScreenScroll({ children, style }: ScreenScrollProps) {
  return (
    <div
      className="ls-scroll"
      style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Default export (full module) ─────────────────────────────────────────────

// Re-export refs for convenience
export { useState, useEffect, useRef };

const primitives = {
  Rule,
  Mono,
  Meta,
  Pill,
  Btn,
  RowLink,
  Card,
  PageHeader,
  StatBar,
  Stamp,
  Ring,
  Glyph,
  Spark,
  MiniBars,
  Spider,
  ScreenScroll,
};

export default primitives;
