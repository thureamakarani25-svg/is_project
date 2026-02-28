import React, { useEffect, useState } from 'react';
import './App.css';
import Login from './Login';
import Register from './Register';
import UserDashboard from './UserDashboard';
import AdminDashboard from './AdminDashboard';
import api from './api';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const userId = localStorage.getItem('user_id');
    const isStaffRaw = localStorage.getItem('is_staff');

    if (token && username && userId && isStaffRaw !== null) {
      const isStaff = String(isStaffRaw) === 'true';
      setUser({
        token,
        username,
        user_id: Number(userId),
        is_staff: isStaff,
      });
      setCurrentPage(isStaff ? 'admin' : 'user');
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setCurrentPage(userData.is_staff ? 'admin' : 'user');
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const handleLogout = async () => {
    try {
      await api.post('/logout/');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('is_staff');
      localStorage.removeItem('user_id');
      setUser(null);
      setCurrentPage('login');
    }
  };

  return (
    <div className="App">
      {user && (
        <nav className="navbar">
          <div className="nav-container">
            <h1 className="nav-brand">Bus Ticket System</h1>
            <div className="nav-right">
              <span className="nav-user">{user.username}</span>
              <button className="btn-logout" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </nav>
      )}

      {!user ? (
        <>
          {currentPage === 'login' && (
            <Login onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />
          )}
          {currentPage === 'register' && <Register onNavigate={handleNavigate} />}
        </>
      ) : user.is_staff ? (
        <AdminDashboard user={user} />
      ) : (
        <UserDashboard user={user} />
      )}
    </div>
  );
}

export default App;
