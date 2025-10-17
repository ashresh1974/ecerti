import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './App.css';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        email: username,
        password,
      });
      
      if (response.status === 200) {
        // FIXED: Correct role access
        const { role } = response.data.user;
        
        // Store user data in localStorage for dashboard use
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // FIXED: Navigate to correct routes
        if (role === 1) {
          navigate('/admindashboard');
        } else {
          navigate('/studentdashboard');
        }
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-bg">
      <div className="login-container">
        <h2 className="portal-title">E-certificate Management Portal</h2>
        <h3 className="login-subtitle">Login</h3>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="username">Username/Email ID</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span className="password-toggle-icon" onClick={togglePasswordVisibility}>
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </span>
            </div>
            <Link to="/forgotpassword" className="forgot-password-link">forgot password?</Link>
          </div>
          {message && <p className="message error-message">{message}</p>}
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="register-row">
          <span>Haven't have an account?</span>{" "}
          <Link to="/register" className="register-link">
            REGISTER
          </Link>
        </div>
      </div>
    </div>
  );
}

export default App;
