import { SHUTTLES_PER_TIN } from '../../utils/helpers';
import Calendar from '../shared/Calendar';

export default function AdminShuttleTracker({ selectedKey, month, updateMonth }) {
  const tins = month.tinCount || 0;
  const extra = month.extraShuttles || 0;
  const total = tins * SHUTTLES_PER_TIN + extra;
  const used = (month.shuttleDays || []).length;
  const remaining = Math.max(0, total - used);

  const toggleShuttleDay = (d) => updateMonth(selectedKey, m => {
    const i = m.shuttleDays.indexOf(d);
    i >= 0 ? m.shuttleDays.splice(i, 1) : m.shuttleDays.push(d);
  });

  return (
    <section className="card section-wide">
      <div className="cardHeader"><h2>Shuttle Tracker</h2></div>
      <div className="cardBody">
        <div className="grid4 text-center mb-16">
          <div className="mini"><label>Tins</label><strong className="stat-accent">{tins}</strong></div>
          <div className="mini">
            <label>Extra Shuttles</label>
            <input type="number" className="mini-input-sm" value={extra} onChange={e => updateMonth(selectedKey, m => { m.extraShuttles = Math.max(0, Number(e.target.value) || 0); })} />
          </div>
          <div className="mini"><label>Used</label><strong className="stat-danger">{used}</strong></div>
          <div className="mini"><label>Remaining</label><strong className="stat-success">{remaining}</strong></div>
        </div>
        <h4 className="mb-8">Click to mark shuttle days</h4>
        <Calendar selectedKey={selectedKey} selectedDays={month.shuttleDays || []} onToggleDay={toggleShuttleDay} activeLabel="Used" inactiveLabel="" />
      </div>
    </section>
  );
}
