import { useState } from 'react';
import { fmtMoney, clamp2, getExpenseTotal } from '../../utils/helpers';

export default function AdminExpenses({ data, selectedKey, month, updateMonth }) {
  const [expType, setExpType] = useState('court');
  const [expAmount, setExpAmount] = useState('');
  const [expShop, setExpShop] = useState('');
  const expTotals = getExpenseTotal(data, selectedKey);
  const expenses = month.expenses || [];

  const addExpense = () => {
    if (!expAmount) return;
    updateMonth(selectedKey, m => {
      m.expenses.push({ type: expType, amount: clamp2(Number(expAmount)), shop: expType === 'shuttle' ? expShop : '', date: new Date().toISOString().slice(0, 10) });
    });
    setExpAmount(''); setExpShop('');
  };

  return (
    <section className="card section-wide">
      <div className="cardHeader"><h2>Expenses</h2></div>
      <div className="cardBody">
        <div className="expense-add-row">
          <select value={expType} onChange={e => setExpType(e.target.value)}>
            <option value="court">Court Booking</option>
            <option value="shuttle">Shuttle Purchase</option>
          </select>
          <input type="number" placeholder="Amount (LKR)" value={expAmount} onChange={e => setExpAmount(e.target.value)} />
          {expType === 'shuttle' && <input type="text" placeholder="Shop name" value={expShop} onChange={e => setExpShop(e.target.value)} />}
          <button className="btn" onClick={addExpense}>+ Add</button>
        </div>
        <table>
          <thead><tr><th>Type</th><th className="right">Amount</th><th>Shop</th><th>Date</th><th></th></tr></thead>
          <tbody>
            {expenses.length === 0
              ? <tr><td colSpan="5" className="sub">No expenses.</td></tr>
              : expenses.map((e, i) => (
                <tr key={i}>
                  <td>{e.type === 'court' ? 'Court Booking' : 'Shuttle Purchase'}</td>
                  <td className="right">{fmtMoney(e.amount)}</td>
                  <td>{e.shop || '—'}</td>
                  <td>{e.date || '—'}</td>
                  <td><button className="btn-remove" onClick={() => updateMonth(selectedKey, m => { m.expenses.splice(i, 1); })}>x</button></td>
                </tr>
              ))}
          </tbody>
          <tfoot>
            <tr className="bold-row"><td>Total Court</td><td className="right">{fmtMoney(expTotals.court)}</td><td colSpan="3" /></tr>
            <tr className="bold-row"><td>Total Shuttles</td><td className="right">{fmtMoney(expTotals.shuttle)}</td><td colSpan="3" /></tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
