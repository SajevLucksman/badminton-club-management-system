import { doc, collection, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../data/firebase';

const DOC_REF = doc(collection(db, 'badminton'), 'data');

export function subscribeToBadmintonData(callback) {
  return onSnapshot(DOC_REF, (snap) => {
    if (!snap.exists()) return;
    const obj = snap.data();
    const players = {
      main: obj._members?.main || [],
      standby: obj._members?.standby || [],
      enrolled: obj._members?.enrolled || {},
      left: obj._members?.left || {},
    };
    const data = JSON.parse(JSON.stringify(obj));
    delete data._members;
    if (!data.credits) data.credits = {};
    if (!data.months) data.months = {};
    callback({ data, players });
  });
}

export function saveBadmintonData(data, players) {
  const payload = JSON.parse(JSON.stringify(data));
  payload._members = { main: players.main, standby: players.standby, enrolled: players.enrolled || {}, left: players.left || {} };
  return setDoc(DOC_REF, payload);
}
