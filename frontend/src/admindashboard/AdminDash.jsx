import React, { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import "./AdminDash.css";
import axios from "axios";
import CertificateRequests from "./CertificateRequests";
import IssuedCertificates from "./IssuedCertificates";
import StudentManagement from "./StudentManagement";
import ChangePassword from "./ChangePassword";
// CertificateTemplates removed per request

const MENU_ITEMS = [
  "Dashboard",
  "Certificate Requests",
  "Issued Certificates",
  "Student Management",
  "Change Password",
];

export default function AdminDashboard() {
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    verified: 0,
    rejected: 0,
  });
  const [activityData, setActivityData] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Fetch certificate stats
    axios.get("http://localhost:5000/api/certificate/stats", { withCredentials: true })
      .then(res => setStats(res.data))
      .catch(() => {});

    // Fetch recent activity (last 5-10 records)
    axios.get("http://localhost:5000/api/certificate/recent", { withCredentials: true })
      .then(res => setActivityData(res.data))
      .catch(() => {});
  }, []);

  // Set active menu based on current URL (so direct routes can open specific tab)
  useEffect(() => {
    if (location.pathname === '/admin' || location.pathname === '/admin/') {
      setActiveMenu('Dashboard');
    } else if (location.pathname.includes('certificate-requests')) {
      setActiveMenu('Certificate Requests');
    } else if (location.pathname.includes('issued-certificates')) {
      setActiveMenu('Issued Certificates');
    } else if (location.pathname.includes('student-management')) {
      setActiveMenu('Student Management');
    } else if (location.pathname.includes('change-password')) {
      setActiveMenu('Change Password');
    }
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      // Call backend logout to destroy session
      await fetch('http://localhost:5000/api/logout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      // Always clear local storage and redirect
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear browser history to prevent back button access
      window.history.pushState(null, null, '/login');
      window.history.forward();
      
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <div className="admin-menu" role="navigation" aria-label="Admin Navigation">
        <div className="menu-title">Admin Dashboard</div>
        <ul>
          {MENU_ITEMS.map((item) => (
            <li key={item}>
              <button
                className={activeMenu === item ? "active" : ""}
                onClick={() => {
                  if (item === "Dashboard") {
                    navigate('/admin');
                  } else if (item === "Change Password") {
                    navigate('/admin/change-password');
                  } else if (item === "Certificate Requests") {
                    navigate('/admin/certificate-requests');
                  } else if (item === "Issued Certificates") {
                    navigate('/admin/issued-certificates');
                  } else if (item === "Student Management") {
                    navigate('/admin/student-management');
                  } else {
                    setActiveMenu(item);
                  }
                }}
              >
                {item}
              </button>
            </li>
          ))}
          <li>
            <button className="logout" onClick={handleLogout}>Logout</button>
          </li>
        </ul>
      </div>

      {/* Main Dashboard Area */}
      <div className="admin-main" role="main">
        {activeMenu === "Dashboard" && (
          <div className="dashboard">
            <h1>Dashboard</h1>
            {/* Stats Row */}
            <div className="stats-row">
              <div className="stat-box">
                Total Certificates
                <span>{stats.total}</span>
              </div>
              <div className="stat-box pending">
                Pending Requests
                <span>{stats.pending}</span>
              </div>
              <div className="stat-box issued">
                Verified Certificates
                <span>{stats.verified}</span>
              </div>
              <div className="stat-box rejected">
                Rejected Requests
                <span>{stats.rejected}</span>
              </div>
            </div>

            {/* Recent Activity Table */}
            <div className="recent-activity">
              <h2>Recent Activity</h2>
              <table>
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Date</th>
                    <th>Roll Number</th>
                    <th>Name</th>
                    <th>Certificate</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activityData.length > 0 ? (
                    activityData.map((row, idx) => (
                      <tr key={row.serial_num || idx}>
                        <td>{idx + 1}</td>
                        <td>{new Date(row.requested_date).toLocaleDateString()}</td>
                        <td>{row.roll_number}</td>
                          <td>{row.full_name}</td>
                        <td>{row.certificate_type}</td>
                        <td>{row.status}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="no-data-cell">
                        No activity found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeMenu === "Certificate Requests" && <CertificateRequests />}
  {/* Request Details removed */}
        {activeMenu === "Issued Certificates" && <IssuedCertificates />}
  {/* Certificate Templates and QR Verification Logs removed */}
        {activeMenu === "Student Management" && <StudentManagement />}
        {activeMenu === "Change Password" && <ChangePassword />}
      </div>
    </div>
  );
}
