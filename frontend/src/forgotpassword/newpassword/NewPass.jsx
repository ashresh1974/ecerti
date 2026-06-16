import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './NewPass.css';

function NewPass() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { email, otp } = location.state || {};

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    // eslint-disable-next-line no-useless-escape
    if (!/(?=.*\d)(?=.*[@#$%^&*!])/.test(password)) {
      setError('Password must contain at least one number and one symbol (@, #, $, %, ^, &, *, !).');
      return;
    }

    if (!email || !otp) {
      setError('Email or OTP not provided. Please go back to the forgot password page.');
      return;
    }

    try {
      const response = await fetch('${process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"}/api/forgot-password/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp, newPassword: password }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/passwordresetsuccess');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Server error. Please try again later.');
    }
  };

  return (
    <div className="login-bg">
      <div className="new-password-container">
        <h2 className="new-password-title">Create New Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="password">New Password:</label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span className="password-toggle-icon" onClick={togglePasswordVisibility}
                    tabIndex={0}
                    role="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { togglePasswordVisibility(); e.preventDefault(); } }}>
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </span>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password:</label>
            <div className="password-input-container">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <span className="password-toggle-icon" onClick={toggleConfirmPasswordVisibility}
                    tabIndex={0}
                    role="button"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { toggleConfirmPasswordVisibility(); e.preventDefault(); } }}>
                <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
              </span>
            </div>
          </div>
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="reset-password-btn">Reset Password</button>
        </form>
      </div>
    </div>
  );
}

export default NewPass;
