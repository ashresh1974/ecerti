import React, { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import "./AdminDash.css";
import axios from "axios";
import CertificateRequests from "./CertificateRequests";
import IssuedCertificates from "./IssuedCertificates";
import StudentManagement from "./StudentManagement";
import CertificateTemplates from "./CertificateTemplates";

const MENU_ITEMS = [
  "Dashboard",
  "Certificate Requests",
  "Issued Certificates",
  "Certificate Templates",
  "Student Management",
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
    if (location.pathname.includes('certificate-requests')) {
      setActiveMenu('Certificate Requests');
    } else if (location.pathname.includes('issued')) {
      setActiveMenu('Issued Certificates');
    } else if (location.pathname.includes('templates')) {
      setActiveMenu('Certificate Templates');
    } else if (location.pathname.includes('student-details')) {
      setActiveMenu('Student Management');
    } else if (location.pathname === '/admin' || location.pathname === '/admin/') {
      setActiveMenu('Dashboard');
    }
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);
      // Even if logout fails on server, clear local storage and redirect for UX
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/login");
    }
  };

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <div className="admin-menu">
        <div className="menu-title">Admin Dashboard</div>
        <ul>
          {MENU_ITEMS.map((item) => (
            <li
              key={item}
              className={activeMenu === item ? "active" : ""}
              onClick={() => setActiveMenu(item)}
            >
              {item}
            </li>
          ))}
          <li className="logout" onClick={handleLogout}>Logout</li>
        </ul>
      </div>

      {/* Main Dashboard Area */}
      <div className="admin-main">
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
                      <td colSpan={6} style={{ textAlign: 'center', color: '#ccc' }}>
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
        {activeMenu === "Certificate Templates" && <CertificateTemplates />}
  {/* Certificate Templates and QR Verification Logs removed */}
        {activeMenu === "Student Management" && <StudentManagement />}
      </div>
    </div>
  );
}
