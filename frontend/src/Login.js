import React, { useState } from 'react';
import api from './api';
import './Auth.css';

function Login({ onLoginSuccess, onNavigate }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const getApiErrorMessage = (err) => {
    const data = err.response?.data;

    if (!data) {
      const isLocalhost =
        window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      return isLocalhost
        ? 'Cannot reach backend API. Start Django server on http://localhost:8000'
        : 'Cannot reach backend API. Check REACT_APP_API_BASE_URL in your Vercel project settings.';
    }
    if (typeof data === 'string') {
      return data;
    }
    if (data.error) {
      return data.error;
    }
    const firstKey = Object.keys(data)[0];
    const firstValue = data[firstKey];
    if (Array.isArray(firstValue)) {
      return firstValue[0];
    }
    if (typeof firstValue === 'string') {
      return firstValue;
    }
    return 'Login failed';
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/login/', { username, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user_id', response.data.user_id);
      localStorage.setItem('username', response.data.username);
      localStorage.setItem('is_staff', response.data.is_staff);
      onLoginSuccess(response.data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Bus Ticket System - Login</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p>
          Don't have an account?{' '}
          <button 
            type="button" 
            className="link-button"
            onClick={() => onNavigate('register')}
          >
            Register here
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
