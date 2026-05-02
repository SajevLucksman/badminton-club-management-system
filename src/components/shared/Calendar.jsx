import { parseKey } from '../../utils/helpers';

export default function Calendar({ selectedKey, selectedDays = [], onToggleDay }) {
  const { y, mIndex } = parseKey(selectedKey);
  const firstDow = new Date(y, mIndex, 1).getDay();
  const leading = (firstDow + 6) % 7;
  const daysInMonth = new Date(y, mIndex + 1, 0).getDate();
  const now = new Date();
  const isCurrentMonth = y === now.getFullYear() && mIndex === now.getMonth();
  const todayDate = now.getDate();

  const cells = [];
  for (let i = 0; i < leading; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  const trailing = (7 - (cells.length % 7)) % 7;
  for (let i = 0; i < trailing; i++) cells.push(null);

  return (
    <>
      <div className="calGrid">
        {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(h => <div key={h} className="wd">{h}</div>)}
      </div>
      <div className="calGrid" style={{ marginTop: 8 }}>
        {cells.map((d, i) => {
          if (!d) return <div key={`pad-${i}`} className="day inactive"><div className="dnum">&nbsp;</div></div>;
          const booked = selectedDays.includes(d);
          const isToday = isCurrentMonth && d === todayDate;
          return (
            <div
              key={d}
              className={`day${booked ? ' selected' : ''}${isToday ? ' today' : ''}`}
              onClick={() => onToggleDay?.(d)}
              style={onToggleDay ? {} : { cursor: 'default' }}
            >
              <div className="dnum">{d}</div>
              {booked && <div className="time">6 – 7 PM</div>}
              <span className={`badge ${booked ? 'booked' : 'avail'}`}>{booked ? 'Booked' : 'Available'}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}
