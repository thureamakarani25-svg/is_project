import React, { useState } from 'react';
import api from './api';
import './Auth.css';

function Register({ onNavigate }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
    return 'Registration failed';
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/register/', { username, email, password, password2 });
      setSuccess('Registration successful! Redirecting to login...');
      setUsername('');
      setEmail('');
      setPassword('');
      setPassword2('');
      setTimeout(() => {
        onNavigate('login');
      }, 2000);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Register New Account</h2>
        <form onSubmit={handleRegister}>
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
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
          <div className="form-group">
            <label htmlFor="password2">Confirm Password:</label>
            <input
              id="password2"
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          <button type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p>
          Already have an account?{' '}
          <button 
            type="button" 
            className="link-button"
            onClick={() => onNavigate('login')}
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  );
}

export default Register;
