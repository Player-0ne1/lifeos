// screen-character.jsx — TAB II · CHARACTER.
// Player overview, stat detail, skill registry + detail, passives, pillars, level history.

function CharacterTab({ device }) {
  const { route } = useApp();
  if (route.sub === 'stat')      return <StatDetail device={device} />;
  if (route.sub === 'skills')    return <SkillRegistry device={device} />;
  if (route.sub === 'skill')     return <SkillDetail device={device} />;
  if (route.sub === 'passives')  return <PassiveLibrary device={device} />;
  if (route.sub === 'pillars')   return <ThreePillars device={device} />;
  if (route.sub === 'level')     return <LevelHistory device={device} />;
  return <CharacterOverview device={device} />;
}

// ── Overview ────────────────────────────────────────────────────────────────
function CharacterOverview({ device }) {
  const { theme, data, density, setRoute } = useApp();
  const totalPower = STATS.reduce((s, k) => s + data.stats[k], 0);
  const passiveBonus = data.passives.active.reduce((s, p) => s + p.daily, 0).toFixed(1);
  const xpPct = Math.min(100, (data.player.totalXP / (data.player.totalXP + data.player.xpToNext)) * 100);

  return <ScreenScroll>
    <div style={{ padding: device === 'phone' ? '20px 18px 28px' : '34px 40px 44px', maxWidth: 920 }}>
      <Meta>CHARACTER SHEET</Meta>
      <h1 style={{ fontFamily: 'Newsreader, serif', fontSize: device === 'phone' ? 28 : 38, fontWeight: 400, marginTop: 10, color: theme.ink }}>
        {data.player.name}
        <span className="ls-mono" style={{ marginLeft: 14, fontSize: device === 'phone' ? 14 : 16, color: theme.inkMute, letterSpacing: '0.14em' }}>
          LEVEL {data.player.level}
        </span>
      </h1>

      {/* XP bar */}
      <div style={{ marginTop: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Meta>XP TO LVL {data.player.level + 1}</Meta>
          <Mono size={11} style={{ color: theme.ink }}>
            {data.player.totalXP.toLocaleString()} <span style={{ color: theme.inkFaint }}>· {data.player.xpToNext} to go</span>
          </Mono>
        </div>
        <div style={{ marginTop: 6, height: 6, background: theme.rule2, position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, width: `${xpPct}%`, background: theme.accent }} />
        </div>
      </div>

      {/* Streak + power */}
      <div style={{
        marginTop: 22, display: 'grid', gridTemplateColumns: device === 'phone' ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)',
        border: `1px solid ${theme.rule}`,
      }}>
        {[
          { l: 'STREAK',   v: `${data.player.streak}D`, sub: `BEST ${data.player.bestStreak}D` },
          { l: 'TOTAL',    v: String(totalPower).padStart(3,'0'), sub: '/ 700 MAX' },
          { l: 'PASSIVE',  v: `+${passiveBonus}/D`, sub: 'STAT BONUS' },
          ...(device === 'phone' ? [] : [{ l: 'SYSTEM DAY',  v: String(data.player.day).padStart(3,'0'), sub: 'SINCE 12 MAY 2026' }]),
        ].map((c,i,a) => (
          <div key={i} style={{ padding: '14px 14px', borderRight: i < a.length - 1 ? `1px solid ${theme.rule}` : 'none' }}>
            <Meta>{c.l}</Meta>
            <div className="ls-num" style={{ fontSize: 22, marginTop: 4, color: theme.ink, fontWeight: 500 }}>{c.v}</div>
            <Mono dim size={10} style={{ display: 'block', marginTop: 2 }}>{c.sub}</Mono>
          </div>
        ))}
      </div>

      {/* Stat bars + Spider */}
      <div style={{
        marginTop: 28,
        display: 'grid',
        gridTemplateColumns: device === 'phone' ? '1fr' : '1fr 280px',
        gap: device === 'phone' ? 20 : 36,
      }}>
        <div>
          <Meta style={{ marginBottom: 14 }}>STATS · TAP ANY ROW</Meta>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {STATS.map(s => (
              <div key={s} onClick={() => setRoute({ tab: 'character', sub: 'stat', params: { stat: s } })}
                style={{ cursor: 'pointer' }} className="ls-press">
                <StatBar stat={s} value={data.stats[s]} decay={data.decay[s]} />
              </div>
            ))}
          </div>
        </div>
        {device !== 'phone' && (
          <div style={{ borderLeft: `1px solid ${theme.rule}`, paddingLeft: 28 }}>
            <Meta style={{ marginBottom: 14 }}>POWER PROFILE</Meta>
            <Spider
              labels={STATS}
              values={STATS.map(s => data.stats[s])}
              size={260}
              color={theme.accent}
            />
          </div>
        )}
      </div>

      {/* Quick links */}
      <div style={{ marginTop: 30, borderTop: `1px solid ${theme.rule}` }}>
        <RowLink onClick={() => setRoute({ tab: 'character', sub: 'skills', params: {} })}
          right={`${data.skills.filter(s => s.status === 'active').length}/28 ACTIVE`}>Skill Registry</RowLink>
        <RowLink onClick={() => setRoute({ tab: 'character', sub: 'passives', params: {} })}
          right={`+${passiveBonus}/DAY`}>Passive Library</RowLink>
        <RowLink onClick={() => setRoute({ tab: 'character', sub: 'pillars', params: {} })}
          right="0/3 CLOSED">Three Pillars · Monarch Mode</RowLink>
        <RowLink onClick={() => setRoute({ tab: 'character', sub: 'level', params: {} })}
          right={`LVL ${data.player.level}`}>Level History</RowLink>
      </div>
    </div>
  </ScreenScroll>;
}

// ── Stat Detail ─────────────────────────────────────────────────────────────
function StatDetail({ device }) {
  const { theme, data, route, setRoute, density } = useApp();
  const s = route.params.stat || 'CRAFT';
  const color = theme.stat[s];
  const score = data.stats[s];
  const decay = data.decay[s];
  const tier = score >= 90 ? 4 : score >= 70 ? 3 : score >= 50 ? 2 : score >= 30 ? 1 : 0;
  const nextTier = tier < 4 ? [30,50,70,90][tier] : null;
  // Synthetic 30-day history
  const history = useM(() => Array.from({ length: 30 }, (_, i) => Math.max(0, Math.round(score * (0.4 + 0.6 * (i + 1) / 30) + (Math.random() - 0.5) * 3))), [s, score]);
  const stateSkills = data.skills.filter(sk => sk.stat === s);
  const recent = data.questLog.filter(q => q.stat === s).slice(0, 5);

  return <ScreenScroll>
    <div style={{ padding: device === 'phone' ? '18px 18px 28px' : '28px 40px 44px', maxWidth: 920 }}>
      <button onClick={() => setRoute({ tab: 'character', sub: null, params: {} })}
        className="ls-press ls-mono" style={{
          background: 'transparent', border: 'none', color: theme.inkMute, padding: 0,
          fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer',
        }}>← Character</button>

      <div style={{ marginTop: 14, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20 }}>
        <div>
          <Meta style={{ color }}>STAT · {s}</Meta>
          <h1 style={{ fontFamily: 'Newsreader, serif', fontSize: 32, fontWeight: 400, marginTop: 6, color: theme.ink, fontStyle: 'italic' }}>
            {STAT_DESC[s]}
          </h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="ls-num" style={{ fontSize: 64, fontWeight: 300, color: theme.ink, lineHeight: 1, letterSpacing: '-0.02em' }}>
            {String(score).padStart(2, '0')}
          </div>
          <Mono dim size={10} style={{ display: 'block', marginTop: 4 }}>/ 100</Mono>
        </div>
      </div>

      {/* Tier ladder */}
      <div style={{ marginTop: 24 }}>
        <Meta>SKILL TIER {tier > 0 ? `· ${tier} UNLOCKED` : ' · NONE'}</Meta>
        <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
          {[30, 50, 70, 90].map((t, i) => (
            <div key={t} style={{
              flex: 1, padding: '10px 12px',
              border: `1px solid ${score >= t ? color : theme.rule}`,
              background: score >= t ? `${color}1a` : 'transparent',
            }}>
              <Mono size={10} dim>T{i + 1} · {t}</Mono>
              <div style={{ fontSize: 12, marginTop: 4, color: score >= t ? theme.ink : theme.inkMute,
                fontFamily: 'Newsreader, serif' }}>
                {stateSkills[i]?.name || '—'}
              </div>
            </div>
          ))}
        </div>
        {nextTier && (
          <Mono dim size={10} style={{ display: 'block', marginTop: 8 }}>
            {nextTier - score} POINTS TO NEXT TIER · {stateSkills.find(sk => sk.req === nextTier)?.name}
          </Mono>
        )}
      </div>

      {/* Decay status */}
      <div style={{
        marginTop: 22, padding: '12px 14px',
        border: `1px solid ${decay >= 14 ? theme.danger : decay >= 10 ? theme.warn : theme.rule}`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Meta style={{ color: decay >= 14 ? theme.danger : decay >= 10 ? theme.warn : theme.good }}>
            {decay >= 14 ? 'DECAYING' : decay >= 10 ? 'WARNING' : 'HEALTHY'}
          </Meta>
          <Mono size={11}>{decay}D SINCE LAST ACTIVITY</Mono>
        </div>
      </div>

      {/* Chart */}
      <div style={{ marginTop: 22 }}>
        <Meta style={{ marginBottom: 8 }}>30-DAY HISTORY</Meta>
        <div style={{ border: `1px solid ${theme.rule2}`, padding: '10px 12px' }}>
          <Spark data={history} height={60} color={color} />
          <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
            <Mono dim size={10}>{data.player.day - 30}D</Mono>
            <Mono dim size={10}>NOW</Mono>
          </div>
        </div>
      </div>

      {/* Recent quests */}
      <div style={{ marginTop: 22 }}>
        <Meta style={{ marginBottom: 8 }}>RECENT QUESTS · {s}</Meta>
        <div style={{ borderTop: `1px solid ${theme.rule2}` }}>
          {recent.length === 0 ? (
            <div style={{ padding: '12px 0', color: theme.inkMute, fontSize: 13, fontStyle: 'italic' }}>
              No recent quests. This is why it is dormant.
            </div>
          ) : recent.map(q => (
            <div key={q.id} style={{
              padding: '8px 0', borderBottom: `1px solid ${theme.rule2}`,
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <Glyph kind={q.status === 'complete' ? 'check' : 'cross'} color={q.status === 'complete' ? theme.ink : theme.danger} />
              <Mono dim size={10}>{q.dt}</Mono>
              <span style={{ flex: 1, fontSize: 13 }}>{q.title}</span>
              <Mono dim size={10}>+{q.xp} XP</Mono>
            </div>
          ))}
        </div>
      </div>
    </div>
  </ScreenScroll>;
}

// ── Skill Registry ──────────────────────────────────────────────────────────
function SkillRegistry({ device }) {
  const { theme, data, setRoute } = useApp();
  const [filter, setFilter] = useS('ALL');
  const visible = filter === 'ALL' ? data.skills : data.skills.filter(s => s.stat === filter);

  return <ScreenScroll>
    <div style={{ padding: device === 'phone' ? '18px 18px 28px' : '28px 40px 44px', maxWidth: 920 }}>
      <button onClick={() => setRoute({ tab: 'character', sub: null, params: {} })}
        className="ls-press ls-mono" style={{
          background: 'transparent', border: 'none', color: theme.inkMute, padding: 0,
          fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer',
        }}>← Character</button>

      <PageHeader overline="REGISTRY" title="Skills" meta={`${data.skills.filter(s => s.status === 'active').length} of 28 unlocked`} />

      <div style={{ marginTop: 14, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {['ALL', ...STATS].map(s => (
          <button key={s} onClick={() => setFilter(s)} className="ls-press ls-mono" style={{
            background: filter === s ? theme.ink : 'transparent',
            border: `1px solid ${filter === s ? theme.ink : theme.rule}`,
            color: filter === s ? theme.bg : (s !== 'ALL' ? theme.stat[s] : theme.inkDim),
            padding: '6px 10px', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
            cursor: 'pointer', borderRadius: 0,
          }}>{s}</button>
        ))}
      </div>

      <div style={{
        marginTop: 18, display: 'grid',
        gridTemplateColumns: device === 'phone' ? '1fr' : 'repeat(2, 1fr)',
        gap: 0,
      }}>
        {visible.map((sk, i) => {
          const color = theme.stat[sk.stat];
          const score = data.stats[sk.stat];
          const pct = Math.min(100, (score / sk.req) * 100);
          const isActive = sk.status === 'active';
          const ready = score >= sk.req && !isActive;
          return <div key={`${sk.stat}-${sk.tier}`} onClick={() => setRoute({ tab: 'character', sub: 'skill', params: { stat: sk.stat, tier: sk.tier } })}
            className="ls-press" style={{
              padding: '14px 16px', cursor: 'pointer',
              borderTop: `1px solid ${isActive ? color : theme.rule2}`,
              opacity: isActive ? 1 : 0.75,
            }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <Meta style={{ color }}>{sk.stat} · T{sk.tier}</Meta>
              {isActive ? (
                <Mono size={10} style={{ color: theme.good }}>ACTIVE</Mono>
              ) : ready ? (
                <Mono size={10} style={{ color: theme.warn }}>ASCENSION READY</Mono>
              ) : (
                <Mono size={10} dim><Glyph kind="lock" color={theme.inkMute} size={10} /> {sk.req}</Mono>
              )}
            </div>
            <div style={{
              marginTop: 6, fontFamily: 'Newsreader, serif', fontSize: 17,
              color: isActive ? theme.ink : theme.inkDim,
              fontStyle: sk.name === '—' ? 'italic' : 'normal',
            }}>{sk.name}</div>
            <div style={{ marginTop: 8, height: 2, background: theme.rule2, position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, width: `${pct}%`, background: isActive ? color : theme.inkMute }} />
            </div>
          </div>;
        })}
      </div>
    </div>
  </ScreenScroll>;
}

// ── Skill Detail ────────────────────────────────────────────────────────────
function SkillDetail({ device }) {
  const { theme, data, route, setRoute } = useApp();
  const sk = data.skills.find(s => s.stat === route.params.stat && s.tier === route.params.tier) || data.skills[0];
  const color = theme.stat[sk.stat];
  const score = data.stats[sk.stat];
  const pct = Math.min(100, (score / sk.req) * 100);
  const isActive = sk.status === 'active';
  const ready = score >= sk.req && !isActive;

  return <ScreenScroll>
    <div style={{ padding: device === 'phone' ? '18px 18px 28px' : '28px 40px 44px', maxWidth: 700 }}>
      <button onClick={() => setRoute({ tab: 'character', sub: 'skills', params: {} })}
        className="ls-press ls-mono" style={{
          background: 'transparent', border: 'none', color: theme.inkMute, padding: 0,
          fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer',
        }}>← Registry</button>

      <Meta style={{ color, marginTop: 14 }}>{sk.stat} · TIER {sk.tier} · {sk.req}+</Meta>
      <h1 style={{ fontFamily: 'Newsreader, serif', fontSize: 32, fontWeight: 400, marginTop: 10, color: theme.ink }}>
        {sk.name}
      </h1>

      <p style={{ marginTop: 14, color: theme.inkDim, fontSize: 15, fontStyle: 'italic', maxWidth: 560 }}>
        {sk.desc}
      </p>

      <div style={{ marginTop: 22, padding: '16px 18px', border: `1px solid ${theme.rule}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Meta>PROGRESS TO UNLOCK</Meta>
          <Mono size={12} style={{ color: theme.ink }}>{score} / {sk.req}</Mono>
        </div>
        <div style={{ marginTop: 8, height: 4, background: theme.rule2, position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, width: `${pct}%`, background: isActive ? theme.good : color }} />
        </div>
        <div style={{ marginTop: 12 }}>
          {isActive ? (
            <Mono size={11} style={{ color: theme.good }}>ACTIVE · UNLOCKED 22 MAY 2026 · FIRST DELIVERY 27 MAY 2026</Mono>
          ) : ready ? (
            <Mono size={11} style={{ color: theme.warn }}>ASCENSION QUEST READY · COMPLETE TO UNLOCK</Mono>
          ) : (
            <Mono size={11} dim>{sk.req - score} POINTS REMAIN</Mono>
          )}
        </div>
      </div>

      <div style={{ marginTop: 22, padding: '16px 18px', background: theme.surface, borderLeft: `2px solid ${color}` }}>
        <Meta>WHAT IT DELIVERS</Meta>
        <p style={{ marginTop: 8, fontSize: 14, color: theme.ink, lineHeight: 1.5 }}>{sk.desc}</p>
      </div>
    </div>
  </ScreenScroll>;
}

// ── Passive Library ─────────────────────────────────────────────────────────
function PassiveLibrary({ device }) {
  const { theme, data, setRoute } = useApp();
  const dailyTotal = data.passives.active.reduce((s, p) => s + p.daily, 0).toFixed(1);

  return <ScreenScroll>
    <div style={{ padding: device === 'phone' ? '18px 18px 28px' : '28px 40px 44px', maxWidth: 820 }}>
      <button onClick={() => setRoute({ tab: 'character', sub: null, params: {} })}
        className="ls-press ls-mono" style={{
          background: 'transparent', border: 'none', color: theme.inkMute, padding: 0,
          fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer',
        }}>← Character</button>

      <PageHeader
        overline="THE SHADOW ARMY"
        title="Passive Library"
        meta={`+${dailyTotal} stat points per day · compounding`}
      />

      <PassiveBucket title="Active" items={data.passives.active} kind="active" />
      <PassiveBucket title="Building" items={data.passives.building} kind="building" />
      <PassiveBucket title="Broken" items={data.passives.broken} kind="broken" />
    </div>
  </ScreenScroll>;
}

function PassiveBucket({ title, items, kind }) {
  const { theme } = useApp();
  const headerColor = kind === 'active' ? theme.good : kind === 'broken' ? theme.danger : theme.accent;
  return <div style={{ marginTop: 22 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <Meta style={{ color: headerColor }}>{title}</Meta>
      <Mono size={10} dim>{items.length} ITEM{items.length === 1 ? '' : 'S'}</Mono>
    </div>
    <div style={{ marginTop: 8, borderTop: `1px solid ${theme.rule}` }}>
      {items.map((p, i) => {
        const c = theme.stat[p.stat];
        return <div key={i} style={{
          padding: '10px 0', borderBottom: `1px solid ${theme.rule2}`,
          display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
        }}>
          <Pill color={c} border={c}>{p.stat}</Pill>
          <span style={{ flex: 1, fontFamily: 'Newsreader, serif', fontSize: 15, color: theme.ink }}>{p.name}</span>
          {kind === 'active' && <Mono size={11} style={{ color: theme.good }}>+{p.daily}/D · {p.count} CMP</Mono>}
          {kind === 'building' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 80, height: 3, background: theme.rule2, position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, width: `${(p.count/21)*100}%`, background: theme.accent }} />
              </div>
              <Mono size={11} dim>{p.count}/21</Mono>
            </div>
          )}
          {kind === 'broken' && <Mono size={11} style={{ color: theme.danger }}>LAPSED {p.lapsedDays}D · RESET</Mono>}
        </div>;
      })}
    </div>
  </div>;
}

// ── Three Pillars / Monarch Mode ────────────────────────────────────────────
function ThreePillars({ device }) {
  const { theme, voice, data, setRoute } = useApp();
  const closed = Object.values(data.pillars).filter(p => p.current >= p.target).length;

  return <ScreenScroll>
    <div style={{ padding: device === 'phone' ? '18px 18px 28px' : '28px 40px 44px', maxWidth: 860 }}>
      <button onClick={() => setRoute({ tab: 'character', sub: null, params: {} })}
        className="ls-press ls-mono" style={{
          background: 'transparent', border: 'none', color: theme.inkMute, padding: 0,
          fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer',
        }}>← Character</button>

      <PageHeader
        overline="ENDGAME"
        title="Three Pillars · Monarch Mode"
        meta={voice.pillarLock(closed)}
      />

      {/* Lock display */}
      <div style={{
        marginTop: 28, padding: '32px 22px',
        border: `1px solid ${theme.rule}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: 22, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, flex: 1 }}>
          <MonarchLock closed={closed} />
          <div>
            <Meta style={{ color: theme.accent }}>MONARCH MODE</Meta>
            <div style={{ fontFamily: 'Newsreader, serif', fontSize: 24, marginTop: 6, color: theme.ink, fontStyle: 'italic', fontWeight: 300 }}>
              {closed === 3 ? 'Unlocked.' : `${3 - closed} pillar${closed === 2 ? '' : 's'} remain.`}
            </div>
            <Mono dim size={10} style={{ display: 'block', marginTop: 6 }}>
              PROJECTED · 27–34 MONTHS AT CURRENT TRAJECTORY
            </Mono>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 26, display: 'grid', gridTemplateColumns: device === 'phone' ? '1fr' : 'repeat(3, 1fr)', gap: 0 }}>
        <Pillar p={data.pillars.corpus} index={1} />
        <Pillar p={data.pillars.consulting} index={2} />
        <Pillar p={data.pillars.livingWork} index={3} />
      </div>
    </div>
  </ScreenScroll>;
}

function MonarchLock({ closed }) {
  const { theme } = useApp();
  return <svg width={84} height={104} viewBox="0 0 84 104">
    <rect x={6} y={42} width={72} height={58} fill="none" stroke={theme.accent} strokeWidth={1.5} />
    {[0,1,2].map(i => (
      <rect key={i} x={20 + i * 16} y={56} width={4} height={32} fill={i < closed ? theme.good : 'none'}
        stroke={theme.accent} strokeWidth={1} />
    ))}
    <path d={`M22 42 V28 a20 18 0 0 1 40 0 V42`} fill="none" stroke={theme.accent} strokeWidth={1.5} />
    <text x={42} y={78} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize={11}
      fill={theme.inkDim} letterSpacing="0.14em">{closed}/3</text>
  </svg>;
}

function Pillar({ p, index }) {
  const { theme } = useApp();
  const pct = (p.current / p.target) * 100;
  return <div style={{
    padding: '18px', borderTop: `1px solid ${theme.accent}`,
    borderRight: index < 3 ? `1px solid ${theme.rule2}` : 'none',
  }}>
    <Meta>PILLAR {index}</Meta>
    <div style={{ marginTop: 6, fontFamily: 'Newsreader, serif', fontSize: 17, color: theme.ink, fontWeight: 500 }}>{p.label}</div>
    <div className="ls-num" style={{ marginTop: 14, fontSize: 32, color: theme.ink, fontWeight: 400 }}>
      {p.current}<span style={{ fontSize: 14, color: theme.inkFaint }}>{p.unit}</span>
    </div>
    <Mono dim size={10} style={{ display: 'block', marginTop: 6 }}>OF {p.target}{p.unit} TARGET</Mono>
    <div style={{ marginTop: 12, height: 3, background: theme.rule2, position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, width: `${pct}%`, background: theme.accent }} />
    </div>
  </div>;
}

// ── Level History ──────────────────────────────────────────────────────────
function LevelHistory({ device }) {
  const { theme, data, setRoute } = useApp();
  const xpDaily = useM(() => Array.from({ length: 14 }, () => Math.round(50 + Math.random() * 90)), []);
  const milestones = [
    { lvl: 1, xp: 0,     date: '12 May 2026' },
    { lvl: 2, xp: 200,   date: '14 May 2026' },
    { lvl: 3, xp: 500,   date: '17 May 2026' },
    { lvl: 4, xp: 950,   date: '22 May 2026' },
  ];

  return <ScreenScroll>
    <div style={{ padding: device === 'phone' ? '18px 18px 28px' : '28px 40px 44px', maxWidth: 820 }}>
      <button onClick={() => setRoute({ tab: 'character', sub: null, params: {} })}
        className="ls-press ls-mono" style={{
          background: 'transparent', border: 'none', color: theme.inkMute, padding: 0,
          fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer',
        }}>← Character</button>

      <PageHeader overline="LEVEL HISTORY" title={`Level ${data.player.level}`} meta={`${data.player.totalXP.toLocaleString()} TOTAL XP · ${data.player.xpToNext} TO NEXT`} />

      <div style={{ marginTop: 22 }}>
        <Meta style={{ marginBottom: 8 }}>XP / DAY · LAST 14</Meta>
        <div style={{ padding: '10px 12px', border: `1px solid ${theme.rule2}` }}>
          <MiniBars data={xpDaily} height={70} color={theme.accent} />
          <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
            <Mono dim size={10}>14D AGO</Mono>
            <Mono dim size={10}>NOW · {xpDaily[xpDaily.length - 1]} XP</Mono>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 26 }}>
        <Meta style={{ marginBottom: 8 }}>MILESTONES</Meta>
        <div style={{ borderTop: `1px solid ${theme.rule}` }}>
          {milestones.map(m => (
            <div key={m.lvl} style={{
              padding: '12px 0', borderBottom: `1px solid ${theme.rule2}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'baseline' }}>
                <Mono size={14} bold style={{ color: theme.ink }}>LVL {String(m.lvl).padStart(2,'0')}</Mono>
                <Mono dim size={11}>{m.date}</Mono>
              </div>
              <Mono dim size={11}>{m.xp.toLocaleString()} XP</Mono>
            </div>
          ))}
          <div style={{ padding: '12px 0', display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'baseline' }}>
              <Mono size={14} bold style={{ color: theme.accent }}>LVL 05</Mono>
              <Mono dim size={11}>ETA · 6 DAYS AT CURRENT PACE</Mono>
            </div>
            <Mono dim size={11}>1,625 XP</Mono>
          </div>
        </div>
      </div>
    </div>
  </ScreenScroll>;
}

Object.assign(window, { CharacterTab });
