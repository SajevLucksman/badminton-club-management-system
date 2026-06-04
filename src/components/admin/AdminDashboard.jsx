import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ensureMonth, parseKey, MONTH_NAMES } from '../../utils/helpers';
import { useTheme } from '../../hooks/useTheme';
import MonthNav from '../shared/MonthNav';
import Calendar from '../shared/Calendar';
import PlayerHistory from '../shared/PlayerHistory';
import PlayersModal from '../shared/PlayersModal';
import AdminChargesTable from './AdminChargesTable';
import AdminExpenses from './AdminExpenses';
import AdminShuttleTracker from './AdminShuttleTracker';

export default function AdminDashboard({ data, players, selectedKey, setSelectedKey, currentKey, updateMonth, save, onLogout }) {
  const { theme, toggle } = useTheme();
  const [showPlayers, setShowPlayers] = useState(false);
  const [historyPlayer, setHistoryPlayer] = useState(null);

  ensureMonth(data, selectedKey, players.main, players.standby);
  const { y, mIndex } = parseKey(selectedKey);
  const month = data.months[selectedKey] || {};

  const toggleDay = (d) => updateMonth(selectedKey, m => {
    const i = m.selectedDays.indexOf(d);
    i >= 0 ? m.selectedDays.splice(i, 1) : m.selectedDays.push(d);
  });

  return (
    <>
      {/* Topbar */}
      <div className="topbar section-wide-pad">
        <div className="brand">
          <img src="/club-logo.png" alt="Club Logo" className="brand-logo" />
          <div>
            <h1>Shuttle and Scales</h1><p className="sub">Harmony Smashes</p>
          </div>
        </div>
        <div className="monthCtl">
          <MonthNav selectedKey={selectedKey} setSelectedKey={setSelectedKey} currentKey={currentKey} />
          <button className="btn" onClick={() => setShowPlayers(true)}>Players</button>
          <button className="btn secondary" onClick={() => { if (confirm('Reset ALL data?')) save({ credits: {}, months: {} }, players); }}>Reset Data</button>
          <button className="btn secondary" onClick={onLogout}>Logout</button>
          <Link to="/" className="btn secondary link-btn">Member View</Link>
          <button className="themeBtn" onClick={toggle}>{theme === 'dark' ? '☀️' : '🌙'}</button>
        </div>
      </div>

      {/* Players */}
      <section className="card section-wide">
        <div className="cardHeader"><h2>Players</h2></div>
        <div className="cardBody players-display">
          <div>
            <div className="player-group-label accent">MAIN PLAYERS</div>
            <div className="pill-row">
              {players.main.length ? players.main.map(m => <span key={m} className="pill ok">{m}</span>) : <span className="sub">None</span>}
            </div>
          </div>
          <div>
            <div className="player-group-label warn">STANDBY PLAYERS</div>
            <div className="pill-row">
              {players.standby.length ? players.standby.map(m => <span key={m} className="pill due">{m}</span>) : <span className="sub">None</span>}
            </div>
          </div>
        </div>
      </section>

      {/* Calendar + Charges */}
      <div className="layout section-wide-pad">
        <section className="card">
          <div className="cardHeader">
            <div><h2>{MONTH_NAMES[mIndex]} {y} — Calendar</h2><div className="sub">Click days to toggle booked.</div></div>
            <div className="legend"><span className="sw booked" /><span>Booked</span><span className="sw avail legend-gap" /><span>Available</span></div>
          </div>
          <div className="cardBody">
            <Calendar selectedKey={selectedKey} selectedDays={month.selectedDays || []} onToggleDay={toggleDay} />
          </div>
        </section>

        <AdminChargesTable data={data} players={players} selectedKey={selectedKey} month={month} updateMonth={updateMonth} onShowHistory={setHistoryPlayer} />
      </div>

      <AdminExpenses data={data} selectedKey={selectedKey} month={month} updateMonth={updateMonth} />
      <AdminShuttleTracker selectedKey={selectedKey} month={month} updateMonth={updateMonth} />

      <footer>© 2026 Sajev Lucksman. All rights reserved.</footer>

      {historyPlayer && <PlayerHistory data={data} player={historyPlayer} onClose={() => setHistoryPlayer(null)} />}
      {showPlayers && <PlayersModal players={players} selectedKey={selectedKey} onClose={() => setShowPlayers(false)} onSave={p => { save(JSON.parse(JSON.stringify(data)), p); setShowPlayers(false); }} />}
    </>
  );
}
