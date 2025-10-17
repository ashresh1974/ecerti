import React from 'react';
import { useNavigate } from 'react-router-dom';
import './RegisterSucc.css';

function RegisterSucc() {
  const navigate = useNavigate();
  const handleGoToHome = () => navigate('/');

  return (
    <div className="register-success-container">
      <div className="register-success-box">
        <h2>Registration Successful!</h2>
        <p>Your account has been created successfully.</p>
        <button onClick={handleGoToHome} className="home-button">Go to Home Page</button>
      </div>
    </div>
  );
}

export default RegisterSucc;
