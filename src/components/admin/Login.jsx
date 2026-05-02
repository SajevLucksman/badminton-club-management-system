import { useState } from 'react';
import { verifyAdminCredentials } from '../../services/authService';

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
      const valid = await verifyAdminCredentials(username, password);
      if (valid) onLogin();
      else setError('Invalid credentials.');
    } catch { setError('Login failed.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="loginOverlay">
      <div className="loginCard">
        <h2 className="accent-text">Admin Login</h2>
        <p className="sub">Log in to manage badminton charges</p>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} className="login-input" />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="login-input" />
          {error && <div className="login-error">{error}</div>}
          <button className="btn login-btn" type="submit" disabled={loading}>{loading ? 'Logging in…' : 'Log in as Admin'}</button>
        </form>
        <p className="login-hint">Contact <strong>Sajev Lucksman</strong> for access.</p>
      </div>
    </div>
  );
}
