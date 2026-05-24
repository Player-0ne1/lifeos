// screen-quests.jsx — TAB III · QUESTS.
// Quest log, arc tracker, GT Cup arc, quest library, hidden quests.

function QuestsTab({ device }) {
  const { route } = useApp();
  if (route.sub === 'arc')     return <ArcTracker device={device} />;
  if (route.sub === 'gt')      return <GTCupScreen device={device} />;
  if (route.sub === 'library') return <QuestLibrary device={device} />;
  if (route.sub === 'hidden')  return <HiddenQuests device={device} />;
  if (route.sub === 'log')     return <QuestLog device={device} />;
  return <QuestsHome device={device} />;
}

// ── Home / index ────────────────────────────────────────────────────────────
function QuestsHome({ device }) {
  const { theme, data, setRoute } = useApp();
  return <ScreenScroll>
    <div style={{ padding: device === 'phone' ? '20px 18px 28px' : '34px 40px 44px', maxWidth: 920 }}>
      <PageHeader overline="QUESTS" title="The Record" meta="Every quest ever assigned. Every arc. Every emergent dispatch." />

      {/* Active Arc card */}
      <div style={{ marginTop: 22 }}>
        <Meta style={{ marginBottom: 8 }}>ACTIVE ARC</Meta>
        <ArcMini arc={data.arc} />
      </div>

      <div style={{ marginTop: 24, borderTop: `1px solid ${theme.rule}` }}>
        <RowLink onClick={() => setRoute({ tab: 'quests', sub: 'log', params: {} })}
          right={`${data.questLog.length} ENTRIES`}>Quest Log</RowLink>
        <RowLink onClick={() => setRoute({ tab: 'quests', sub: 'arc', params: {} })}
          right={`DAY ${data.arc.dayElapsed}/${data.arc.dayTotal}`}>Arc Quest Tracker</RowLink>
        <RowLink onClick={() => setRoute({ tab: 'quests', sub: 'gt', params: {} })}
          right={`PHASE ${data.gt.phase} · ${data.gt.phaseName}`}>GT Cup Arc · 2027</RowLink>
        <RowLink onClick={() => setRoute({ tab: 'quests', sub: 'library', params: {} })}
          right={`${data.library.length} TEMPLATES`}>Quest Library</RowLink>
        <RowLink onClick={() => setRoute({ tab: 'quests', sub: 'hidden', params: {} })}
          right="0 ACTIVE">Hidden Quests</RowLink>
      </div>

      <Mono dim size={10} style={{ display: 'block', marginTop: 22, letterSpacing: '0.14em', fontStyle: 'italic' }}>
        The library is the pool. The arc is the line. The log is the record. None of these are negotiable.
      </Mono>
    </div>
  </ScreenScroll>;
}

