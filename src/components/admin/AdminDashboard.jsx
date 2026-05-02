import { useState } from 'react';
import { Link } from 'react-router-dom';
import { parseKey, fmtMoney, clamp2, ensureMonth, getExpenseTotal, monthTotals, SHUTTLES_PER_TIN, MONTH_NAMES } from '../../utils/helpers';
import { useTheme } from '../../hooks/useTheme';
import MonthNav from '../shared/MonthNav';
import Calendar from '../shared/Calendar';
import PlayerHistory from '../shared/PlayerHistory';

export default function AdminDashboard({ data, players, selectedKey, setSelectedKey, currentKey, updateMonth, save, onLogout }) {
  const { theme, toggle } = useTheme();
  const [showPlayers, setShowPlayers] = useState(false);
  const [historyPlayer, setHistoryPlayer] = useState(null);
  const [payMember, setPayMember] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payDate, setPayDate] = useState(new Date().toISOString().slice(0, 10));
  const [expType, setExpType] = useState('court');
  const [expAmount, setExpAmount] = useState('');
  const [expShop, setExpShop] = useState('');

  ensureMonth(data, selectedKey, players.main, players.standby);
  const { y, mIndex } = parseKey(selectedKey);
  const month = data.months[selectedKey] || {};
  const totals = monthTotals(data, selectedKey, players.main, players.standby);
  const expTotals = getExpenseTotal(data, selectedKey);
  const activeMainCount = totals.rows.filter(r => !r.isStandby).length;

  const toggleDay = (d) => updateMonth(selectedKey, m => {
    const i = m.selectedDays.indexOf(d);
    i >= 0 ? m.selectedDays.splice(i, 1) : m.selectedDays.push(d);
  });
  const toggleShuttleDay = (d) => updateMonth(selectedKey, m => {
    const i = m.shuttleDays.indexOf(d);
    i >= 0 ? m.shuttleDays.splice(i, 1) : m.shuttleDays.push(d);
  });
  const addPayment = () => {
    if (!payMember || !payAmount || !payDate) return;
    updateMonth(selectedKey, m => { m.payments.push({ member: payMember, amount: clamp2(Number(payAmount)), dateISO: payDate, ts: Date.now() }); });
    setPayAmount('');
  };
  const addExpense = () => {
    if (!expAmount) return;
    updateMonth(selectedKey, m => { m.expenses.push({ type: expType, amount: clamp2(Number(expAmount)), shop: expType === 'shuttle' ? expShop : '', date: new Date().toISOString().slice(0, 10) }); });
    setExpAmount(''); setExpShop('');
  };

  return (
    <>
      {/* Topbar */}
      <div className="topbar" style={{ maxWidth: 1200, margin: '18px auto 0', padding: '0 16px' }}>
        <div className="brand">
          <h1>🏸 Badminton Charges Manager</h1>
          <p>Admin Panel</p>
        </div>
        <div className="monthCtl">
          <MonthNav selectedKey={selectedKey} setSelectedKey={setSelectedKey} currentKey={currentKey} />
          <button className="btn" onClick={() => setShowPlayers(true)}>👥 Players</button>
          <button className="btn secondary" onClick={() => { if (confirm('Reset ALL data?')) save({ credits: {}, months: {} }, players); }}>Reset Data</button>
          <button className="btn secondary" onClick={onLogout}>🚪 Logout</button>
          <Link to="/" className="btn secondary" style={{ textDecoration: 'none' }}>📖 Member View</Link>
          <button className="themeBtn" onClick={toggle}>{theme === 'dark' ? '☀️' : '🌙'}</button>
        </div>
      </div>

      {/* Players */}
      <section className="card" style={{ maxWidth: 1200, margin: '12px auto 0', padding: 0, width: 'calc(100% - 32px)' }}>
        <div className="cardHeader"><h2>👥 Players</h2></div>
        <div className="cardBody" style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--accent)', fontSize: '.8rem', marginBottom: 6 }}>MAIN PLAYERS</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {players.main.length ? players.main.map(m => <span key={m} className="pill ok">{m}</span>) : <span className="sub">None</span>}
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--warn)', fontSize: '.8rem', marginBottom: 6 }}>STANDBY PLAYERS</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {players.standby.length ? players.standby.map(m => <span key={m} className="pill due">{m}</span>) : <span className="sub">None</span>}
            </div>
          </div>
        </div>
      </section>

      <div className="layout" style={{ maxWidth: 1200, margin: '12px auto', padding: '0 16px' }}>
        {/* Calendar */}
        <section className="card">
          <div className="cardHeader">
            <div><h2>📅 {MONTH_NAMES[mIndex]} {y} — Calendar</h2><div className="sub">Click days to toggle booked.</div></div>
            <div className="legend"><span className="sw booked" /><span>Booked</span><span className="sw avail" style={{ marginLeft: 10 }} /><span>Available</span></div>
          </div>
          <div className="cardBody">
            <Calendar selectedKey={selectedKey} selectedDays={month.selectedDays || []} onToggleDay={toggleDay} />
          </div>
        </section>

        {/* Charges & Payments */}
        <section className="card">
          <div className="cardHeader"><h2>{MONTH_NAMES[mIndex]} {y} — Charges & Payments</h2></div>
          <div className="cardBody">
            <div className="grid4">
              <div className="mini"><label>Court rate/hr (LKR)</label><input type="number" value={month.hourlyRate ?? 800} onChange={e => updateMonth(selectedKey, m => { m.hourlyRate = Math.max(0, Number(e.target.value) || 0); })} style={{ width: '100%', marginTop: 4 }} /></div>
              <div className="mini"><label>Days booked</label><strong>{totals.days}</strong></div>
              <div className="mini"><label>Court total (LKR)</label><strong>{fmtMoney(totals.courtTotal)}</strong></div>
              <div className="mini"><label>Per person (LKR)</label><strong>{fmtMoney(totals.per)}</strong><div className="sub">÷ {activeMainCount} main</div></div>
            </div>
            <div className="shuttleBox">
              <h3>🏸 Shuttle Charges</h3>
              <div className="grid3">
                <div className="mini"><label>Cost per tin (LKR)</label><input type="number" value={month.tinCost ?? 4500} onChange={e => updateMonth(selectedKey, m => { m.tinCost = Math.max(0, Number(e.target.value) || 0); })} style={{ width: '100%', marginTop: 4 }} /></div>
                <div className="mini"><label>Tins this month</label><input type="number" value={month.tinCount ?? 0} onChange={e => updateMonth(selectedKey, m => { m.tinCount = Math.max(0, Number(e.target.value) || 0); })} style={{ width: '100%', marginTop: 4 }} /></div>
                <div className="mini"><label>Shuttle total (LKR)</label><strong>{fmtMoney(totals.shuttleTotal)}</strong></div>
              </div>
            </div>
            <div className="grid3" style={{ marginTop: 12 }}>
              <div className="mini"><label>Grand total (LKR)</label><strong>{fmtMoney(totals.expense)}</strong></div>
              <div className="mini"><label>Standby contributions</label><strong>{fmtMoney(totals.standbyTotal)}</strong></div>
              <div className="mini"><label>Per main player</label><strong>{fmtMoney(totals.per)}</strong></div>
            </div>

            {/* Payment table */}
            <table style={{ marginTop: 12 }}>
              <thead><tr><th>Member</th><th className="right">Due</th><th className="right">Paid</th><th>Last paid</th><th className="right">Outstanding</th><th className="right">Credit</th><th>Status</th><th>This Month</th></tr></thead>
              <tbody>
                {totals.rows.map(r => {
                  const isGlobalStandby = players.standby.includes(r.member);
                  const isMonthlyStandby = (month.monthlyStandby || []).includes(r.member);
                  const isMainPlayer = players.main.includes(r.member);
                  return (
                  <tr key={r.member} onClick={() => setHistoryPlayer(r.member)}>
                    <td><b style={{ color: 'var(--accent)' }}>{r.member}</b>{r.isStandby ? <div className="sub">Standby{isMonthlyStandby ? ' (this month)' : ''}</div> : <div className="sub">Credit in: {fmtMoney(r.creditIn)}</div>}</td>
                    <td className="right">{r.isStandby ? '—' : fmtMoney(r.due)}</td>
                    <td className="right">{fmtMoney(r.paid)}</td>
                    <td>{r.last || '—'}</td>
                    <td className="right">{r.isStandby ? '—' : fmtMoney(r.outstanding)}</td>
                    <td className="right">{fmtMoney(r.creditOut)}</td>
                    <td>{r.isStandby ? <span className="pill credit">Standby</span> : r.outstanding === 0 && (r.paid > 0 || r.creditOut > 0) ? <span className="pill ok">Paid</span> : r.paid > 0 ? <span className="pill due">Due</span> : <span className="pill notpaid">Not Paid</span>}</td>
                    <td onClick={e => e.stopPropagation()}>
                      {isMainPlayer && !isGlobalStandby && (
                        <button
                          className="btn secondary"
                          style={{ padding: '4px 12px', fontSize: 12, borderColor: isMonthlyStandby ? 'var(--danger-color)' : 'var(--warn)', color: isMonthlyStandby ? 'var(--danger-color)' : 'var(--warn)', background: isMonthlyStandby ? 'rgba(220,38,38,.08)' : 'rgba(245,158,11,.08)' }}
                          onClick={() => updateMonth(selectedKey, m => { const i = m.monthlyStandby.indexOf(r.member); i >= 0 ? m.monthlyStandby.splice(i, 1) : m.monthlyStandby.push(r.member); })}
                        >
                          {isMonthlyStandby ? '✕ Make Active' : '⏸ Make Standby'}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="sub"><b>Payment history</b></div>
                {totals.payments.length > 0 && <button className="btn" style={{ background: 'var(--booked)', padding: '4px 10px', fontSize: '.75rem' }} onClick={() => updateMonth(selectedKey, m => { m.payments = []; })}>Remove All</button>}
              </div>
              <ul className="histList">
                {totals.payments.length === 0 ? <li>No payments yet.</li> : [...totals.payments].sort((a, b) => a.ts - b.ts).map((p, i) => (
                  <li key={p.ts || i}><span>{p.dateISO} — {p.member} paid LKR {fmtMoney(p.amount)}</span><button onClick={() => updateMonth(selectedKey, m => { m.payments.splice(i, 1); })} style={{ background: 'none', border: 'none', color: 'var(--booked)', cursor: 'pointer', fontSize: 14 }}>✕</button></li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>

      {/* Expenses */}
      <section className="card" style={{ maxWidth: 1200, margin: '12px auto 0', padding: 0, width: 'calc(100% - 32px)' }}>
        <div className="cardHeader"><h2>💰 Expenses</h2></div>
        <div className="cardBody">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 8, alignItems: 'center', marginBottom: 12 }}>
            <select value={expType} onChange={e => setExpType(e.target.value)}><option value="court">Court Booking</option><option value="shuttle">Shuttle Purchase</option></select>
            <input type="number" placeholder="Amount (LKR)" value={expAmount} onChange={e => setExpAmount(e.target.value)} />
            <input type="text" placeholder="Shop name" value={expShop} onChange={e => setExpShop(e.target.value)} style={{ display: expType === 'shuttle' ? '' : 'none' }} />
            <button className="btn" onClick={addExpense}>+ Add</button>
          </div>
          <table>
            <thead><tr><th>Type</th><th className="right">Amount</th><th>Shop</th><th>Date</th><th></th></tr></thead>
            <tbody>
              {(month.expenses || []).length === 0 ? <tr><td colSpan="5" className="sub">No expenses.</td></tr> : (month.expenses || []).map((e, i) => (
                <tr key={i}><td>{e.type === 'court' ? 'Court Booking' : 'Shuttle Purchase'}</td><td className="right">{fmtMoney(e.amount)}</td><td>{e.shop || '—'}</td><td>{e.date || '—'}</td><td><button onClick={() => updateMonth(selectedKey, m => { m.expenses.splice(i, 1); })} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '1rem' }}>✕</button></td></tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ fontWeight: 700 }}><td>Total Court</td><td className="right">{fmtMoney(expTotals.court)}</td><td colSpan="3" /></tr>
              <tr style={{ fontWeight: 700 }}><td>Total Shuttles</td><td className="right">{fmtMoney(expTotals.shuttle)}</td><td colSpan="3" /></tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* Shuttle Tracker */}
      <section className="card" style={{ maxWidth: 1200, margin: '12px auto 0', padding: 0, width: 'calc(100% - 32px)' }}>
        <div className="cardHeader"><h2>🏸 Shuttle Tracker</h2></div>
        <div className="cardBody">
          <div className="grid4" style={{ textAlign: 'center', marginBottom: 16 }}>
            <div className="mini"><label>Tins</label><strong style={{ fontSize: '1.3rem', color: 'var(--accent)' }}>{month.tinCount || 0}</strong></div>
            <div className="mini"><label>Extra Shuttles</label><input type="number" value={month.extraShuttles ?? 0} onChange={e => updateMonth(selectedKey, m => { m.extraShuttles = Math.max(0, Number(e.target.value) || 0); })} style={{ width: 80, textAlign: 'center', marginTop: 4 }} /></div>
            <div className="mini"><label>Used</label><strong style={{ fontSize: '1.3rem', color: '#ef4444' }}>{(month.shuttleDays || []).length}</strong></div>
            <div className="mini"><label>Remaining</label><strong style={{ fontSize: '1.3rem', color: '#10b981' }}>{Math.max(0, ((month.tinCount || 0) * SHUTTLES_PER_TIN + (month.extraShuttles || 0)) - (month.shuttleDays || []).length)}</strong></div>
          </div>
          <h4 style={{ margin: '0 0 8px' }}>Click to mark shuttle days</h4>
          <Calendar selectedKey={selectedKey} selectedDays={month.shuttleDays || []} onToggleDay={toggleShuttleDay} />
        </div>
      </section>

      <footer>© 2026 Sajev Lucksman. All rights reserved.</footer>

      {/* Modals */}
      {historyPlayer && <PlayerHistory data={data} player={historyPlayer} onClose={() => setHistoryPlayer(null)} />}
      {showPlayers && <PlayersModal players={players} onClose={() => setShowPlayers(false)} onSave={p => { save(JSON.parse(JSON.stringify(data)), p); setShowPlayers(false); }} />}
    </>
  );
}

function PlayersModal({ players, onClose, onSave }) {
  const [main, setMain] = useState([...players.main]);
  const [standby, setStandby] = useState([...players.standby]);
  const [name, setName] = useState('');
  const [type, setType] = useState('main');
  const add = () => { const n = name.trim(); if (!n || main.includes(n) || standby.includes(n)) return; type === 'main' ? setMain([...main, n]) : setStandby([...standby, n]); setName(''); };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>Manage Players</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--muted)' }}>✕</button>
        </div>
        <div style={{ fontWeight: 600, color: 'var(--accent)', fontSize: '.85rem', marginBottom: 8 }}>MAIN PLAYERS</div>
        <ul style={{ listStyle: 'none', padding: 0, marginBottom: 16 }}>
          {main.map((m, i) => <li key={m} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 4px', borderBottom: '1px solid var(--line)' }}><span>{m}</span><button onClick={() => setMain(main.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', fontSize: '1.1rem' }}>✕</button></li>)}
        </ul>
        <div style={{ fontWeight: 600, color: 'var(--warn)', fontSize: '.85rem', marginBottom: 8 }}>STANDBY PLAYERS</div>
        <ul style={{ listStyle: 'none', padding: 0, marginBottom: 16 }}>
          {standby.map((m, i) => <li key={m} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 4px', borderBottom: '1px solid var(--line)' }}><span>{m}</span><button onClick={() => setStandby(standby.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', fontSize: '1.1rem' }}>✕</button></li>)}
        </ul>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} placeholder="Player name" style={{ flex: 1 }} />
          <select value={type} onChange={e => setType(e.target.value)}><option value="main">Main</option><option value="standby">Standby</option></select>
          <button className="btn" onClick={add}>+ Add</button>
        </div>
        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <button className="btn" onClick={() => onSave({ main, standby })}>Save</button>
        </div>
      </div>
    </div>
  );
}
