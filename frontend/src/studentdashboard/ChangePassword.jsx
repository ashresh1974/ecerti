import React, { useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await axios.put('${process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"}/api/user/change-password', {
        currentPassword,
        newPassword,
        confirmPassword,
      }, { withCredentials: true });

      setMessage('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="apply-cert-form">
      <h2>Change Password</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Current Password:</label>
          <div className="password-input-container">
            <input
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <span className="password-toggle-icon" onClick={() => setShowCurrent(!showCurrent)}>
              <FontAwesomeIcon icon={showCurrent ? faEyeSlash : faEye} />
            </span>
          </div>
        </div>
        <div>
          <label>Create New Password:</label>
          <div className="password-input-container">
            <input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <span className="password-toggle-icon" onClick={() => setShowNew(!showNew)}>
              <FontAwesomeIcon icon={showNew ? faEyeSlash : faEye} />
            </span>
          </div>
        </div>
        <div>
          <label>Confirm New Password:</label>
          <div className="password-input-container">
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <span className="password-toggle-icon" onClick={() => setShowConfirm(!showConfirm)}>
              <FontAwesomeIcon icon={showConfirm ? faEyeSlash : faEye} />
            </span>
          </div>
        </div>
        {message && <p className={message.includes('successfully') ? 'success-message' : 'error-message'}>{message}</p>}
        <button type="submit" disabled={loading}>{loading ? 'Changing...' : 'Change Password'}</button>
      </form>
    </div>
  );
}

export default ChangePassword;
