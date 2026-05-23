'use client';
import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/components/providers/AppProvider';
import {
  ScreenScroll,
  Meta,
  Mono,
  PageHeader,
  Btn,
} from '@/components/primitives/index';
import { addFinancialEntryAction } from '@/actions/ledger';
import type { FinancialEntry, FinancialSummary } from '@/lib/notion/types';

// ─── Fallback data ────────────────────────────────────────────────────────────

const FALLBACK_ENTRIES: FinancialEntry[] = [
  { id: 'f1', date: '2026-06-01', type: 'income', amount: 85000, category: 'Salary', note: 'June salary' },
  { id: 'f2', date: '2026-06-02', type: 'expense', amount: 18000, category: 'Rent', note: 'Monthly rent' },
  { id: 'f3', date: '2026-06-03', type: 'expense', amount: 4200, category: 'Food', note: 'Groceries + eating out' },
  { id: 'f4', date: '2026-06-05', type: 'expense', amount: 5000, category: 'GT Cup Fund', note: 'Monthly transfer' },
  { id: 'f5', date: '2026-06-07', type: 'income', amount: 12000, category: 'Freelance', note: 'Content project' },
];

const FALLBACK_SUMMARY: FinancialSummary = {
  totalIncome: 97000,
  totalExpenses: 27200,
  net: 69800,
  byCategory: {},
};

const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Consulting', 'Investment Returns', 'GT Cup Fund', 'Other'];
const EXPENSE_CATEGORIES = ['Rent', 'Food', 'Investment', 'GT Cup Fund', 'Transport', 'Subscriptions', 'Other'];

// ─── AddEntry ─────────────────────────────────────────────────────────────────

interface AddEntryProps {
  onClose: () => void;
}

function AddEntry({ onClose }: AddEntryProps) {
  const { theme } = useApp();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [note, setNote] = useState('');

  const cats = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = () => {
    if (!amount || isNaN(Number(amount))) return;
    startTransition(async () => {
      await addFinancialEntryAction({
        type,
        amount: Number(amount),
        category,
        note,
      });
      router.refresh();
      onClose();
    });
  };

  return (
    <div style={{
      marginTop: 18,
      padding: '18px',
      border: `1px solid ${theme.rule}`,
      background: theme.surface,
    }}>
      {/* Income / Expense toggle */}
      <div style={{ display: 'flex', gap: 6 }}>
        {(['income', 'expense'] as const).map(t => (
          <button key={t} onClick={() => { setType(t); setCategory(t === 'income' ? 'Salary' : 'Food'); }}
            className="ls-mono ls-press" style={{
              flex: 1, padding: '10px',
              background: type === t ? theme.ink : 'transparent',
              border: `1px solid ${theme.rule}`,
              color: type === t ? theme.bg : theme.inkDim,
              fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
              cursor: 'pointer', borderRadius: 0,
            }}>
            {t}
          </button>
        ))}
      </div>

      {/* Amount */}
      <input
        type="number"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        placeholder="Amount in ₹"
        style={{
          marginTop: 10, width: '100%', padding: '12px 14px',
          background: theme.bg, border: `1px solid ${theme.rule}`,
          color: theme.ink, fontFamily: 'JetBrains Mono, monospace',
          fontSize: 16, borderRadius: 0, outline: 'none', boxSizing: 'border-box',
        }}
      />

      {/* Category */}
      <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {cats.map(c => (
          <button key={c} onClick={() => setCategory(c)} className="ls-mono ls-press" style={{
            padding: '6px 10px',
            background: category === c ? theme.ink : 'transparent',
            border: `1px solid ${category === c ? theme.ink : theme.rule2}`,
            color: category === c ? theme.bg : theme.inkDim,
            fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
            cursor: 'pointer', borderRadius: 0,
          }}>{c}</button>
        ))}
      </div>

      {/* Note */}
      <input
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Note (optional)"
        style={{
          marginTop: 10, width: '100%', padding: '12px 14px',
          background: theme.bg, border: `1px solid ${theme.rule}`,
          color: theme.ink, fontSize: 14, borderRadius: 0, outline: 'none',
          boxSizing: 'border-box',
        }}
      />

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <Btn onClick={onClose} variant="ghost" style={{ padding: '10px 16px' }}>Cancel</Btn>
        <Btn
          onClick={handleSubmit}
          variant="primary"
          full
          disabled={isPending}
          style={{ padding: '10px 16px' }}
        >
          {isPending ? 'Saving…' : 'Log Entry ▸'}
        </Btn>
      </div>
    </div>
  );
}

