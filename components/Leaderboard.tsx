'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';

type Row = { member: string; score: number };

function shortAddr(a: string) {
  if (!a) return 'player';
  const s = a.toLowerCase();
  return s.length > 6 ? `${s.slice(0, 6)}…` : s;
}


function num(n: number) {
  return new Intl.NumberFormat().format(n);
}

export default function Leaderboard() {
  const { address } = useAccount();
  const me = address?.toLowerCase() ?? '';

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    try {
      setErr(null);
      setLoading(true);
      const res = await fetch(`/api/leaderboard?game=velocity&limit=10`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'failed');
      setRows(Array.isArray(data?.rows) ? data.rows : []);
    } catch (e: any) {
      setErr(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 8000);
    return () => clearInterval(id);
  }, []);

  const mineRank = useMemo(() => {
    const idx = rows.findIndex(r => r.member.toLowerCase() === me);
    return idx >= 0 ? idx + 1 : null;
  }, [rows, me]);

  return (
    <div style={wrap}>
      <div style={headerRow}>
        <div style={title}>
          <span style={dot} />
          Leaderboard
        </div>
        <button onClick={load} style={refreshBtn} aria-label="refresh">↻</button>
      </div>

      {err && <div style={errorBox}>could not load leaderboard. try refresh</div>}

      <div style={panel}>
        <div style={subhead}>top 10</div>

        {loading ? (
          <div style={{ display: 'grid', gap: 8 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={skeletonRow} />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div style={empty}>no scores yet. be the first</div>
        ) : (
          <div style={table}>
            <div style={thead}>
              <div style={{ width: 56, textAlign: 'left' }}>#</div>
              <div style={{ flex: 1 }}>player</div>
              <div style={{ width: 110, textAlign: 'right' }}>score</div>
            </div>

            <div style={tbody}>
{rows.map((r, i) => {
  const isMe = me && r.member.toLowerCase() === me;

  const medal =
    i === 0
      ? '🥇'
      : i === 1
      ? '🥈'
      : i === 2
      ? '🥉'
      : null;

  const glow =
    i === 0
      ? { boxShadow: '0 0 25px rgba(255,215,0,0.6)', border: '1px solid rgba(255,215,0,0.6)' }
      : i === 1
      ? { boxShadow: '0 0 25px rgba(192,192,192,0.5)', border: '1px solid rgba(192,192,192,0.5)' }
      : i === 2
      ? { boxShadow: '0 0 25px rgba(205,127,50,0.4)', border: '1px solid rgba(205,127,50,0.4)' }
      : {};

  return (
    <div
      key={r.member + i}
      style={{
        ...tr,
        ...(isMe ? trMe : {}),
        ...glow,
      }}
    >
      <div style={rank}>
        {medal ? <span style={{ fontSize: 18 }}>{medal}</span> : i + 1}
      </div>
      <div style={who}>
        <span style={{ opacity: 0.9 }}>{shortAddr(r.member)}</span>
        {isMe && <span style={meTag}>you</span>}
      </div>
      <div style={score}>{num(r.score)}</div>
    </div>
  );
})}
            </div>
          </div>
        )}
      </div>

      {mineRank && (
        <div style={youBox}>
          your current rank {mineRank}
        </div>
      )}
    </div>
  );
}

/* styles */

const wrap: React.CSSProperties = {
  display: 'grid',
  gap: 10,
  color: '#fff',
};

const headerRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 4,
};

const title: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  fontSize: 18,
  fontWeight: 900,
  letterSpacing: 0.4,
};

const dot: React.CSSProperties = {
  width: 10,
  height: 10,
  borderRadius: 999,
  background:
    'radial-gradient(circle at 30% 30%, #ff73e1 0%, #b13cff 45%, #5c2cff 100%)',
  boxShadow: '0 0 16px rgba(188,66,255,0.8)',
};

const refreshBtn: React.CSSProperties = {
  padding: '6px 10px',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.18)',
  background: 'rgba(18,18,26,0.55)',
  color: '#fff',
  cursor: 'pointer',
};

const panel: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 14,
  padding: 12,
  background:
    'linear-gradient(180deg, rgba(16,16,24,0.75) 0%, rgba(10,10,16,0.75) 100%)',
  boxShadow: '0 12px 34px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)',
  maxHeight: 360,
  overflow: 'hidden',
};

const subhead: React.CSSProperties = {
  fontSize: 12,
  opacity: 0.8,
  marginBottom: 8,
};

const table: React.CSSProperties = {
  display: 'grid',
  gap: 6,
};

const thead: React.CSSProperties = {
  display: 'flex',
  gap: 10,
  padding: '6px 10px',
  fontSize: 12,
  opacity: 0.7,
  borderBottom: '1px solid rgba(255,255,255,0.08)',
};

const tbody: React.CSSProperties = {
  display: 'grid',
  gap: 6,
  paddingTop: 6,
  maxHeight: 260,
  overflowY: 'auto',
};

const tr: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '48px 1fr 80px', // rank | player | score
  alignItems: 'center',
  gap: 8,
  padding: '10px 12px',
  borderRadius: 10,
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.06)',
  minWidth: 0 // allow shrink, prevents horizontal overflow
};


const trMe: React.CSSProperties = {
  background:
    'linear-gradient(180deg, rgba(255,102,217,0.12), rgba(110,89,255,0.12))',
  border: '1px solid rgba(255,102,217,0.35)',
  boxShadow: '0 0 20px rgba(255,102,217,0.25)',
};

const rank: React.CSSProperties = { width: 48, textAlign: 'center', opacity: 0.8 };

const who: React.CSSProperties = {
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  opacity: 0.95,
  display: 'flex',
  alignItems: 'center',
  gap: 8
};


const score: React.CSSProperties = { width: 80, textAlign: 'right', fontWeight: 700 };

const meTag: React.CSSProperties = {
  padding: '2px 6px',
  fontSize: 11,
  borderRadius: 8,
  background: 'rgba(255,102,217,0.18)',
  border: '1px solid rgba(255,102,217,0.35)',
};

const skeletonRow: React.CSSProperties = {
  height: 42,
  borderRadius: 12,
  background:
    'linear-gradient(90deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.06) 100%)',
  backgroundSize: '200% 100%',
  animation: 'lbShimmer 1.4s linear infinite',
} as React.CSSProperties;

const empty: React.CSSProperties = {
  opacity: 0.8,
  fontSize: 14,
  padding: '16px 10px',
};

const errorBox: React.CSSProperties = {
  color: '#ff8a8a',
  fontSize: 12,
  padding: '6px 8px',
};

const youBox: React.CSSProperties = {
  textAlign: 'center',
  fontSize: 12,
  opacity: 0.9,
};

/* inject small keyframes once */
if (typeof document !== 'undefined' && !document.getElementById('lb-shimmer')) {
  const style = document.createElement('style');
  style.id = 'lb-shimmer';
  style.innerHTML = `
  @keyframes lbShimmer { 
    0% { background-position: 200% 0 } 
    100% { background-position: -200% 0 } 
  }`;
  document.head.appendChild(style);
}
