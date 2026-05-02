import { useState, useMemo } from 'react';
import { fmtMoney, MONTH_NAMES, parseKey } from '../../utils/helpers';

const PER_PAGE = 10;

export default function PlayerHistory({ data, player, onClose }) {
  const [page, setPage] = useState(0);
  const payments = useMemo(() => {
    const all = [];
    Object.keys(data.months).sort().forEach(key => {
      (data.months[key].payments || []).forEach(p => {
        if (p.member === player) all.push({ ...p, month: key });
      });
    });
    return all.sort((a, b) => b.ts - a.ts);
  }, [data, player]);

  const totalPaid = payments.reduce((s, p) => s + Number(p.amount), 0);
  const pages = Math.ceil(payments.length / PER_PAGE) || 1;
  const slice = payments.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>{player} — Payment History</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--muted)' }}>x</button>
        </div>
        <div className="sub" style={{ marginBottom: 12 }}>Total paid: LKR {fmtMoney(totalPaid)} · {payments.length} payment(s)</div>
        {slice.length === 0 ? <div className="sub">No payments found.</div> : (
          <table>
            <thead><tr><th>Date</th><th>Month</th><th className="right">Amount (LKR)</th></tr></thead>
            <tbody>
              {slice.map((p, i) => {
                const { y, mIndex } = parseKey(p.month);
                return <tr key={i}><td>{p.dateISO}</td><td>{MONTH_NAMES[mIndex]} {y}</td><td className="right">{fmtMoney(p.amount)}</td></tr>;
              })}
            </tbody>
          </table>
        )}
        {pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 12 }}>
            <button className="btn secondary" disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Prev</button>
            <span className="sub">Page {page + 1} of {pages}</span>
            <button className="btn secondary" disabled={page >= pages - 1} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
