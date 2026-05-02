import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ensureMonth } from '../../utils/helpers';
import { useTheme } from '../../hooks/useTheme';
import MonthNav from '../shared/MonthNav';
import Calendar from '../shared/Calendar';
import PlayerHistory from '../shared/PlayerHistory';
import ChargesTable from './ChargesTable';
import Expenses from './Expenses';
import ShuttleTracker from './ShuttleTracker';

export default function MemberView({ data, players, selectedKey, setSelectedKey, currentKey }) {
  const { theme, toggle } = useTheme();
  const [historyPlayer, setHistoryPlayer] = useState(null);

  ensureMonth(data, selectedKey, players.main, players.standby);
  const month = data.months[selectedKey] || {};

  return (
    <>
      <div className="topbar" style={{ maxWidth: 1200, margin: '18px auto 0', padding: '0 16px' }}>
        <div className="brand">
          <h1>🏸 Badminton Charges Manager</h1>
          <p>Member View — Read Only</p>
          <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: 11 }}>📍 Weber Indoor, Batticaloa &nbsp;|&nbsp; 🕕 6 PM – 7 PM</p>
        </div>
        <div className="monthCtl">
          <MonthNav selectedKey={selectedKey} setSelectedKey={setSelectedKey} currentKey={currentKey} />
          <Link to="/admin" className="btn secondary" style={{ textDecoration: 'none' }}>🔐 Admin</Link>
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
            <div><h2>📅 Calendar</h2><div className="sub">Week starts Monday.</div></div>
            <div className="legend">
              <span className="sw booked" /><span>Booked</span>
              <span className="sw avail" style={{ marginLeft: 10 }} /><span>Available</span>
            </div>
          </div>
          <div className="cardBody">
            <Calendar selectedKey={selectedKey} selectedDays={month.selectedDays || []} />
          </div>
        </section>

        {/* Charges & Payments */}
        <ChargesTable data={data} players={players} selectedKey={selectedKey} onShowHistory={setHistoryPlayer} />
      </div>

      <Expenses data={data} players={players} selectedKey={selectedKey} />
      <ShuttleTracker data={data} selectedKey={selectedKey} players={players} />

      <footer>© 2026 Sajev Lucksman. All rights reserved.</footer>

      {historyPlayer && <PlayerHistory data={data} player={historyPlayer} onClose={() => setHistoryPlayer(null)} />}
    </>
  );
}
