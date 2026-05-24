// screen-ledger.jsx — TAB IV · LEDGER.
// Current week, Sunday ritual entry, weekly history, penalty log, financial log, add entry.

function LedgerTab({ device }) {
  const { route } = useApp();
  if (route.sub === 'history')   return <WeeklyHistory device={device} />;
  if (route.sub === 'penalty')   return <PenaltyLog device={device} />;
  if (route.sub === 'financial') return <FinancialLog device={device} />;
  if (route.sub === 'add')       return <AddFinancialEntry device={device} />;
  return <LedgerHome device={device} />;
}

// ── Current Week / Home ─────────────────────────────────────────────────────
function LedgerHome({ device }) {
  const { theme, voice, data, setOverlay, setRoute } = useApp();
  const w = data.week;
  const penalty = w.rate >= 90 ? 0 : w.rate >= 75 ? 2500 : 5000;
  const totalPaid = data.penalties.reduce((s, p) => s + p.amount, 0);
  const ringColor = w.rate >= 90 ? theme.good : w.rate >= 75 ? theme.warn : theme.danger;

  return <ScreenScroll>
    <div style={{ padding: device === 'phone' ? '20px 18px 28px' : '34px 40px 44px', maxWidth: 920 }}>
      <Meta>WEEK {String(w.number).padStart(2,'0')} · {w.range}</Meta>
      <h1 style={{ fontFamily: 'Newsreader, serif', fontSize: device === 'phone' ? 28 : 38, fontWeight: 400, marginTop: 8, color: theme.ink }}>
        Live ledger.
      </h1>

      {/* Hero ring + breakdown */}
      <div style={{
        marginTop: 22,
        display: 'grid', gridTemplateColumns: device === 'phone' ? '1fr' : 'auto 1fr',
        gap: device === 'phone' ? 18 : 32,
        alignItems: 'center', padding: '20px',
        border: `1px solid ${theme.rule}`,
      }}>
        <div>
          <Ring value={w.rate} size={140} color={ringColor} />
          <Mono dim size={10} style={{ display: 'block', textAlign: 'center', marginTop: 10 }}>
            COMPLETION
          </Mono>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }}>
            {[
              { l: 'ASGD', v: w.assigned, c: theme.ink },
              { l: 'COMP', v: w.complete, c: theme.good },
              { l: 'FAIL', v: w.failed,   c: theme.danger },
              { l: 'PEND', v: w.pending,  c: theme.warn },
            ].map((c,i,a) => (
              <div key={i} style={{
                padding: '8px 10px', borderRight: i < a.length - 1 ? `1px solid ${theme.rule2}` : 'none',
              }}>
                <Meta>{c.l}</Meta>
                <div className="ls-num" style={{ fontSize: 22, marginTop: 2, color: c.c, fontWeight: 500 }}>{c.v}</div>
              </div>
            ))}
          </div>

          <div style={{ padding: '12px 14px', border: `1px solid ${penalty > 0 ? theme.danger : theme.good}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <Meta style={{ color: penalty > 0 ? theme.danger : theme.good }}>
                {penalty > 0 ? 'PENALTY TRACKING' : 'CLEAN WEEK'}
              </Meta>
              <Mono size={10} dim>
                {w.rate >= 90 ? '≥90% TIER' : w.rate >= 75 ? '75–89% TIER' : '<75% TIER'}
              </Mono>
            </div>
            <div className="ls-num" style={{ marginTop: 6, fontSize: 32, color: penalty > 0 ? theme.danger : theme.good, fontWeight: 500 }}>
              ₹{penalty.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* XP + Bonus */}
      <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', border: `1px solid ${theme.rule}` }}>
        {[
          { l: 'XP THIS WEEK', v: w.xp.toLocaleString() },
          { l: 'BONUS DONE',  v: w.bonusComplete },
          { l: 'DAYS LEFT',   v: '1D 4H' },
        ].map((c,i,a) => (
          <div key={i} style={{ padding: '12px', borderRight: i < a.length - 1 ? `1px solid ${theme.rule2}` : 'none' }}>
            <Meta>{c.l}</Meta>
            <div className="ls-num" style={{ fontSize: 20, marginTop: 4, color: theme.ink, fontWeight: 500 }}>{c.v}</div>
          </div>
        ))}
      </div>

      {/* Sunday Ritual CTA */}
      <button onClick={() => setOverlay({ kind: 'sunday' })} className="ls-press" style={{
        marginTop: 22, width: '100%', padding: '18px 22px',
        background: theme.ink, color: theme.bg, border: 'none',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase',
        fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderRadius: 0, whiteSpace: 'nowrap',
      }}>
        <span>{voice.sundayOpen}</span>
        <Glyph kind="arrow-right" color={theme.bg} size={14} />
      </button>

      <Mono dim size={10} style={{ display: 'block', textAlign: 'center', marginTop: 8, letterSpacing: '0.14em' }}>
        AVAILABLE FROM SUNDAY 20:00 IST · CURRENT TIME 18:43
      </Mono>

      {/* Quick links */}
      <div style={{ marginTop: 26, borderTop: `1px solid ${theme.rule}` }}>
        <RowLink onClick={() => setRoute({ tab: 'ledger', sub: 'history', params: {} })}
          right={`${data.pastWeeks.length} PAST WEEKS`}>Weekly History</RowLink>
        <RowLink onClick={() => setRoute({ tab: 'ledger', sub: 'penalty', params: {} })}
          right={`₹${totalPaid.toLocaleString('en-IN')} TOTAL`}>Penalty Log · all transfers</RowLink>
        <RowLink onClick={() => setRoute({ tab: 'ledger', sub: 'financial', params: {} })}
          right="JUN 2026">Financial Log</RowLink>
      </div>
    </div>
  </ScreenScroll>;
}

// ── Weekly History ─────────────────────────────────────────────────────────
function WeeklyHistory({ device }) {
  const { theme, data, setRoute } = useApp();
  const totalPenalty = data.penalties.reduce((s, p) => s + p.amount, 0);
  const cleanStreak = 1;

  return <ScreenScroll>
    <div style={{ padding: device === 'phone' ? '18px 18px 28px' : '28px 40px 44px', maxWidth: 920 }}>
      <button onClick={() => setRoute({ tab: 'ledger', sub: null, params: {} })}
        className="ls-press ls-mono" style={{
          background: 'transparent', border: 'none', color: theme.inkMute, padding: 0,
          fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer',
        }}>← Ledger</button>

      <PageHeader overline="WEEKLY" title="History" meta={`${data.pastWeeks.length} closed · ₹${totalPenalty.toLocaleString('en-IN')} paid · ${cleanStreak} clean streak`} />

      <div style={{ marginTop: 22 }}>
        <Meta style={{ marginBottom: 8 }}>COMPLETION TREND</Meta>
        <div style={{ border: `1px solid ${theme.rule2}`, padding: '12px 14px' }}>
          <Spark data={data.pastWeeks.map(w => w.rate)} height={50} color={theme.accent} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <Mono dim size={10}>WK 01</Mono>
            <Mono dim size={10}>WK {String(data.pastWeeks.length).padStart(2,'0')}</Mono>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 22, borderTop: `1px solid ${theme.rule}` }}>
        {[...data.pastWeeks, { number: data.week.number, range: data.week.range, rate: data.week.rate, penalty: 0, status: 'Open' }].map(w => (
          <div key={w.number} style={{
            padding: '12px 0', borderBottom: `1px solid ${theme.rule2}`,
            display: 'grid', gridTemplateColumns: device === 'phone' ? '60px 1fr 80px' : '80px 1fr 100px 100px',
            gap: 10, alignItems: 'center',
          }}>
            <Mono size={14} bold>WK {String(w.number).padStart(2,'0')}</Mono>
            <span style={{ fontFamily: 'Newsreader, serif', fontSize: 14, color: theme.inkDim }}>{w.range}</span>
            {device !== 'phone' && <Mono dim size={11}>{w.status}</Mono>}
            <Mono size={11} style={{
              textAlign: 'right',
              color: w.penalty > 0 ? theme.danger : w.status === 'Open' ? theme.inkDim : theme.good,
            }}>
              {w.rate}% · {w.penalty > 0 ? `₹${w.penalty}` : w.status === 'Open' ? 'LIVE' : '₹0'}
            </Mono>
          </div>
        ))}
      </div>
    </div>
  </ScreenScroll>;
}

// ── Penalty Log ─────────────────────────────────────────────────────────────
function PenaltyLog({ device }) {
  const { theme, data, setRoute } = useApp();
  const total = data.penalties.reduce((s, p) => s + p.amount, 0);

  return <ScreenScroll>
    <div style={{ padding: device === 'phone' ? '18px 18px 28px' : '28px 40px 44px', maxWidth: 820 }}>
      <button onClick={() => setRoute({ tab: 'ledger', sub: null, params: {} })}
        className="ls-press ls-mono" style={{
          background: 'transparent', border: 'none', color: theme.inkMute, padding: 0,
          fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer',
        }}>← Ledger</button>

      <Meta>PENALTY LOG · IMMUTABLE</Meta>
      <h1 style={{ fontFamily: 'Newsreader, serif', fontSize: 32, fontWeight: 400, marginTop: 8, color: theme.ink }}>
        Every rupee. Permanent record.
      </h1>

      <div style={{
        marginTop: 22, padding: '24px',
        border: `1px solid ${total > 0 ? theme.danger : theme.good}`, textAlign: 'center',
      }}>
        <Meta style={{ color: total > 0 ? theme.danger : theme.good }}>
          ALL-TIME PAID
        </Meta>
        <div className="ls-num" style={{ fontSize: 48, marginTop: 8, color: theme.ink, fontWeight: 400 }}>
          ₹{total.toLocaleString('en-IN')}
        </div>
        <Mono dim size={10} style={{ display: 'block', marginTop: 6 }}>
          ACROSS {data.penalties.filter(p => p.amount > 0).length} TRANSFER{data.penalties.filter(p => p.amount > 0).length === 1 ? '' : 'S'} · TO DAD · NO RETURN
        </Mono>
      </div>

      <div style={{ marginTop: 22, borderTop: `1px solid ${theme.rule}` }}>
        {data.penalties.map(p => (
          <div key={p.week} style={{
            padding: '14px 0', borderBottom: `1px solid ${theme.rule2}`,
            display: 'flex', alignItems: 'flex-start', gap: 14,
          }}>
            <Mono size={11} bold style={{ minWidth: 70 }}>WK {String(p.week).padStart(2,'0')}</Mono>
            <div style={{ flex: 1 }}>
              <Mono dim size={11}>{p.date}</Mono>
              <div style={{ marginTop: 4, fontFamily: 'Newsreader, serif', fontSize: 14, color: theme.ink, fontStyle: 'italic' }}>
                {p.note}
              </div>
            </div>
            <Mono size={14} bold style={{ color: p.amount > 0 ? theme.danger : theme.good, minWidth: 90, textAlign: 'right' }}>
              {p.amount > 0 ? `₹${p.amount.toLocaleString('en-IN')}` : '₹0'}
            </Mono>
          </div>
        ))}
      </div>
    </div>
  </ScreenScroll>;
}

// ── Financial Log ───────────────────────────────────────────────────────────
function FinancialLog({ device }) {
  const { theme, data, setRoute } = useApp();
  const [filter, setFilter] = useS('ALL');
  const filtered = filter === 'ALL' ? data.financial : data.financial.filter(f => f.cat === filter);
  const income = data.financial.filter(f => f.dir === 'in').reduce((s, f) => s + f.amt, 0);
  const expense = data.financial.filter(f => f.dir === 'out').reduce((s, f) => s + f.amt, 0);
  const savingsRate = income > 0 ? Math.round(((income - expense) / income) * 100) : 0;
  const gtFund = data.financial.filter(f => f.cat === 'GT Cup Fund' && f.dir === 'out').reduce((s, f) => s + f.amt, 0);
  const cats = [...new Set(data.financial.map(f => f.cat))];

  return <ScreenScroll>
    <div style={{ padding: device === 'phone' ? '18px 18px 28px' : '28px 40px 44px', maxWidth: 920 }}>
      <button onClick={() => setRoute({ tab: 'ledger', sub: null, params: {} })}
        className="ls-press ls-mono" style={{
          background: 'transparent', border: 'none', color: theme.inkMute, padding: 0,
          fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer',
        }}>← Ledger</button>

      <PageHeader overline="FINANCIAL LOG" title="June 2026"
        right={<Btn variant="primary" size="sm" onClick={() => setRoute({ tab: 'ledger', sub: 'add', params: {} })}>+ Entry</Btn>} />

      <div style={{
        marginTop: 22, display: 'grid',
        gridTemplateColumns: device === 'phone' ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        border: `1px solid ${theme.rule}`,
      }}>
        {[
          { l: 'INCOME',   v: `₹${(income/1000).toFixed(0)}K`,  c: theme.good },
          { l: 'EXPENSE',  v: `₹${(expense/1000).toFixed(0)}K`, c: theme.danger },
          { l: 'SAVE %',   v: `${savingsRate}%`,                c: theme.ink },
          { l: 'GT FUND',  v: `₹${(gtFund/1000).toFixed(0)}K`,  c: theme.accent },
        ].map((c,i,a) => (
          <div key={i} style={{
            padding: '14px',
            borderRight: i % (device === 'phone' ? 2 : 4) < (device === 'phone' ? 1 : 3) ? `1px solid ${theme.rule2}` : 'none',
            borderBottom: device === 'phone' && i < 2 ? `1px solid ${theme.rule2}` : 'none',
          }}>
            <Meta>{c.l}</Meta>
            <div className="ls-num" style={{ fontSize: 22, marginTop: 4, color: c.c, fontWeight: 500 }}>{c.v}</div>
          </div>
        ))}
      </div>

      {/* Corpus tracker */}
      <div style={{ marginTop: 22, padding: '16px 18px', border: `1px solid ${theme.accent}` }}>
        <Meta style={{ color: theme.accent }}>CORPUS · TOWARD RS. 2 CRORE</Meta>
        <div className="ls-num" style={{ marginTop: 8, fontSize: 32, color: theme.ink, fontWeight: 400 }}>
          ₹16,84,000<span style={{ color: theme.inkFaint, fontSize: 16 }}> / ₹2,00,00,000</span>
        </div>
        <div style={{ marginTop: 10, height: 4, background: theme.rule2, position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, width: '8.4%', background: theme.accent }} />
        </div>
        <Mono dim size={10} style={{ display: 'block', marginTop: 6 }}>
          8.4% OF TARGET · AT CURRENT RATE: 34 MONTHS
        </Mono>
      </div>

      {/* Filters */}
      <div style={{ marginTop: 22, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {['ALL', ...cats].map(c => (
          <button key={c} onClick={() => setFilter(c)} className="ls-mono ls-press" style={{
            background: filter === c ? theme.ink : 'transparent',
            border: `1px solid ${filter === c ? theme.ink : theme.rule}`,
            color: filter === c ? theme.bg : theme.inkDim,
            padding: '5px 10px', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
            cursor: 'pointer', borderRadius: 0,
          }}>{c}</button>
        ))}
      </div>

      {/* List */}
      <div style={{ marginTop: 14, borderTop: `1px solid ${theme.rule}` }}>
        {filtered.map(f => (
          <div key={f.id} style={{
            padding: '12px 0', borderBottom: `1px solid ${theme.rule2}`,
            display: 'grid',
            gridTemplateColumns: device === 'phone' ? '70px 1fr 90px' : '90px 110px 1fr 110px',
            gap: 10, alignItems: 'center',
          }}>
            <Mono dim size={11}>{f.dt.split(' ').slice(0, 2).join(' ')}</Mono>
            {device !== 'phone' && <Pill border={theme.rule}>{f.cat}</Pill>}
            <span style={{ fontFamily: 'Newsreader, serif', fontSize: 14, color: theme.ink }}>
              {device === 'phone' ? <><Mono size={10} dim>{f.cat}</Mono> · {f.note}</> : f.note}
            </span>
            <Mono size={13} bold style={{
              textAlign: 'right',
              color: f.dir === 'in' ? theme.good : theme.ink,
            }}>
              {f.dir === 'in' ? '+' : '−'} ₹{f.amt.toLocaleString('en-IN')}
            </Mono>
          </div>
        ))}
      </div>
    </div>
  </ScreenScroll>;
}

// ── Add Financial Entry ────────────────────────────────────────────────────
function AddFinancialEntry({ device }) {
  const { theme, setRoute } = useApp();
  const [dir, setDir] = useS('out');
  const [amt, setAmt] = useS('');
  const [cat, setCat] = useS('Food');
  const [note, setNote] = useS('');
  const cats = ['Salary','Freelance','Consulting','PickleJam','Food','Rent','Investment','GT Cup Fund','Travel','Other'];

  return <ScreenScroll>
    <div style={{ padding: device === 'phone' ? '18px 18px 28px' : '28px 40px 44px', maxWidth: 540 }}>
      <button onClick={() => setRoute({ tab: 'ledger', sub: 'financial', params: {} })}
        className="ls-press ls-mono" style={{
          background: 'transparent', border: 'none', color: theme.inkMute, padding: 0,
          fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer',
        }}>← Financial Log</button>

      <PageHeader overline="NEW ENTRY" title="Log a transaction" />

      <div style={{ marginTop: 22, display: 'flex', gap: 6 }}>
        {[
          { v: 'in',  l: 'INCOME',  c: theme.good },
          { v: 'out', l: 'EXPENSE', c: theme.danger },
        ].map(o => (
          <button key={o.v} onClick={() => setDir(o.v)} className="ls-press" style={{
            flex: 1, padding: '14px 0',
            background: dir === o.v ? o.c : 'transparent',
            border: `1px solid ${dir === o.v ? o.c : theme.rule}`,
            color: dir === o.v ? theme.bg : theme.inkDim,
            fontFamily: 'JetBrains Mono, monospace', fontSize: 12, letterSpacing: '0.18em',
            textTransform: 'uppercase', cursor: 'pointer', borderRadius: 0, fontWeight: 600,
          }}>{o.l}</button>
        ))}
      </div>

      <div style={{ marginTop: 22 }}>
        <Meta>AMOUNT</Meta>
        <div style={{
          marginTop: 8, padding: '20px 16px',
          background: theme.surface, border: `1px solid ${theme.rule}`,
          display: 'flex', alignItems: 'baseline', gap: 8,
        }}>
          <span className="ls-num" style={{ fontSize: 32, color: theme.inkMute }}>₹</span>
          <input value={amt} onChange={(e) => setAmt(e.target.value.replace(/[^\d]/g, ''))}
            placeholder="0" className="ls-num"
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: theme.ink, fontSize: 36, fontWeight: 400, letterSpacing: '-0.01em',
            }} />
        </div>
      </div>

      <div style={{ marginTop: 22 }}>
        <Meta>CATEGORY</Meta>
        <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {cats.map(c => (
            <button key={c} onClick={() => setCat(c)} className="ls-press ls-mono" style={{
              background: cat === c ? theme.ink : 'transparent',
              border: `1px solid ${cat === c ? theme.ink : theme.rule}`,
              color: cat === c ? theme.bg : theme.inkDim,
              padding: '6px 10px', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
              cursor: 'pointer', borderRadius: 0,
            }}>{c}</button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 22 }}>
        <Meta>NOTE</Meta>
        <input value={note} onChange={(e) => setNote(e.target.value)}
          placeholder="A short description"
          style={{
            marginTop: 8, width: '100%', padding: '12px 14px',
            background: theme.surface, border: `1px solid ${theme.rule}`,
            color: theme.ink, fontFamily: 'Newsreader, serif', fontSize: 15,
            borderRadius: 0, outline: 'none',
          }} />
      </div>

      <Btn variant="primary" full onClick={() => setRoute({ tab: 'ledger', sub: 'financial', params: {} })}
        style={{ marginTop: 24, padding: '14px 22px' }}>
        Record Entry ▸
      </Btn>
    </div>
  </ScreenScroll>;
}

Object.assign(window, { LedgerTab });
