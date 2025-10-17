import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './ForgotPass.css';

function ForgotPass() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const response = await fetch('http://localhost:5000/api/forgot-password/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        setOtpSent(true);
      } else {
        setError(data.error || data.message);
      }
    } catch (err) {
      setError('Server error. Please try again later.');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const response = await fetch('http://localhost:5000/api/forgot-password/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        setOtpVerified(true);
      } else {
        setError(data.error || data.message);
      }
    } catch (err) {
      setError('Server error. Please try again later.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/forgot-password/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        // Optionally redirect to login page
      } else {
        setError(data.error || data.message);
      }
    } catch (err) {
      setError('Server error. Please try again later.');
    }
  };

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="login-bg">
      <div className="forgot-password-container">
        <h2 className="forgot-password-title">Forgot Password</h2>
        <form onSubmit={(e) => {
          e.preventDefault();
          if (!otpSent) {
            handleSendOtp(e);
          } else if (!otpVerified) {
            handleVerifyOtp(e);
          } else {
            handleResetPassword(e);
          }
        }}>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <div className="email-otp-group">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={otpSent}
              />
              {!otpSent && (
                <button type="button" className="send-otp-btn" onClick={handleSendOtp}>
                  Send OTP
                </button>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="otp">OTP:</label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              disabled={!otpSent || otpVerified}
            />
          </div>

          {otpVerified && (
            <>
              <div className="form-group">
                <label htmlFor="newPassword">New Password:</label>
                <div className="password-input-container">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <span className="password-toggle-icon" onClick={toggleNewPasswordVisibility}>
                    <FontAwesomeIcon icon={showNewPassword ? faEyeSlash : faEye} />
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
                  <span className="password-toggle-icon" onClick={toggleConfirmPasswordVisibility}>
                    <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                  </span>
                </div>
              </div>
            </>
          )}

          {error && <p className="error-text">{error}</p>}
          {message && <p className="success-text">{message}</p>}

          <div className="button-group">
            {otpSent && !otpVerified && (
              <button type="submit" className="verify-otp-btn">
                Verify OTP
              </button>
            )}
            {otpVerified && (
              <button type="submit" className="reset-password-btn">
                Reset Password
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default ForgotPass;
