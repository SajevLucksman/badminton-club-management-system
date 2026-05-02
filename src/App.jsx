import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useBadmintonData } from './hooks/useBadmintonData';
import MemberView from './components/member/MemberView';
import Login from './components/admin/Login';
import AdminDashboard from './components/admin/AdminDashboard';

export default function App() {
  const { data, players, selectedKey, setSelectedKey, save, updateMonth, currentKey } = useBadmintonData();
  const [adminLoggedIn, setAdminLoggedIn] = useState(() => sessionStorage.getItem('admin_logged_in') === '1');

  const handleLogin = () => {
    sessionStorage.setItem('admin_logged_in', '1');
    setAdminLoggedIn(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_logged_in');
    setAdminLoggedIn(false);
  };

  return (
    <Routes>
      <Route path="/" element={
        <MemberView data={data} players={players} selectedKey={selectedKey} setSelectedKey={setSelectedKey} currentKey={currentKey} />
      } />
      <Route path="/admin" element={
        adminLoggedIn
          ? <AdminDashboard data={data} players={players} selectedKey={selectedKey} setSelectedKey={setSelectedKey} currentKey={currentKey} updateMonth={updateMonth} save={save} onLogout={handleLogout} />
          : <Login onLogin={handleLogin} />
      } />
    </Routes>
  );
}