// ── Quest Log ───────────────────────────────────────────────────────────────
function QuestLog({ device }) {
  const { theme, data, setRoute } = useApp();
  const [filterStat, setFilterStat] = useS('ALL');
  const [filterStatus, setFilterStatus] = useS('ALL');
  const visible = data.questLog.filter(q =>
    (filterStat === 'ALL' || q.stat === filterStat) &&
    (filterStatus === 'ALL' || q.status === filterStatus.toLowerCase())
  );
  const total = data.questLog.length;
  const cmp = data.questLog.filter(q => q.status === 'complete').length;
  const failed = data.questLog.filter(q => q.status === 'failed').length;
  const rate = total ? Math.round((cmp / total) * 100) : 0;

  return <ScreenScroll>
    <div style={{ padding: device === 'phone' ? '18px 18px 28px' : '28px 40px 44px', maxWidth: 920 }}>
      <button onClick={() => setRoute({ tab: 'quests', sub: null, params: {} })}
        className="ls-press ls-mono" style={{
          background: 'transparent', border: 'none', color: theme.inkMute, padding: 0,
          fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer',
        }}>← Quests</button>

      <PageHeader overline="LOG" title="Quest History" meta={`${total} entries · ${cmp} complete · ${failed} failed · ${rate}% rate`} />

      <div style={{ marginTop: 18, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {['ALL', ...STATS].map(s => (
          <button key={s} onClick={() => setFilterStat(s)} className="ls-mono ls-press" style={{
            background: filterStat === s ? theme.ink : 'transparent',
            border: `1px solid ${filterStat === s ? theme.ink : theme.rule}`,
            color: filterStat === s ? theme.bg : (s !== 'ALL' ? theme.stat[s] : theme.inkDim),
            padding: '6px 10px', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
            cursor: 'pointer', borderRadius: 0,
          }}>{s}</button>
        ))}
      </div>
      <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
        {['ALL', 'Complete', 'Failed'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} className="ls-mono ls-press" style={{
            background: filterStatus === s ? theme.ink : 'transparent',
            border: `1px solid ${filterStatus === s ? theme.ink : theme.rule}`,
            color: filterStatus === s ? theme.bg : theme.inkDim,
            padding: '6px 10px', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
            cursor: 'pointer', borderRadius: 0,
          }}>{s}</button>
        ))}
      </div>

      <div style={{ marginTop: 18, borderTop: `1px solid ${theme.rule}` }}>
        {visible.map(q => (
          <div key={q.id} style={{
            display: 'grid',
            gridTemplateColumns: device === 'phone' ? '70px 60px 1fr 60px' : '90px 80px 1fr 80px',
            gap: 10, padding: '10px 0', borderBottom: `1px solid ${theme.rule2}`,
            alignItems: 'center',
          }}>
            <Mono dim size={11}>{q.dt}</Mono>
            <Pill color={theme.stat[q.stat]} border={theme.stat[q.stat]} style={{ fontSize: 9 }}>{q.stat}</Pill>
            <span style={{ fontFamily: 'Newsreader, serif', fontSize: 14, color: theme.ink }}>{q.title}</span>
            <Mono size={10} style={{ textAlign: 'right', color: q.status === 'complete' ? theme.good : theme.danger }}>
              {q.status === 'complete' ? `+${q.xp}` : 'FAIL'}
            </Mono>
          </div>
        ))}
      </div>
    </div>
  </ScreenScroll>;
}

// ── Arc Tracker ─────────────────────────────────────────────────────────────
function ArcTracker({ device }) {
  const { theme, data, setRoute } = useApp();
  const a = data.arc;
  const expectedPercent = Math.round((a.dayElapsed / a.dayTotal) * 100);

  return <ScreenScroll>
    <div style={{ padding: device === 'phone' ? '18px 18px 28px' : '28px 40px 44px', maxWidth: 820 }}>
      <button onClick={() => setRoute({ tab: 'quests', sub: null, params: {} })}
        className="ls-press ls-mono" style={{
          background: 'transparent', border: 'none', color: theme.inkMute, padding: 0,
          fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer',
        }}>← Quests</button>

      <Meta style={{ color: theme.accent, marginTop: 14 }}>ACTIVE ARC · {a.stat}</Meta>
      <h1 style={{ fontFamily: 'Newsreader, serif', fontSize: 36, fontWeight: 400, marginTop: 8, color: theme.ink, letterSpacing: '-0.01em' }}>
        {a.title}
      </h1>
      <p style={{ marginTop: 10, color: theme.inkDim, fontStyle: 'italic', fontWeight: 300, maxWidth: 540 }}>
        Success condition: "{a.successCondition}"
      </p>

      <div style={{
        marginTop: 22,
        display: 'grid', gridTemplateColumns: device === 'phone' ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        border: `1px solid ${theme.rule}`,
      }}>
        {[
          { l: 'DAY', v: `${a.dayElapsed}/${a.dayTotal}` },
          { l: 'COMPLETE', v: `${a.percent}%` },
          { l: 'EXPECTED', v: `${expectedPercent}%` },
          { l: 'NEEDED/DAY', v: `${a.paceRequired}%` },
        ].map((c,i,arr) => (
          <div key={i} style={{
            padding: '14px',
            borderRight: i % (device === 'phone' ? 2 : 4) < (device === 'phone' ? 1 : 3) ? `1px solid ${theme.rule2}` : 'none',
            borderBottom: device === 'phone' && i < 2 ? `1px solid ${theme.rule2}` : 'none',
          }}>
            <Meta>{c.l}</Meta>
            <div className="ls-num" style={{ fontSize: 24, marginTop: 4, color: theme.ink, fontWeight: 500 }}>{c.v}</div>
          </div>
        ))}
      </div>

      {/* Progress bar with pace marker */}
      <div style={{ marginTop: 22 }}>
        <Meta>PROGRESS</Meta>
        <div style={{ marginTop: 8, height: 8, background: theme.rule2, position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, width: `${a.percent}%`, background: theme.accent }} />
          <div style={{ position: 'absolute', top: -4, left: `${expectedPercent}%`, width: 1, height: 16, background: theme.warn }} />
          <div className="ls-mono" style={{
            position: 'absolute', top: -18, left: `${expectedPercent}%`,
            fontSize: 9, color: theme.warn, transform: 'translateX(-50%)', letterSpacing: '0.1em',
          }}>EXPECTED</div>
        </div>
      </div>

      <div style={{ marginTop: 22, padding: '14px 16px', border: `1px solid ${theme.warn}` }}>
        <Meta style={{ color: theme.warn }}>PACE · BEHIND</Meta>
        <p style={{ marginTop: 6, fontFamily: 'Newsreader, serif', fontSize: 15, color: theme.ink, fontStyle: 'italic' }}>
          You are {expectedPercent - a.percent}% behind expected pace. The final 16 days require {a.paceRequired}% per day to close. The System will weight BUILDER quests harder for the remainder.
        </p>
      </div>

      <div style={{ marginTop: 22 }}>
        <Meta style={{ marginBottom: 8 }}>WEEKLY UPDATES</Meta>
        <div style={{ borderTop: `1px solid ${theme.rule2}` }}>
          {[
            { d: '14 Jun', n: 'Sent two pitches. One reply. Both followups pending. Behind plan.' },
            { d: '07 Jun', n: 'Landing page live. Three demo conversations. Zero commitments.' },
            { d: '31 May', n: 'Wrote the offer doc. Did not send it. The week was the offer doc.' },
          ].map((u, i) => (
            <div key={i} style={{ padding: '10px 0', borderBottom: `1px solid ${theme.rule2}` }}>
              <Mono size={11} dim>{u.d}</Mono>
              <div style={{ marginTop: 4, fontFamily: 'Newsreader, serif', fontSize: 14, color: theme.ink, fontStyle: 'italic' }}>{u.n}</div>
            </div>
          ))}
        </div>
      </div>

      <Btn variant="primary" full style={{ marginTop: 22, padding: '14px 22px' }}>Update Progress ▸</Btn>
    </div>
  </ScreenScroll>;
}

