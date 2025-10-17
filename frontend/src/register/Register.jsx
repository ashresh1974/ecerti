import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [roll, setRoll] = useState("");
  const [course, setCourse] = useState("");
  const [branch, setBranch] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [verified, setVerified] = useState(false);
  const [msg, setMsg] = useState("");
  const [otpBtnText, setOtpBtnText] = useState("Send OTP");
  const [otpLoading, setOtpLoading] = useState(false);
  const [fullNameError, setFullNameError] = useState("");
  const [rollError, setRollError] = useState("");
  const [courseError, setCourseError] = useState("");
  const [branchError, setBranchError] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [otpError, setOtpError] = useState("");
  const navigate = useNavigate();

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setMsg("");
    setEmailError("");
    let isValid = true;
    if (!email) {
      setEmailError("Email ID is required.");
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError("Invalid email format.");
      isValid = false;
    }
    if (!isValid) return;
    setOtpLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/register/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        setOtpSent(true);
        setOtpBtnText("Resend OTP");
        setMsg(data.message);
      } else {
        setEmailError(data.error || data.message);
      }
    } catch (err) {
      setEmailError('Server error. Please try again later.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setMsg("");
    setOtpError("");
    try {
      const response = await fetch('http://localhost:5000/api/register/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await response.json();
      if (response.ok) {
        setVerified(true);
        setMsg(data.message);
      } else {
        setOtpError(data.message);
      }
    } catch (err) {
      setOtpError('Server error. Please try again later.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMsg("");
    setFullNameError("");
    setRollError("");
    setCourseError("");
    setBranchError("");
    setMobileError("");

    let isValid = true;
    if (!fullName) {
      setFullNameError("Full Name is required.");
      isValid = false;
    }
    if (!roll) {
      setRollError("Roll Number is required.");
      isValid = false;
    } else if (!/^\d{12}$/.test(roll)) {
      setRollError("Roll Number must be 12 digits.");
      isValid = false;
    }
    if (!course) {
      setCourseError("Course is required.");
      isValid = false;
    }
    if (!branch) {
      setBranchError("Branch is required.");
      isValid = false;
    }
    if (!mobile) {
      setMobileError("Mobile Number is required.");
      isValid = false;
    } else if (!/^\d{10}$/.test(mobile)) {
      setMobileError("Mobile Number must be 10 digits.");
      isValid = false;
    }

    if (!isValid) return;

    if (!verified) {
      setMsg("Please verify your email OTP first.");
      return;
    }

    // username and password will be set in createpassword, so pass the rest
    navigate('/createpassword', {
      state: { fullName, roll, course, branch, mobile, email }
    });
  };

  return (
    <div className="login-bg">
      <div className="login-container">
        <h2 className="portal-title" style={{ marginBottom: 10 }}>Register</h2>
        {msg && (
          <div className={msg.toLowerCase().includes("success") || msg.toLowerCase().includes("verified") ? "success-message" : "error-message"}>
            {msg}
          </div>
        )}
        <form onSubmit={handleRegister}>
          <label>Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder="Enter your full name"
            required
          />
          {fullNameError && <div className="error-text">{fullNameError}</div>}

          <label>Roll Number</label>
          <input
            type="text"
            value={roll}
            onChange={e => {
              if (/^\d{0,12}$/.test(e.target.value)) setRoll(e.target.value);
            }}
            placeholder="Enter your roll number"
            required
          />
          {rollError && <div className="error-text">{rollError}</div>}

          {/* Side-by-side Course and Branch */}
          <div className="flex-row">
            <div className="flex-half">
              <label>Course</label>
              <select
                value={course}
                onChange={e => setCourse(e.target.value)}
                required
              >
                <option value="">Select Course</option>
                <option value="B.Tech">B.Tech</option>
                <option value="MCA">MCA</option>
              </select>
              {courseError && <div className="error-text">{courseError}</div>}
            </div>
            <div className="flex-half" style={{ marginLeft: 12 }}>
              <label>Branch</label>
              <select
                value={branch}
                onChange={e => setBranch(e.target.value)}
                required
              >
                <option value="">Select Branch</option>
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="MCA">MCA</option>
              </select>
              {branchError && <div className="error-text">{branchError}</div>}
            </div>
          </div>

          <label>Mobile Number</label>
          <input
            type="text"
            value={mobile}
            onChange={e => {
              if (/^\d{0,10}$/.test(e.target.value)) setMobile(e.target.value);
            }}
            placeholder="Mobile number"
            required
          />
          {mobileError && <div className="error-text">{mobileError}</div>}

          <label>Email ID</label>
          <div className="password-field" style={{ marginBottom: 13 }}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email ID"
              required
              style={{ marginBottom: 0 }}
              disabled={otpSent}
            />
            <button
              className="otp-send-btn"
              type="button"
              onClick={handleSendOtp}
              disabled={otpLoading || email.length === 0 || otpSent}
              style={{ background: "#1c76fd", color: "#fff", borderRadius: 6, fontWeight: 600, minWidth: 110 }}
            >
              {otpLoading ? "Sending..." : otpBtnText}
            </button>
          </div>
          {emailError && <div className="error-text">{emailError}</div>}

          {otpSent && (
            <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
              <input
                type="text"
                value={otp}
                onChange={e => {
                  if (/^\d{0,6}$/.test(e.target.value)) setOtp(e.target.value);
                }}
                placeholder="Enter OTP"
                style={{ flex: 1, marginRight: 10 }}
                disabled={verified}
                required
              />
              <button
                type="button"
                className="otp-send-btn"
                style={{
                  background: verified ? "#48c774" : "#1c76fd",
                  color: "#fff",
                  borderRadius: 6,
                  fontWeight: 600,
                  minWidth: 80,
                  border: 'none',
                  cursor: verified ? "not-allowed" : "pointer",
                }}
                onClick={handleVerifyOtp}
                disabled={verified || otp.length !== 6}
              >
                {verified ? "Verified" : "Verify"}
              </button>
            </div>
          )}
          {otpError && <div className="error-text">{otpError}</div>}

          <button
            type="submit"
            className="proceed-btn"
            style={{ marginTop: 18, opacity: verified ? 1 : 0.7, cursor: verified ? "pointer" : "not-allowed" }}
            disabled={!verified}
          >
            Proceed
          </button>
        </form>
        <div className="register-row">
          <span>Already have an account?</span>{" "}
          <Link to="/login" className="register-link">LOGIN</Link>
        </div>
      </div>
    </div>
  );
}
