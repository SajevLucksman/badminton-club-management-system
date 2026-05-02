import { useState } from 'react';

export default function PlayersModal({ players, onClose, onSave }) {
  const [main, setMain] = useState([...players.main]);
  const [standby, setStandby] = useState([...players.standby]);
  const [name, setName] = useState('');
  const [type, setType] = useState('main');

  const add = () => {
    const n = name.trim();
    if (!n || main.includes(n) || standby.includes(n)) return;
    type === 'main' ? setMain([...main, n]) : setStandby([...standby, n]);
    setName('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Manage Players</h3>
          <button className="btn-close" onClick={onClose}>x</button>
        </div>
        <div className="player-group-label accent">MAIN PLAYERS</div>
        <ul className="player-list">
          {main.map((m, i) => (
            <li key={m} className="player-list-item">
              <span>{m}</span>
              <button className="btn-close danger" onClick={() => setMain(main.filter((_, j) => j !== i))}>x</button>
            </li>
          ))}
        </ul>
        <div className="player-group-label warn">STANDBY PLAYERS</div>
        <ul className="player-list">
          {standby.map((m, i) => (
            <li key={m} className="player-list-item">
              <span>{m}</span>
              <button className="btn-close danger" onClick={() => setStandby(standby.filter((_, j) => j !== i))}>x</button>
            </li>
          ))}
        </ul>
        <div className="player-add-row">
          <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} placeholder="Player name" />
          <select value={type} onChange={e => setType(e.target.value)}>
            <option value="main">Main</option>
            <option value="standby">Standby</option>
          </select>
          <button className="btn" onClick={add}>+ Add</button>
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={() => onSave({ main, standby })}>Save</button>
        </div>
      </div>
    </div>
  );
}