// ── GT Cup screen ───────────────────────────────────────────────────────────
function GTCupScreen({ device }) {
  const { theme, data, setRoute } = useApp();
  const gt = data.gt;
  const fundPct = (gt.fund / gt.fundTarget) * 100;
  const phases = [
    { n: 1, name: 'Foundation',  range: 'May–Aug 2026' },
    { n: 2, name: 'First Contact',range: 'Sep–Nov 2026' },
    { n: 3, name: 'Development', range: 'Dec 2026–Feb 2027' },
    { n: 4, name: 'Race Ready',  range: 'Mar–May 2027' },
  ];

  return <ScreenScroll>
    <div style={{ padding: device === 'phone' ? '18px 18px 28px' : '28px 40px 44px', maxWidth: 920 }}>
      <button onClick={() => setRoute({ tab: 'quests', sub: null, params: {} })}
        className="ls-press ls-mono" style={{
          background: 'transparent', border: 'none', color: theme.inkMute, padding: 0,
          fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer',
        }}>← Quests</button>

      <Meta style={{ color: theme.accent, marginTop: 14 }}>MEGA ARC · 12 MONTHS</Meta>
      <h1 style={{ fontFamily: 'Newsreader, serif', fontSize: 32, fontWeight: 400, marginTop: 8, color: theme.ink, letterSpacing: '-0.01em' }}>
        Continental GT Cup · Amateur · 2027
      </h1>
      <p style={{ marginTop: 8, color: theme.inkDim, fontStyle: 'italic', fontWeight: 300 }}>
        Registration opens {gt.registrationOpens}. Until then, the system builds you.
      </p>

      {/* Phase tracker */}
      <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: device === 'phone' ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 0 }}>
        {phases.map(p => {
          const active = p.n === gt.phase;
          const done = p.n < gt.phase;
          return <div key={p.n} style={{
            padding: '14px',
            borderTop: `2px solid ${active ? theme.accent : done ? theme.good : theme.rule}`,
            borderRight: p.n < phases.length ? `1px solid ${theme.rule2}` : 'none',
            opacity: done ? 0.85 : 1,
          }}>
            <Meta style={{ color: active ? theme.accent : done ? theme.good : theme.inkMute }}>
              {done ? '✓ ' : ''}PHASE {p.n}
            </Meta>
            <div style={{ marginTop: 6, fontFamily: 'Newsreader, serif', fontSize: 17, color: theme.ink }}>{p.name}</div>
            <Mono dim size={10} style={{ display: 'block', marginTop: 4 }}>{p.range}</Mono>
          </div>;
        })}
      </div>

      {/* Metrics row */}
      <div style={{
        marginTop: 26, display: 'grid',
        gridTemplateColumns: device === 'phone' ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        border: `1px solid ${theme.rule}`,
      }}>
        {[
          { l: '5K BEST', v: gt.fiveK,    sub: `TGT ${gt.fiveKTarget}` },
          { l: 'TRAIN/MO',v: `${gt.trainingDays}D`, sub: 'TGT 12D' },
          { l: 'TRACK',   v: `${gt.trackDays}`, sub: 'TGT 6' },
          { l: 'CONTACTS',v: `${gt.contacts}`, sub: 'GT CUP ALUMNI' },
        ].map((c,i,a) => (
          <div key={i} style={{
            padding: '14px',
            borderRight: i % (device === 'phone' ? 2 : 4) < (device === 'phone' ? 1 : 3) ? `1px solid ${theme.rule2}` : 'none',
            borderBottom: device === 'phone' && i < 2 ? `1px solid ${theme.rule2}` : 'none',
          }}>
            <Meta>{c.l}</Meta>
            <div className="ls-num" style={{ fontSize: 22, marginTop: 4, color: theme.ink, fontWeight: 500 }}>{c.v}</div>
            <Mono dim size={10}>{c.sub}</Mono>
          </div>
        ))}
      </div>

      {/* Fund progress */}
      <div style={{ marginTop: 26, padding: '18px', border: `1px solid ${theme.rule}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Meta>GT CUP FUND</Meta>
          <Mono size={11} dim>{(11).toFixed(1)} MONTHS REMAIN</Mono>
        </div>
        <div className="ls-num" style={{ marginTop: 8, fontSize: 30, color: theme.ink, fontWeight: 400 }}>
          ₹{gt.fund.toLocaleString('en-IN')}
          <span style={{ color: theme.inkFaint, fontSize: 18 }}> / ₹{gt.fundTarget.toLocaleString('en-IN')}</span>
        </div>
        <div style={{ marginTop: 14, height: 6, background: theme.rule2, position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, width: `${fundPct}%`, background: theme.accent }} />
        </div>
        <Mono size={10} dim style={{ display: 'block', marginTop: 6 }}>
          {Math.round(fundPct)}% · CONTRIBUTING ₹25K/MO STARTING SEP 2026
        </Mono>
      </div>

      {/* Gear */}
      <div style={{ marginTop: 22 }}>
        <Meta style={{ marginBottom: 8 }}>SAFETY GEAR · FMSCI APPROVED</Meta>
        <div style={{ borderTop: `1px solid ${theme.rule}` }}>
          {Object.entries(gt.gear).map(([k, v]) => (
            <div key={k} style={{
              padding: '10px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderBottom: `1px solid ${theme.rule2}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Glyph kind={v === 'Owned' ? 'check' : 'circle'} color={v === 'Owned' ? theme.good : theme.inkMute} />
                <span style={{ fontSize: 14 }}>{k}</span>
              </div>
              <Mono size={11} style={{ color: v === 'Owned' ? theme.good : v === 'Ordered' ? theme.warn : theme.inkMute }}>
                {v.toUpperCase()}
              </Mono>
            </div>
          ))}
        </div>
      </div>
    </div>
  </ScreenScroll>;
}

