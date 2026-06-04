import { useState, useEffect, useCallback, useRef } from 'react';
import { subscribeToBadmintonData, saveBadmintonData } from '../services/badmintonService';
import { monthKey, ensureMonth, propagateCreditsForward } from '../utils/helpers';

const now = new Date();
const CURRENT_KEY = monthKey(now.getFullYear(), now.getMonth());

export function useBadmintonData() {
  const [data, setData] = useState({ credits: {}, months: {} });
  const [players, setPlayers] = useState({ main: [], standby: [] });
  const [selectedKey, setSelectedKey] = useState(CURRENT_KEY);
  const saveTimer = useRef(null);

  useEffect(() => {
    return subscribeToBadmintonData(({ data: d, players: p }) => {
      // Re-propagate credits for all months on load
      const keys = Object.keys(d.months).sort();
      keys.forEach(k => {
        ensureMonth(d, k, p.main, p.standby);
        propagateCreditsForward(d, k, p.main, p.standby, p.enrolled, p.left);
      });
      setData(d);
      setPlayers(p);
    });
  }, []);

  const save = useCallback((newData, newPlayers) => {
    const p = newPlayers || players;
    setData(newData);
    if (newPlayers) setPlayers(newPlayers);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveBadmintonData(newData, p).catch(console.error);
    }, 500);
  }, [players]);

  const updateMonth = useCallback((key, updater) => {
    const d = JSON.parse(JSON.stringify(data));
    ensureMonth(d, key, players.main, players.standby);
    updater(d.months[key], d);
    propagateCreditsForward(d, key, players.main, players.standby, players.enrolled, players.left);
    save(d);
  }, [data, players, save]);

  return { data, players, selectedKey, setSelectedKey, save, updateMonth, currentKey: CURRENT_KEY };
}
