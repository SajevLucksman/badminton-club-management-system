import { useState, useEffect, useCallback, useRef } from 'react';
import { onSnapshot, setDoc } from 'firebase/firestore';
import { DOC_REF } from '../data/firebase';
import { monthKey, ensureMonth, propagateCreditsForward } from '../utils/helpers';

const now = new Date();
const CURRENT_KEY = monthKey(now.getFullYear(), now.getMonth());

export function useBadmintonData() {
  const [data, setData] = useState({ credits: {}, months: {} });
  const [players, setPlayers] = useState({ main: [], standby: [] });
  const [selectedKey, setSelectedKey] = useState(CURRENT_KEY);
  const saveTimer = useRef(null);

  useEffect(() => {
    const unsub = onSnapshot(DOC_REF, snap => {
      if (!snap.exists()) return;
      const obj = snap.data();
      const p = obj._members || { main: [], standby: [] };
      setPlayers({ main: p.main || [], standby: p.standby || [] });
      const d = JSON.parse(JSON.stringify(obj));
      delete d._members;
      if (!d.credits) d.credits = {};
      if (!d.months) d.months = {};
      setData(d);
    });
    return unsub;
  }, []);

  const save = useCallback((newData, newPlayers) => {
    const p = newPlayers || players;
    setData(newData);
    if (newPlayers) setPlayers(newPlayers);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const exp = JSON.parse(JSON.stringify(newData));
      exp._members = { main: p.main, standby: p.standby };
      setDoc(DOC_REF, exp).catch(console.error);
    }, 500);
  }, [players]);

  const updateMonth = useCallback((key, updater) => {
    const d = JSON.parse(JSON.stringify(data));
    ensureMonth(d, key, players.main, players.standby);
    updater(d.months[key], d);
    propagateCreditsForward(d, key, players.main, players.standby);
    save(d);
  }, [data, players, save]);

  return { data, players, selectedKey, setSelectedKey, save, updateMonth, currentKey: CURRENT_KEY };
}
