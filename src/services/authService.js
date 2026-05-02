import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../data/firebase';

export async function verifyAdminCredentials(username, password) {
  const q = query(
    collection(db, 'users'),
    where('username', '==', username),
    where('password', '==', password),
  );
  const snap = await getDocs(q);
  return !snap.empty;
}
