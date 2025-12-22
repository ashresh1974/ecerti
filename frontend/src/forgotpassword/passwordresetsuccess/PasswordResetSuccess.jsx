import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PasswordResetSuccess.css';

function PasswordResetSuccess() {
  const navigate = useNavigate();
  const handleGoToLogin = () => navigate('/login');

  return (
    <div className="password-reset-success-container">
      <div className="password-reset-success-box">
        <h2>Password Reset Successful!</h2>
        <p>Your password has been created successfully.</p>
        <button onClick={handleGoToLogin} className="login-button">Go to Login Page</button>
      </div>
    </div>
  );
}

export default PasswordResetSuccess;
