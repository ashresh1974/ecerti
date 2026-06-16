import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import './AdminDash.css';
import { useNavigate } from 'react-router-dom';

function CertificateRequests() {
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const fetchRequests = useCallback(() => {
    axios.get('${process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"}/api/certificate/recent', { withCredentials: true })
      .then(res => setRequests(res.data))
      .catch(err => {
        console.error('Error fetching certificate requests:', err);
        setRequests([]);
      });
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const filteredRequests = requests.filter(req => {
    const searchText = search.toLowerCase();
    return (
      (req.reference_num || '').toLowerCase().includes(searchText) ||
      (req.roll_number || '').toLowerCase().includes(searchText) ||
      (req.certificate_type || '').toLowerCase().includes(searchText) ||
      (req.full_name || '').toLowerCase().includes(searchText)
    );
  });

  return (
    <div className="dashboard">
      <h1>Certificate Requests</h1>
      <div style={{ marginBottom: 18, display: 'flex', gap: 16 }}>
        <input
          type="text"
          placeholder="Search by reference number, roll number, type, or name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search-input"
        />
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
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
            {filteredRequests.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '24px' }}>No certificate requests found.</td></tr>
            ) : (
              filteredRequests.map((req, idx) => (
                <tr key={req.reference_num || idx}>
                  <td>{req.reference_num || '-'}</td>
                  <td>{req.roll_number}</td>
                  <td>{req.full_name}</td>
                  <td>{req.certificate_type}</td>
                  <td>{new Date(req.requested_date).toLocaleString()}</td>
                  <td>{req.status}</td>
                  <td>
                    {req.status === 'verified' ? (
                      req.pdf_path ? (
                        <button
                          className="edit-btn"
                          onClick={() => window.open(`${process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"}/certificates/${req.reference_num}.pdf`, '_blank')}
                        >
                          View
                        </button>
                      ) : (
                        <button className="edit-btn" disabled>Unavailable</button>
                      )
                    ) : req.status === 'rejected' ? (
                      <div className="rejected-action">
                        <span className="rejected-label">❌ Rejected</span>
                        {req.remark && (
                          <span className="rejection-reason">Reason: {req.remark}</span>
                        )}
                      </div>
                    ) : (
                      <button className="edit-btn" onClick={() => navigate(`/admin/request/${req.reference_num}`)}>Verify</button>
                    )}
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
