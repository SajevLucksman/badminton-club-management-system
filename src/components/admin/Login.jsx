import { useState } from 'react';
import { db } from '../../data/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) { setError('Enter username and password.'); return; }
    setError(''); setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'users'), where('username', '==', username), where('password', '==', password)));
      if (snap.empty) setError('Invalid credentials.');
      else onLogin();
    } catch { setError('Login failed.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="loginOverlay">
      <div style={{ background: 'var(--panel)', padding: 32, borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,.15)', width: 340, textAlign: 'center' }}>
        <h2 style={{ margin: '0 0 8px', color: 'var(--accent)' }}>🏸 Admin Login</h2>
        <p style={{ color: 'var(--muted)', fontSize: '.85rem', margin: '0 0 20px' }}>Log in to manage badminton charges</p>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} style={{ width: '100%', padding: 10, marginBottom: 10, background: 'var(--panel2)' }} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit(e)} style={{ width: '100%', padding: 10, marginBottom: 14, background: 'var(--panel2)' }} />
          {error && <div style={{ color: '#dc2626', fontSize: '.85rem', marginBottom: 10 }}>{error}</div>}
          <button className="btn" type="submit" disabled={loading} style={{ width: '100%', padding: 10, fontSize: '1rem' }}>{loading ? 'Logging in…' : 'Log in as Admin'}</button>
        </form>
        <p style={{ color: 'var(--muted)', fontSize: '.8rem', margin: '14px 0 0' }}>Contact <strong>Sajev Lucksman</strong> for access.</p>
      </div>
    </div>
  );
}