// ── Quest Library ───────────────────────────────────────────────────────────
function QuestLibrary({ device }) {
  const { theme, data, setRoute } = useApp();
  const [filter, setFilter] = useS('ALL');
  const visible = filter === 'ALL' ? data.library : data.library.filter(q => q.stat === filter);

  return <ScreenScroll>
    <div style={{ padding: device === 'phone' ? '18px 18px 28px' : '28px 40px 44px', maxWidth: 920 }}>
      <button onClick={() => setRoute({ tab: 'quests', sub: null, params: {} })}
        className="ls-press ls-mono" style={{
          background: 'transparent', border: 'none', color: theme.inkMute, padding: 0,
          fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer',
        }}>← Quests</button>

      <PageHeader
        overline="LIBRARY"
        title="Quest Templates"
        meta={`${data.library.length} of 59 shown · the pool the System draws from`} />

      <div style={{ marginTop: 14, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {['ALL', ...STATS].map(s => (
          <button key={s} onClick={() => setFilter(s)} className="ls-mono ls-press" style={{
            background: filter === s ? theme.ink : 'transparent',
            border: `1px solid ${filter === s ? theme.ink : theme.rule}`,
            color: filter === s ? theme.bg : (s !== 'ALL' ? theme.stat[s] : theme.inkDim),
            padding: '6px 10px', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
            cursor: 'pointer', borderRadius: 0,
          }}>{s}</button>
        ))}
      </div>

      <div style={{ marginTop: 18, borderTop: `1px solid ${theme.rule}` }}>
        {visible.map((q, i) => (
          <div key={i} style={{
            padding: '12px 0', borderBottom: `1px solid ${theme.rule2}`,
            display: 'grid',
            gridTemplateColumns: device === 'phone' ? '70px 1fr 60px' : '90px 90px 1fr 90px 90px',
            gap: 10, alignItems: 'center',
          }}>
            <Pill color={theme.stat[q.stat]} border={theme.stat[q.stat]} style={{ fontSize: 9 }}>{q.stat}</Pill>
            {device !== 'phone' && <Mono dim size={10}>{q.difficulty}</Mono>}
            <span style={{ fontFamily: 'Newsreader, serif', fontSize: 14, color: theme.ink }}>{q.title}</span>
            {device !== 'phone' && <Mono dim size={10}>{q.time}</Mono>}
            <Mono size={11} style={{ textAlign: 'right', color: theme.accent }}>+{q.xp}</Mono>
          </div>
        ))}
      </div>
    </div>
  </ScreenScroll>;
}

// ── Hidden Quests ──────────────────────────────────────────────────────────
function HiddenQuests({ device }) {
  const { theme, setRoute } = useApp();
  return <ScreenScroll>
    <div style={{ padding: device === 'phone' ? '18px 18px 28px' : '28px 40px 44px', maxWidth: 760 }}>
      <button onClick={() => setRoute({ tab: 'quests', sub: null, params: {} })}
        className="ls-press ls-mono" style={{
          background: 'transparent', border: 'none', color: theme.inkMute, padding: 0,
          fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer',
        }}>← Quests</button>

      <PageHeader overline="EMERGENT" title="Hidden Quests" meta="Triggered when the System detects a pattern." />

      <div style={{ marginTop: 24, padding: '40px 22px', border: `1px dashed ${theme.rule}`, textAlign: 'center' }}>
        <Meta>NO ACTIVE HIDDEN QUEST</Meta>
        <p style={{ marginTop: 10, color: theme.inkDim, fontStyle: 'italic' }}>
          The System is watching. It will speak when a pattern emerges.
        </p>
      </div>

      <div style={{ marginTop: 28 }}>
        <Meta style={{ marginBottom: 8 }}>TRIGGER CONDITIONS · REFERENCE</Meta>
        {[
          ['Stat dormant ≥ 13 days', 'Auto-issue Easy quest in dormant stat.'],
          ['Three consecutive failed days', 'Issue corrective quest in failed stat. Hard difficulty.'],
          ['Arc completion < 50% at Day 20', 'Issue acceleration quest. ARC-tagged.'],
          ['Same exception clause used 2 weeks running', 'Issue diagnostic reflection quest.'],
          ['Energy ≤ 2 for 5+ days', 'Issue BODY recovery quest. Mandatory.'],
        ].map(([t, d], i) => (
          <div key={i} style={{ padding: '10px 0', borderBottom: `1px solid ${theme.rule2}` }}>
            <div style={{ fontFamily: 'Newsreader, serif', fontSize: 14, color: theme.ink }}>{t}</div>
            <Mono dim size={11} style={{ display: 'block', marginTop: 2 }}>→ {d}</Mono>
          </div>
        ))}
      </div>
    </div>
  </ScreenScroll>;
}

Object.assign(window, { QuestsTab });
