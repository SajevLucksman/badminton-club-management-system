import { useState } from 'react';
import { fmtMoney, clamp2, getExpenseTotal } from '../../utils/helpers';

export default function AdminExpenses({ data, selectedKey, month, updateMonth }) {
  const [expType, setExpType] = useState('court');
  const [expAmount, setExpAmount] = useState('');
  const [expShop, setExpShop] = useState('');
  const [expCourier, setExpCourier] = useState('');
  const [expDesc, setExpDesc] = useState('');
  const expTotals = getExpenseTotal(data, selectedKey);
  const expenses = month.expenses || [];

  const addExpense = () => {
    if (!expAmount) return;
    updateMonth(selectedKey, m => {
      m.expenses.push({ type: expType, amount: clamp2(Number(expAmount)), shop: expType === 'shuttle' ? expShop : '', courierCharges: expType === 'shuttle' ? clamp2(Number(expCourier) || 0) : 0, desc: expType === 'misc' ? expDesc : '', date: new Date().toISOString().slice(0, 10) });
    });
    setExpAmount(''); setExpShop(''); setExpCourier(''); setExpDesc('');
  };

  return (
    <section className="card section-wide">
      <div className="cardHeader"><h2>Expenses</h2></div>
      <div className="cardBody">
        <div className="expense-add-row">
          <select value={expType} onChange={e => setExpType(e.target.value)}>
            <option value="court">Court Booking</option>
            <option value="shuttle">Shuttle Purchase</option>
            <option value="misc">Miscellaneous</option>
          </select>
          <input type="number" placeholder="Amount (LKR)" value={expAmount} onChange={e => setExpAmount(e.target.value)} />
          {expType === 'shuttle' && <input type="text" placeholder="Shop name" value={expShop} onChange={e => setExpShop(e.target.value)} />}
          {expType === 'shuttle' && <input type="number" placeholder="Courier (LKR)" value={expCourier} onChange={e => setExpCourier(e.target.value)} />}
          {expType === 'misc' && <input type="text" placeholder="Description" value={expDesc} onChange={e => setExpDesc(e.target.value)} />}
          <button className="btn" onClick={addExpense}>+ Add</button>
        </div>
        <table>
          <thead><tr><th>Type</th><th className="right">Amount</th><th>Shop</th><th className="right">Courier</th><th>Date</th><th></th></tr></thead>
          <tbody>
            {expenses.length === 0
              ? <tr><td colSpan="6" className="sub">No expenses.</td></tr>
              : expenses.map((e, i) => (
                <tr key={i}>
                  <td>{e.type === 'court' ? 'Court Booking' : e.type === 'shuttle' ? 'Shuttle Purchase' : `Misc: ${e.desc || '—'}`}</td>
                  <td className="right">{fmtMoney(e.amount)}</td>
                  <td>{e.shop || '—'}</td>
                  <td className="right">{e.courierCharges ? fmtMoney(e.courierCharges) : '—'}</td>
                  <td>{e.date || '—'}</td>
                  <td><button className="btn-remove" onClick={() => updateMonth(selectedKey, m => { m.expenses.splice(i, 1); })}>x</button></td>
                </tr>
              ))}
          </tbody>
          <tfoot>
            <tr className="bold-row"><td>Total Court</td><td className="right">{fmtMoney(expTotals.court)}</td><td colSpan="4" /></tr>
            <tr className="bold-row"><td>Total Shuttles</td><td className="right">{fmtMoney(expTotals.shuttle)}</td><td colSpan="4" /></tr>
            <tr className="bold-row"><td>Total Misc</td><td className="right">{fmtMoney(expTotals.misc)}</td><td colSpan="4" /></tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
