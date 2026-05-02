import { ensureMonth, parseKey, SHUTTLES_PER_TIN } from '../../utils/helpers';
import Calendar from '../shared/Calendar';

export default function ShuttleTracker({ data, selectedKey, players = { main: [], standby: [] } }) {
  ensureMonth(data, selectedKey, players.main || [], players.standby || []);
  const month = data.months[selectedKey];
  const tins = month.tinCount || 0;
  const extra = month.extraShuttles || 0;
  const total = (tins * SHUTTLES_PER_TIN) + extra;
  const used = (month.shuttleDays || []).length;
  const remaining = Math.max(0, total - used);
  const pct = total > 0 ? Math.min(100, (remaining / total) * 100) : 0;

  return (
    <section className="card section-wide">
      <div className="cardHeader"><h2>Shuttle Tracker</h2></div>
      <div className="cardBody">
        <div className="grid4" style={{ textAlign: 'center', marginBottom: 16 }}>
          <div className="mini"><label>Tins Purchased</label><strong style={{ fontSize: '1.3rem', color: 'var(--accent)' }}>{tins}</strong><div className="sub">6 shuttles per tin</div></div>
          <div className="mini"><label>Extra Shuttles</label><strong style={{ fontSize: '1.3rem', color: 'var(--accent)' }}>{extra}</strong></div>
          <div className="mini"><label>Shuttles Used</label><strong style={{ fontSize: '1.3rem', color: '#ef4444' }}>{used}</strong></div>
          <div className="mini"><label>Remaining</label><strong style={{ fontSize: '1.3rem', color: remaining <= 2 ? '#ef4444' : '#10b981' }}>{remaining}</strong></div>
        </div>
        <div style={{ height: 12, borderRadius: 6, background: 'var(--panel2)', overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ height: '100%', borderRadius: 6, background: remaining <= 2 ? '#ef4444' : 'linear-gradient(90deg,#10b981,#06b6d4)', transition: 'width .3s', width: `${pct}%` }} />
        </div>
        <h4 style={{ margin: '0 0 8px' }}>Shuttle usage this month</h4>
        <Calendar selectedKey={selectedKey} selectedDays={month.shuttleDays || []} activeLabel="Used" inactiveLabel="" />
        <div style={{ marginTop: 12 }}>
          <div className="sub"><b>Shuttle usage log</b></div>
          <ul className="histList">
            {(month.shuttleDays || []).length === 0
              ? <li>No shuttles used yet.</li>
              : [...(month.shuttleDays || [])].sort((a, b) => a - b).map(d => <li key={d}>Day {d} — New shuttle used</li>)
            }
          </ul>
        </div>
      </div>
    </section>
  );
}
