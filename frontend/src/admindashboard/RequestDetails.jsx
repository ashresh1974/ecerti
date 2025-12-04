import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminDash.css';

const REJECT_REASONS = [
  'Incomplete documents',
  'Invalid details',
  'Duplicate request',
  'Other'
];

function RequestDetails() {
  const { reference_num } = useParams();
  const [details, setDetails] = useState(null);
  const [rejectReason, setRejectReason] = useState(REJECT_REASONS[0]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`http://localhost:5000/api/certificate/details/${reference_num}`, { withCredentials: true })
      .then(res => {
        setDetails(res.data);
        setLoading(false);
      })
      .catch(() => {
        setDetails(null);
        setLoading(false);
      });
  }, [reference_num]);

  const handleApprove = async () => {
    if (!window.confirm('Are you sure you want to approve this certificate? A PDF will be generated.')) {
      return;
    }
    
    setApproving(true);
    try {
      await axios.post(`http://localhost:5000/api/certificate/approve/${reference_num}`, {}, { withCredentials: true });
      alert('Certificate approved! PDF has been generated.');
      navigate('/admin/certificate-requests');
    } catch (error) {
      alert('Error approving certificate: ' + (error.response?.data?.message || error.message));
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (!window.confirm('Are you sure you want to reject this certificate?')) {
      return;
    }
    
    setRejecting(true);
    try {
      await axios.post(`http://localhost:5000/api/certificate/reject/${reference_num}`, { remark: rejectReason }, { withCredentials: true });
      alert('Certificate rejected!');
      navigate('/admin/certificate-requests');
    } catch (error) {
      alert('Error rejecting certificate: ' + (error.response?.data?.message || error.message));
      setRejecting(false);
    }
  };

  if (loading) {
    return <div className="dashboard"><h2>Loading details...</h2></div>;
  }

  if (!details) {
    return <div className="dashboard"><h2>Certificate not found</h2></div>;
  }

  return (
    <div className="dashboard">
      <h1>Certificate Verification</h1>
      
      {/* Certificate Details */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#2051a7', marginBottom: '15px' }}>📜 Certificate Details</h2>
        <div className="stud-card" style={{ maxWidth: '100%', background: '#f9f9f9', border: '1px solid #e0e0e0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="stud-field">
              <label>Reference No:</label>
              <strong>{details.reference_num}</strong>
            </div>
            <div className="stud-field">
              <label>Serial No:</label>
              <strong>{details.serial_num}</strong>
            </div>
            <div className="stud-field">
              <label>Certificate Type:</label>
              <strong>{details.certificate_type}</strong>
            </div>
            <div className="stud-field">
              <label>Status:</label>
              <strong style={{ color: details.status === 'pending' ? '#ff9800' : details.status === 'verified' ? '#4caf50' : '#f44336' }}>
                {details.status?.toUpperCase()}
              </strong>
            </div>
            <div className="stud-field">
              <label>Requested Date:</label>
              <strong>{new Date(details.requested_date).toLocaleString()}</strong>
            </div>
            {details.issued_date && (
              <div className="stud-field">
                <label>Issued Date:</label>
                <strong>{new Date(details.issued_date).toLocaleString()}</strong>
              </div>
            )}
            <div className="stud-field">
              <label>Duration:</label>
              <strong>{details.duration || '-'}</strong>
            </div>
            <div className="stud-field">
              <label>Remark:</label>
              <strong>{details.remark || '-'}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Student Details */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#2051a7', marginBottom: '15px' }}>👤 Student Details</h2>
        <div className="stud-card" style={{ maxWidth: '100%', background: '#f9f9f9', border: '1px solid #e0e0e0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="stud-field">
              <label>Name:</label>
              <strong>{details.full_name}</strong>
            </div>
            <div className="stud-field">
              <label>Roll Number:</label>
              <strong>{details.roll_number}</strong>
            </div>
            <div className="stud-field">
              <label>Course:</label>
              <strong>{details.course || '-'}</strong>
            </div>
            <div className="stud-field">
              <label>Branch:</label>
              <strong>{details.branch || '-'}</strong>
            </div>
            <div className="stud-field">
              <label>Parent Name:</label>
              <strong>{details.parent_name || '-'}</strong>
            </div>
            <div className="stud-field">
              <label>QR Code:</label>
              <strong style={{ wordBreak: 'break-all', fontSize: '0.9em' }}>{details.qr_code?.substring(0, 20)}...</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="profile-actions" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '30px' }}>
        <button 
          className="save-btn" 
          onClick={handleApprove}
          disabled={approving || details.status === 'verified'}
          style={{ 
            opacity: approving || details.status === 'verified' ? 0.6 : 1,
            cursor: approving || details.status === 'verified' ? 'not-allowed' : 'pointer'
          }}
        >
          {approving ? 'Processing...' : '✓ Approve & Generate PDF'}
        </button>
        
        <select 
          value={rejectReason} 
          onChange={e => setRejectReason(e.target.value)}
          style={{ 
            padding: '10px 15px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            background: '#fff',
            cursor: 'pointer'
          }}
          disabled={rejecting || details.status === 'verified'}
        >
          {REJECT_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>

        <button 
          className="cancel-btn" 
          onClick={handleReject}
          disabled={rejecting || details.status === 'verified'}
          style={{ 
            opacity: rejecting || details.status === 'verified' ? 0.6 : 1,
            cursor: rejecting || details.status === 'verified' ? 'not-allowed' : 'pointer'
          }}
        >
          {rejecting ? 'Processing...' : '✗ Reject'}
        </button>

        <button 
          className="edit-btn"
          onClick={() => navigate(-1)}
          style={{ marginLeft: 'auto' }}
        >
          ← Back
        </button>
      </div>
    </div>
  );
}

export default RequestDetails;