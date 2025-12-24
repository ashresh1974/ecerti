import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './ForgotPass.css';

function ForgotPass() {
  const navigate = useNavigate();
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
  const [otpBtnText, setOtpBtnText] = useState("Send OTP");

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const gmailRegex = /^[^\s@]+@gmail\.com$/;
    return emailRegex.test(email) && gmailRegex.test(email);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!email) {
      setError('Email is required.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Invalid email id. Only Gmail addresses are allowed.');
      return;
    }
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
        setError(data.message);
        setOtpSent(false);
        setOtpBtnText("Resend OTP");
      } else {
        setError('Failed to send OTP. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
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
        setError('Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
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
    // eslint-disable-next-line no-useless-escape
    if (!/(?=.*\d)(?=.*[@#$%^&*!])/.test(newPassword)) {
      setError('Password must contain at least one number and one symbol (@, #, $, %, ^, &, *, !).');
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

      if (response.ok) {
        navigate('/passwordresetsuccess');
      } else {
        setError('Failed to reset password. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
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
        <button className="back-button" onClick={() => navigate(-1)} title="Go back" style={{ padding: "6px 12px", fontSize: "14px", width: "auto" }}>
           Back
        </button>
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
              <button type="button" className="send-otp-btn" onClick={handleSendOtp}>
                {otpBtnText}
              </button>
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
                  <span className="password-toggle-icon" onClick={toggleNewPasswordVisibility}
                        tabIndex={0}
                        role="button"
                        aria-label={showNewPassword ? "Hide password" : "Show password"}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { toggleNewPasswordVisibility(); e.preventDefault(); } }}>
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
                  <span className="password-toggle-icon" onClick={toggleConfirmPasswordVisibility}
                        tabIndex={0}
                        role="button"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { toggleConfirmPasswordVisibility(); e.preventDefault(); } }}>
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
