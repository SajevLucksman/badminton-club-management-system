import { monthTotals, fmtMoney, ensureMonth, prevMonthKey, getExpenseTotal, clamp2, parseKey, MONTH_NAMES } from '../../utils/helpers';

function statusPill(r) {
  if (r.isStandby) return <span className="pill credit">Standby</span>;
  if (r.due === 0 && r.paid === 0) return <span className="pill notpaid">Not Paid</span>;
  if (r.creditOut > 0 || r.outstanding === 0) return <span className="pill ok">Paid</span>;
  if (r.paid > 0) return <span className="pill due">Due</span>;
  return <span className="pill notpaid">Not Paid</span>;
}

export default function ChargesTable({ data, players, selectedKey, onShowHistory }) {
  ensureMonth(data, selectedKey, players.main, players.standby);
  const { y, mIndex } = parseKey(selectedKey);
  const title = `${MONTH_NAMES[mIndex]} ${y}`;
  const month = data.months[selectedKey];
  const totals = monthTotals(data, selectedKey, players.main, players.standby, players.enrolled, players.left);
  const activeMainCount = totals.rows.filter(r => !r.isStandby).length;

  return (
    <section className="card">
      <div className="cardHeader">
        <div><h2>{title} — Charges & Payments</h2><div className="sub">Per-person + paid + outstanding + credit</div></div>
        <div className="sub">Read-only view</div>
      </div>
      <div className="cardBody">
        <div className="grid3">
          <div className="mini"><label>Court rate per hour (LKR)</label><strong>{fmtMoney(month.hourlyRate)}</strong></div>
          <div className="mini"><label>Days booked</label><strong>{totals.days}</strong></div>
          <div className="mini"><label>Court total (LKR)</label><strong>{fmtMoney(totals.courtTotal)}</strong><div className="sub">Days × hourly rate</div></div>
        </div>

        <div className="shuttleBox">
          <h3>Shuttle Charges</h3>
          <div className="grid4">
            <div className="mini"><label>Cost per tin (LKR)</label><strong>{fmtMoney(month.tinCost)}</strong></div>
            <div className="mini"><label>Tins this month</label><strong>{month.tinCount}</strong></div>
            <div className="mini"><label>Courier charges (LKR)</label><strong>{fmtMoney(month.courierCharges || 0)}</strong></div>
            <div className="mini"><label>Shuttle total (LKR)</label><strong>{fmtMoney(totals.shuttleTotal)}</strong></div>
          </div>
        </div>

        {(month.miscExpenses || []).length > 0 && <div className="shuttleBox" style={{ marginTop: 12 }}>
          <h3>Miscellaneous Payments</h3>
          <ul className="histList">
            {month.miscExpenses.map((item, i) => <li key={i}><span>{item.desc} — LKR {fmtMoney(item.amount)}</span></li>)}
          </ul>
          <div className="mini" style={{ marginTop: 8 }}><label>Misc total (LKR)</label><strong>{fmtMoney(month.miscExpenses.reduce((s, e) => s + e.amount, 0))}</strong></div>
        </div>}

        <div className="grid3" style={{ marginTop: 12 }}>
          <div className="mini"><label>Grand total (LKR)</label><strong>{fmtMoney(totals.expense)}</strong><div className="sub">Court + Shuttles + Misc</div></div>
          <div className="mini"><label>Standby contributions (LKR)</label><strong>{fmtMoney(totals.standbyTotal)}</strong></div>
          <div className="mini"><label>Per main player (LKR)</label><strong style={{ color: '#f59e0b', fontSize: '1.1rem' }}>{fmtMoney(totals.per)}</strong></div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Member</th><th className="right">Due (LKR)</th><th className="right" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>Outstanding (LKR)</th><th className="right">Paid (LKR)</th>
              <th>Last paid date</th>
              <th className="right">Credit to next (LKR)</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {totals.rows.map(r => (
              <tr key={r.member} onClick={() => onShowHistory?.(r.member)}>
                <td>
                  <b style={{ color: 'var(--accent)' }}>{r.member}</b>
                  {r.isStandby ? <div className="sub">Standby player</div> : <div className="sub">Credit in: LKR {fmtMoney(r.creditIn)}</div>}
                </td>
                <td className="right">{r.isStandby ? '—' : fmtMoney(r.due)}</td>
                <td className="right" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontWeight: 700 }}>{r.isStandby ? '—' : fmtMoney(r.outstanding)}</td>
                <td className="right">{fmtMoney(r.paid)}</td>
                <td>{r.last || <span className="sub">—</span>}</td>
                <td className="right">{fmtMoney(r.creditOut)}</td>
                <td>{statusPill(r)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="history">
          <div className="sub"><b>Payment history (selected month)</b></div>
          <ul className="histList">
            {totals.payments.length === 0
              ? <li>No payments recorded for this month yet.</li>
              : [...totals.payments].sort((a, b) => a.ts - b.ts).map(p => (
                <li key={p.ts}>{p.dateISO} — {p.member} paid LKR {fmtMoney(p.amount)}</li>
              ))
            }
          </ul>
        </div>
      </div>
    </section>
  );
}
