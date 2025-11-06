import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminDash.css';
import { useNavigate } from 'react-router-dom';

function CertificateRequests() {
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/api/certificate/recent', { withCredentials: true })
      .then(res => setRequests(res.data))
      .catch(() => setRequests([]));
  }, []);

  return (
    <div className="dashboard">
      <h1>Certificate Requests</h1>
      <div style={{ overflowX: 'auto' }}>
        <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#2051a7', color: '#fff' }}>
              <th>Reference No</th>
              <th>Roll Number</th>
              <th>Name</th>
              <th>Certificate Type</th>
              <th>Requested Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '24px' }}>No certificate requests found.</td></tr>
            ) : (
              requests.map((req, idx) => (
                <tr key={req.reference_num || idx}>
                  <td>{req.reference_num || '-'}</td>
                  <td>{req.roll_number}</td>
                  <td>{req.full_name}</td>
                  <td>{req.certificate_type}</td>
                  <td>{new Date(req.requested_date).toLocaleString()}</td>
                  <td>{req.status}</td>
                  <td>
                    <button className="edit-btn" onClick={() => navigate(`/admin/request/${req.reference_num}`)}>Verify</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CertificateRequests;