// ─── FinancialLogClient ───────────────────────────────────────────────────────

interface Props {
  entries: FinancialEntry[];
  summary: FinancialSummary | null;
}

export default function FinancialLogClient({ entries, summary }: Props) {
  const { theme, density } = useApp();
  const data = entries.length > 0 ? entries : FALLBACK_ENTRIES;
  const sum = summary ?? FALLBACK_SUMMARY;

  const [catFilter, setCatFilter] = useState('ALL');
  const [showAdd, setShowAdd] = useState(false);

  const cats = ['ALL', ...Array.from(new Set(data.map(f => f.category)))];
  const visible = catFilter === 'ALL' ? data : data.filter(f => f.category === catFilter);

  const income = sum.totalIncome;
  const expense = sum.totalExpenses;
  const savings = income > 0 ? Math.round(((income - expense) / income) * 100) : 0;
  const gtFund = (sum.byCategory['income:GT Cup Fund'] ?? 0) + (sum.byCategory['expense:GT Cup Fund'] ?? 0);

  return (
    <ScreenScroll>
      <div style={{ padding: density.padScreen, maxWidth: 920 }}>
        <Link href="/ledger" style={{ textDecoration: 'none' }}>
          <button className="ls-press ls-mono" style={{
            background: 'transparent', border: 'none', color: theme.inkMute, padding: 0,
            fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer',
          }}>← Ledger</button>
        </Link>

        <PageHeader
          overline="CAPITAL"
          title="Financial Log"
          meta="All income, expenses, GT Cup fund, investments."
          style={{ padding: `${density.padCard}px 0` }}
        />

        {/* Summary grid */}
        <div style={{
          marginTop: 22,
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          border: `1px solid ${theme.rule}`,
        }}>
          {[
            { l: 'INCOME',   v: `₹${(income / 1000).toFixed(0)}K` },
            { l: 'EXPENSES', v: `₹${(expense / 1000).toFixed(0)}K` },
            { l: 'SAVINGS%', v: `${savings}%` },
            { l: 'GT FUND',  v: gtFund > 0 ? `₹${(gtFund / 1000).toFixed(1)}K` : '—' },
          ].map((c, i, a) => (
            <div key={i} style={{
              padding: '14px 12px',
              borderRight: i < a.length - 1 ? `1px solid ${theme.rule2}` : 'none',
            }}>
              <Meta>{c.l}</Meta>
              <div className="ls-num" style={{ fontSize: 22, marginTop: 4, color: theme.ink }}>{c.v}</div>
            </div>
          ))}
        </div>

        {/* Category filter */}
        <div style={{ marginTop: 14, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {cats.map(c => (
            <button key={c} onClick={() => setCatFilter(c)} className="ls-mono ls-press" style={{
              background: catFilter === c ? theme.ink : 'transparent',
              border: `1px solid ${catFilter === c ? theme.ink : theme.rule}`,
              color: catFilter === c ? theme.bg : theme.inkDim,
              padding: '5px 9px', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
              cursor: 'pointer', borderRadius: 0,
            }}>{c}</button>
          ))}
        </div>

        {/* Entry list */}
        <div style={{ marginTop: 14, borderTop: `1px solid ${theme.rule}` }}>
          {visible.map(f => (
            <div key={f.id} style={{
              display: 'grid',
              gridTemplateColumns: '90px 90px 1fr 90px',
              gap: 10,
              padding: '10px 0',
              borderBottom: `1px solid ${theme.rule2}`,
              alignItems: 'center',
            }}>
              <Mono style={{ fontSize: 11, color: theme.inkMute }}>
                {f.date ? f.date.slice(5) : '—'}
              </Mono>
              <Mono style={{ fontSize: 10, color: theme.inkDim, textTransform: 'uppercase' }}>
                {f.category}
              </Mono>
              <span style={{ fontSize: 13, color: theme.ink }}>{f.note || '—'}</span>
              <Mono style={{
                fontSize: 12,
                fontWeight: 700,
                textAlign: 'right',
                color: f.type === 'income' ? theme.good : theme.ink,
              }}>
                {f.type === 'income' ? '+' : '−'}₹{f.amount.toLocaleString('en-IN')}
              </Mono>
            </div>
          ))}
        </div>

        {/* Add entry */}
        <Btn
          onClick={() => setShowAdd(true)}
          full
          variant="primary"
          style={{ marginTop: 18, padding: '14px 22px' }}
        >
          + Log Entry
        </Btn>
        {showAdd && <AddEntry onClose={() => setShowAdd(false)} />}
      </div>
    </ScreenScroll>
  );
}
