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
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`http://localhost:5000/api/certificate/details/${reference_num}`, { withCredentials: true })
      .then(res => setDetails(res.data))
      .catch(() => setDetails(null));
  }, [reference_num]);

  const handleApprove = async () => {
    await axios.post(`http://localhost:5000/api/certificate/approve/${reference_num}`, {}, { withCredentials: true });
    alert('Certificate approved!');
    navigate('/admin/certificate-requests');
  };

  const handleReject = async () => {
    await axios.post(`http://localhost:5000/api/certificate/reject/${reference_num}`, { remark: rejectReason }, { withCredentials: true });
    alert('Certificate rejected!');
    navigate('/admin/certificate-requests');
  };

  const handleGeneratePDF = () => {
    // Placeholder for PDF generation logic
    alert('PDF generated (demo)');
  };

  if (!details) {
    return <div className="dashboard"><h2>Loading details...</h2></div>;
  }

  return (
    <div className="dashboard">
      <h1>Student Application Details</h1>
      <div className="stud-card" style={{ maxWidth: 600 }}>
        <div className="stud-field"><label>Reference No:</label> {details.reference_num}</div>
        <div className="stud-field"><label>Serial No:</label> {details.serial_num}</div>
        <div className="stud-field"><label>Name:</label> {details.student_name}</div>
        <div className="stud-field"><label>Parent Name:</label> {details.parent_name}</div>
        <div className="stud-field"><label>Roll Number:</label> {details.roll_number}</div>
        <div className="stud-field"><label>Course:</label> {details.course}</div>
        <div className="stud-field"><label>Branch:</label> {details.branch}</div>
        <div className="stud-field"><label>Duration:</label> {details.duration}</div>
        <div className="stud-field"><label>Certificate Type:</label> {details.certificate_type}</div>
        <div className="stud-field"><label>Requested Date:</label> {new Date(details.requested_date).toLocaleString()}</div>
        <div className="stud-field"><label>Status:</label> {details.status}</div>
        <div className="stud-field"><label>Remark:</label> {details.remark || '-'}</div>
      </div>
      <div className="profile-actions">
        <button className="edit-btn" onClick={handleGeneratePDF}>Generate PDF</button>
        <button className="save-btn" onClick={handleApprove}>Approve</button>
        <select value={rejectReason} onChange={e => setRejectReason(e.target.value)} style={{ marginLeft: 10 }}>
          {REJECT_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <button className="cancel-btn" onClick={handleReject}>Reject</button>
      </div>
    </div>
  );
}

export default RequestDetails;