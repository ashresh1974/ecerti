import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './CreatePass.css';

function CreatePass() {
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [fullName, setFullName] = useState('');
  const [roll, setRoll] = useState('');
  const [course, setCourse] = useState('');
  const [branch, setBranch] = useState('');
  const [gender, setGender] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state) {
      setFullName(location.state.fullName || '');
      setRoll(location.state.roll || '');
      setCourse(location.state.course || '');
      setBranch(location.state.branch || '');
      setGender(location.state.gender || '');
      setMobile(location.state.mobile || '');
      setEmail(location.state.email || '');
      setUsername(location.state.username || location.state.email || '');
    } else {
      setMessage('Registration data not provided. Please go through the registration flow.');
    }
  }, [location.state]);

  // Enforce: no spaces, only lowercase
  const handleUsernameChange = (e) => {
    let val = e.target.value.replace(/\s/g, ''); // remove spaces
    val = val.replace(/[^a-z0-9._-]/g, ''); // allow only lowercase a-z, numbers, ., _, -
    setUsername(val.toLowerCase());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password || !confirmPassword) {
      setMessage('All fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }
    // eslint-disable-next-line no-useless-escape
    if (!/(?=.*\d)(?=.*[@#$%^&*!])/.test(password)) {
      setMessage('Password must contain at least one number and one symbol (@, #, $, %, ^, &, *, !).');
      return;
    }
    if (/\s/.test(username) || username !== username.toLowerCase()) {
      setMessage('Username must be lowercase and contain no spaces.');
      return;
    }
    try {
      const response = await axios.post('${process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"}/api/register', {
        fullName,
        roll,
        course,
        branch,
        gender,
        mobile,
        email,
        username,
        password,
      });
      setMessage(response.data.message);
      if (response.status === 201) {
        navigate('/registersuccess');
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="login-bg">
      <div className="login-container">
        <h2 className="portal-title">Complete Registration</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={handleUsernameChange}
              required
              maxLength={30}
              pattern="[a-z0-9._-]+"
              title="Lowercase, numbers, dot, underscore, hyphen only. No spaces."
              autoComplete="username"
            />
          </div>
          <div className="input-group password-input-container">
            <label htmlFor="password">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <span
              className="password-toggle-icon"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={0}
              role="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setShowPassword(!showPassword); e.preventDefault(); } }}
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </span>
          </div>
          <div className="input-group password-input-container">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <span
              className="password-toggle-icon"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              tabIndex={0}
              role="button"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setShowConfirmPassword(!showConfirmPassword); e.preventDefault(); } }}
            >
              <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
            </span>
          </div>
          {message && <p className="message">{message}</p>}
          <button type="submit" className="login-button">Register</button>
        </form>
      </div>
    </div>
  );
}

export default CreatePass;
