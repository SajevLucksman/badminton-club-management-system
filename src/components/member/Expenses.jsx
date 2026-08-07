import { ensureMonth, fmtMoney, getExpenseTotal, monthTotals, clamp2 } from '../../utils/helpers';

export default function Expenses({ data, players, selectedKey }) {
  ensureMonth(data, selectedKey, players.main, players.standby);
  const expenses = data.months[selectedKey]?.expenses || [];
  const { court, shuttle, misc, total: expTotal } = getExpenseTotal(data, selectedKey);
  const totals = monthTotals(data, selectedKey, players.main, players.standby, players.enrolled, players.left);
  let totalCollected = 0;
  let totalCreditNext = 0;
  totals.rows.forEach(r => { totalCollected = clamp2(totalCollected + r.paid); totalCreditNext = clamp2(totalCreditNext + r.creditOut); });

  return (
    <section className="card section-wide">
      <div className="cardHeader"><h2>Expenses for this Month</h2></div>
      <div className="cardBody">
        <table>
          <thead><tr><th>Type</th><th className="right">Amount (LKR)</th><th>Shop</th><th className="right">Courier</th><th>Date</th></tr></thead>
          <tbody>
            {expenses.length === 0
              ? <tr><td colSpan="5" style={{ color: 'var(--muted)' }}>No expenses recorded.</td></tr>
              : expenses.map((e, i) => (
                <tr key={i}>
                  <td>{e.type === 'court' ? 'Court Booking (MC)' : e.type === 'shuttle' ? 'Shuttle Purchase' : `Misc: ${e.desc || '—'}`}</td>
                  <td className="right">{fmtMoney(e.amount)}</td>
                  <td>{e.shop || '—'}</td>
                  <td className="right">{e.courierCharges ? fmtMoney(e.courierCharges) : '—'}</td>
                  <td>{e.date || '—'}</td>
                </tr>
              ))
            }
          </tbody>
          <tfoot>
            <tr style={{ fontWeight: 700 }}><td>Total Court</td><td className="right">{fmtMoney(court)}</td><td colSpan="3" /></tr>
            <tr style={{ fontWeight: 700 }}><td>Total Shuttles</td><td className="right">{fmtMoney(shuttle)}</td><td colSpan="3" /></tr>
            <tr style={{ fontWeight: 700 }}><td>Total Misc</td><td className="right">{fmtMoney(misc)}</td><td colSpan="3" /></tr>
          </tfoot>
        </table>

        <div style={{ marginTop: 16, padding: 16, borderRadius: 12, border: '1px solid var(--line)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, textAlign: 'center' }}>
            <div><div className="sub">Total Collected</div><strong style={{ fontSize: '1.2rem', color: '#10b981' }}>{fmtMoney(totalCollected)}</strong></div>
            <div><div className="sub">Total Expenses</div><strong style={{ fontSize: '1.2rem', color: '#ef4444' }}>{fmtMoney(expTotal)}</strong></div>
          </div>
        </div>

        <div style={{ marginTop: 16, padding: 16, borderRadius: 12, background: 'rgba(99,102,241,0.1)', border: '2px solid rgba(99,102,241,0.4)', textAlign: 'center' }}>
          <div className="sub">Credit to next Month (LKR)</div>
          <strong style={{ fontSize: '1.4rem', color: '#6366f1' }}>{fmtMoney(totalCreditNext)}</strong>
        </div>
      </div>
    </section>
  );
}
