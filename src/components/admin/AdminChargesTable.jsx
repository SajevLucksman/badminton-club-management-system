import { useState } from 'react';
import { fmtMoney, clamp2, monthTotals, MONTH_NAMES, parseKey } from '../../utils/helpers';

export default function AdminChargesTable({ data, players, selectedKey, month, updateMonth, onShowHistory }) {
  const [payMember, setPayMember] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payDate, setPayDate] = useState(new Date().toISOString().slice(0, 10));

  const { y, mIndex } = parseKey(selectedKey);
  const totals = monthTotals(data, selectedKey, players.main, players.standby);
  const activeMainCount = totals.rows.filter(r => !r.isStandby).length;

  const addPayment = () => {
    if (!payMember || !payAmount || !payDate) return;
    updateMonth(selectedKey, m => { m.payments.push({ member: payMember, amount: clamp2(Number(payAmount)), dateISO: payDate, ts: Date.now() }); });
    setPayAmount('');
  };

  return (
    <section className="card">
      <div className="cardHeader"><h2>{MONTH_NAMES[mIndex]} {y} — Charges & Payments</h2></div>
      <div className="cardBody">
        {/* Rates */}
        <div className="grid4">
          <div className="mini">
            <label>Court rate/hr (LKR)</label>
            <input type="number" className="mini-input" value={month.hourlyRate ?? 800} onChange={e => updateMonth(selectedKey, m => { m.hourlyRate = Math.max(0, Number(e.target.value) || 0); })} />
          </div>
          <div className="mini"><label>Days booked</label><strong>{totals.days}</strong></div>
          <div className="mini"><label>Court total (LKR)</label><strong>{fmtMoney(totals.courtTotal)}</strong></div>
          <div className="mini"><label>Per person (LKR)</label><strong>{fmtMoney(totals.per)}</strong><div className="sub">÷ {activeMainCount} main</div></div>
        </div>

        <div className="shuttleBox">
          <h3>Shuttle Charges</h3>
          <div className="grid3">
            <div className="mini">
              <label>Cost per tin (LKR)</label>
              <input type="number" className="mini-input" value={month.tinCost ?? 4500} onChange={e => updateMonth(selectedKey, m => { m.tinCost = Math.max(0, Number(e.target.value) || 0); })} />
            </div>
            <div className="mini">
              <label>Tins this month</label>
              <input type="number" className="mini-input" value={month.tinCount ?? 0} onChange={e => updateMonth(selectedKey, m => { m.tinCount = Math.max(0, Number(e.target.value) || 0); })} />
            </div>
            <div className="mini"><label>Shuttle total (LKR)</label><strong>{fmtMoney(totals.shuttleTotal)}</strong></div>
          </div>
        </div>

        <div className="grid3 mt-12">
          <div className="mini"><label>Grand total (LKR)</label><strong>{fmtMoney(totals.expense)}</strong></div>
          <div className="mini"><label>Standby contributions</label><strong>{fmtMoney(totals.standbyTotal)}</strong></div>
          <div className="mini"><label>Per main player</label><strong>{fmtMoney(totals.per)}</strong></div>
        </div>

        {/* Payment table */}
        <table className="mt-12">
          <thead>
            <tr><th>Member</th><th className="right">Due</th><th className="right">Paid</th><th>Last paid</th><th className="right">Outstanding</th><th className="right">Credit</th><th>Status</th><th>This Month</th></tr>
          </thead>
          <tbody>
            {totals.rows.map(r => {
              const isGlobalStandby = players.standby.includes(r.member);
              const isMonthlyStandby = (month.monthlyStandby || []).includes(r.member);
              const isMainPlayer = players.main.includes(r.member);
              return (
                <tr key={r.member} onClick={() => onShowHistory(r.member)}>
                  <td>
                    <b className="accent-text">{r.member}</b>
                    {r.isStandby
                      ? <div className="sub">Standby{isMonthlyStandby ? ' (this month)' : ''}</div>
                      : <div className="sub">Credit in: {fmtMoney(r.creditIn)}</div>}
                  </td>
                  <td className="right">{r.isStandby ? '—' : fmtMoney(r.due)}</td>
                  <td className="right">{fmtMoney(r.paid)}</td>
                  <td>{r.last || '—'}</td>
                  <td className="right">{r.isStandby ? '—' : fmtMoney(r.outstanding)}</td>
                  <td className="right">{fmtMoney(r.creditOut)}</td>
                  <td>
                    {r.isStandby ? <span className="pill credit">Standby</span>
                      : r.outstanding === 0 && (r.paid > 0 || r.creditOut > 0) ? <span className="pill ok">Paid</span>
                      : r.paid > 0 ? <span className="pill due">Due</span>
                      : <span className="pill notpaid">Not Paid</span>}
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    {isMainPlayer && !isGlobalStandby && (
                      <button
                        className={`btn-standby ${isMonthlyStandby ? 'active' : 'inactive'}`}
                        onClick={() => updateMonth(selectedKey, m => { const i = m.monthlyStandby.indexOf(r.member); i >= 0 ? m.monthlyStandby.splice(i, 1) : m.monthlyStandby.push(r.member); })}
                      >
                        {isMonthlyStandby ? 'x Make Active' : 'Make Standby'}
                      </button>
                    )}
                    {isGlobalStandby && <span className="sub">Global standby</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Add Payment */}
        <div className="payBox">
          <h3>Add Payment</h3>
          <div className="payRow">
            <select value={payMember} onChange={e => setPayMember(e.target.value)}>
              <option value="">Select member</option>
              {[...players.main, ...players.standby].map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <input type="number" placeholder="Amount (LKR)" value={payAmount} onChange={e => setPayAmount(e.target.value)} />
            <input type="date" value={payDate} onChange={e => setPayDate(e.target.value)} />
            <button className="btn" onClick={addPayment}>Add</button>
          </div>
        </div>

        {/* Payment history */}
        <div className="history">
          <div className="history-header">
            <div className="sub"><b>Payment history</b></div>
            {totals.payments.length > 0 && <button className="btn btn-danger-sm" onClick={() => updateMonth(selectedKey, m => { m.payments = []; })}>Remove All</button>}
          </div>
          <ul className="histList">
            {totals.payments.length === 0 ? <li>No payments yet.</li> : [...totals.payments].sort((a, b) => a.ts - b.ts).map((p, i) => (
              <li key={p.ts || i}>
                <span>{p.dateISO} — {p.member} paid LKR {fmtMoney(p.amount)}</span>
                <button className="btn-remove" onClick={() => updateMonth(selectedKey, m => { m.payments.splice(i, 1); })}>x</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
