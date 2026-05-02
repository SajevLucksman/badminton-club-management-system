import { parseKey, monthKey, prevMonthKey, nextMonthKey, MONTH_NAMES } from '../../utils/helpers';

export default function MonthNav({ selectedKey, setSelectedKey, currentKey }) {
  const { y, mIndex } = parseKey(selectedKey);
  return (
    <>
      <button className="btn secondary" onClick={() => setSelectedKey(prevMonthKey(selectedKey))}>Prev</button>
      <button className="btn secondary" onClick={() => setSelectedKey(nextMonthKey(selectedKey))}>Next</button>
      <select value={mIndex} onChange={e => setSelectedKey(monthKey(y, Number(e.target.value)))}>
        {MONTH_NAMES.map((n, i) => <option key={i} value={i}>{n}</option>)}
      </select>
      <select value={y} onChange={e => setSelectedKey(monthKey(Number(e.target.value), mIndex))}>
        {[2024,2025,2026,2027,2028].map(yr => <option key={yr} value={yr}>{yr}</option>)}
      </select>
      <button className="btn" onClick={() => setSelectedKey(currentKey)}>Go to Current Month</button>
    </>
  );
}
