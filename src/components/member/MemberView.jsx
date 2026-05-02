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
      <div className="topbar section-wide-pad">
        <div className="brand">
          <h1>Badminton Charges Manager</h1>
          <p>Member View — Read Only</p>
        </div>
        <div className="monthCtl">
          <MonthNav selectedKey={selectedKey} setSelectedKey={setSelectedKey} currentKey={currentKey} />
          <Link to="/admin" className="btn secondary link-btn">Admin</Link>
          <button className="themeBtn" onClick={toggle}>{theme === 'dark' ? 'Light' : 'Dark'}</button>
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

      <div className="layout section-wide-pad">
        <section className="card">
          <div className="cardHeader">
            <div><h2>Calendar</h2><div className="sub">Week starts Monday.</div></div>
            <div className="legend"><span className="sw booked" /><span>Booked</span><span className="sw avail legend-gap" /><span>Available</span></div>
          </div>
          <div className="cardBody">
            <Calendar selectedKey={selectedKey} selectedDays={month.selectedDays || []} />
          </div>
        </section>

        <ChargesTable data={data} players={players} selectedKey={selectedKey} onShowHistory={setHistoryPlayer} />
      </div>

      <Expenses data={data} players={players} selectedKey={selectedKey} />
      <ShuttleTracker data={data} selectedKey={selectedKey} players={players} />

      <footer>© 2026 Sajev Lucksman. All rights reserved.</footer>

      {historyPlayer && <PlayerHistory data={data} player={historyPlayer} onClose={() => setHistoryPlayer(null)} />}
    </>
  );
}
