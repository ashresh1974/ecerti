import React, { useState } from 'react';
import './AdminDash.css';

function AdminDash() {
  const [activeMenu, setActiveMenu] = useState('dashboard');

  // Example dummy data for dashboard boxes:
  const certificateStats = {
    total: 200,
    issued: 130,
    pending: 50,
    rejected: 20,
  };
  // Example dummy data for recent activities:
  const activities = [
    "Issued Conduct Certificate to Ramesh.",
    "Rejected Provisional Certificate for Suresh.",
    "Student Geeta requested a Conduct Certificate.",
    "Updated email for student Arun.",
    "Issued Provisional Certificate to Swapna."
  ];
  // Example dummy data for requested certificates:
  const requests = [
    { name: "Rahul", type: "Conduct Certificate", date: "2025-10-13", status: "Pending" },
    { name: "Priya", type: "Provisional Certificate", date: "2025-10-14", status: "Pending" }
  ];
  // Example dummy students:
  const students = [
    { name: "Ravi", roll: "123456789012", email: "ravi@mail.com", branch: "CSE" },
    { name: "Priya", roll: "123456789011", email: "priya@mail.com", branch: "ECE" }
  ];

  const handleMenuClick = (menu) => setActiveMenu(menu);

  const handleLogout = () => {
    // Clear session, redirect, etc.
    window.location.href = '/login';
  };

  return (
    <div className="admin-container">
      <aside className="admin-menu">
        <h2 className="menu-title">Admin Menu</h2>
        <ul>
          <li className={activeMenu === "dashboard" ? "active" : ""} onClick={() => handleMenuClick("dashboard")}>Dashboard</li>
          <li className={activeMenu === "requested" ? "active" : ""} onClick={() => handleMenuClick("requested")}>Requested Certificates</li>
          <li className={activeMenu === "students" ? "active" : ""} onClick={() => handleMenuClick("students")}>Manage Students</li>
          <li className="logout" onClick={handleLogout}>Logout</li>
        </ul>
      </aside>
      <main className="admin-main">
        {activeMenu === "dashboard" && (
          <section className="dashboard">
            <h1>Dashboard</h1>
            <div className="stats-row">
              <div className="stat-box total">Total Certificates <span>{certificateStats.total}</span></div>
              <div className="stat-box issued">Issued <span>{certificateStats.issued}</span></div>
              <div className="stat-box pending">Pending <span>{certificateStats.pending}</span></div>
              <div className="stat-box rejected">Rejected <span>{certificateStats.rejected}</span></div>
            </div>
            <div className="recent-activity">
              <h2>Recent Activities</h2>
              <ul>
                {activities.map((act, idx) => <li key={idx}>{act}</li>)}
              </ul>
            </div>
          </section>
        )}
        {activeMenu === "requested" && (
          <section className="requested-certificates">
            <h1>Requested Certificates</h1>
            <table>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Certificate Type</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req, idx) =>
                  <tr key={idx}>
                    <td>{req.name}</td>
                    <td>{req.type}</td>
                    <td>{req.date}</td>
                    <td>{req.status}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        )}
        {activeMenu === "students" && (
          <section className="student-list">
            <h1>Manage Students</h1>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Roll</th>
                  <th>Email</th>
                  <th>Branch</th>
                </tr>
              </thead>
              <tbody>
                {students.map((stu, idx) =>
                  <tr key={idx}>
                    <td>{stu.name}</td>
                    <td>{stu.roll}</td>
                    <td>{stu.email}</td>
                    <td>{stu.branch}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        )}
      </main>
    </div>
  );
}

export default AdminDash;
