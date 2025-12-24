import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminDash.css';

const REJECT_REASONS = [
  'Invalid Details',
  'Duplicate request',
  'Other'
];

function RequestDetails() {
  const { reference_num } = useParams();
  const [details, setDetails] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [rejectError, setRejectError] = useState('');
  const navigate = useNavigate();

  const fetchDetails = useCallback(() => {
    axios.get(`http://localhost:5000/api/certificate/details/${reference_num}`, { withCredentials: true })
      .then(res => {
        console.log('Details received:', res.data);
        setDetails(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching details:', err);
        setDetails(null);
        setLoading(false);
      });
  }, [reference_num]);

  const fetchTemplates = useCallback(() => {
    axios.get('http://localhost:5000/api/templates/', { withCredentials: true })
      .then(res => {
        const list = Array.isArray(res.data) ? res.data : res.data.data || [];
        setTemplates(list);
      })
      .catch(err => {
        console.error('Error loading templates:', err);
        setTemplates([]);
      });
  }, []);

  useEffect(() => {
    fetchDetails();
    fetchTemplates();
  }, [reference_num, fetchDetails, fetchTemplates]);

  // When both details and templates are loaded, pick the appropriate template
  useEffect(() => {
    if (!details || templates.length === 0) return;

    const type = (details.certificate_type || '').toLowerCase();

    // Prefer a template that matches scholarship, conduct, or bonafide keywords
    let match = null;
    if (type.includes('scholar')) {
      match = templates.find(t => (t.certificate_type || '').toLowerCase().includes('scholar'));
    }
    if (!match && type.includes('conduct')) {
      match = templates.find(t => (t.certificate_type || '').toLowerCase().includes('conduct'));
    }
    if (!match && (type.includes('bonafide') || type.includes('bonafide certificate') || type.includes('bonafide'))) {
      match = templates.find(t => (t.certificate_type || '').toLowerCase().includes('bonafide'));
    }

    // Fallback to first template if nothing matched
    if (!match) match = templates[0];

    if (match) setSelectedTemplate(match.id);
  }, [details, templates]);

  const handleApprove = async () => {
    if (!window.confirm('Are you sure you want to approve this certificate? A PDF will be generated.')) {
      return;
    }
    
    setApproving(true);
    try {
      await axios.post(
        `http://localhost:5000/api/certificate/approve/${reference_num}`,
        { template_id: selectedTemplate },
        { withCredentials: true }
      );
      alert('Certificate approved! PDF has been generated.');
      navigate('/admin/certificate-requests');
    } catch (error) {
      alert('Error approving certificate: ' + (error.response?.data?.message || error.message));
      setApproving(false);
    }
  };

  const handleReject = async () => {
    // Validate that a reason is selected
    if (!rejectReason) {
      setRejectError('Please select a rejection reason');
      return;
    }

    // Validate custom reason if "Other" is selected
    if (rejectReason === 'Other' && !customReason.trim()) {
      setRejectError('Please provide a custom rejection reason');
      return;
    }

    if (!window.confirm('Are you sure you want to reject this certificate?')) {
      return;
    }
    
    setRejecting(true);
    setRejectError('');
    try {
      const finalReason = rejectReason === 'Other' ? customReason : rejectReason;
      await axios.post(`http://localhost:5000/api/certificate/reject/${reference_num}`, { remark: finalReason }, { withCredentials: true });
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
      
      {/* Certificate Details Section */}
      <div className="details-section">
        <h2 className="details-section-title">📜 Certificate Details</h2>
        <div className="details-grid">
          <div className="detail-item">
            <label>Reference No:</label>
            <span>{details.reference_num}</span>
          </div>
          <div className="detail-item">
            <label>Serial No:</label>
            <span>{details.serial_num}</span>
          </div>
          <div className="detail-item">
            <label>Certificate Type:</label>
            <span>{details.certificate_type}</span>
          </div>
          <div className="detail-item">
            <label>Requested Date:</label>
            <span>{new Date(details.requested_date).toLocaleString()}</span>
          </div>
          <div className="detail-item">
            <label>Duration:</label>
            <span>{details.duration || '-'}</span>
          </div>
          <div className="detail-item">
            <label>Remark:</label>
            <span>{details.remark || '-'}</span>
          </div>
          {details.status === 'rejected' && details.remark && (
            <div className="detail-item full-width">
              <span className="note-reject">📌 Note: {details.remark}</span>
            </div>
          )}
        </div>
      </div>

      {/* Student Details Section */}
      <div className="details-section">
        <h2 className="details-section-title">👤 Student Details</h2>
        <div className="details-grid">
          <div className="detail-item">
            <label>Name:</label>
            <span>{details.full_name}</span>
          </div>
          <div className="detail-item">
            <label>Roll Number:</label>
            <span>{details.roll_number}</span>
          </div>
          <div className="detail-item">
            <label>Course:</label>
            <span>{details.course || '-'}</span>
          </div>
          <div className="detail-item">
            <label>Parent Name:</label>
            <span>{details.parent_name || '-'}</span>
          </div>
          <div className="detail-item">
            <label>Present Year:</label>
            <span>{details.present_year || '-'}</span>
          </div>
          <div className="detail-item">
            <label>Mobile Number:</label>
            <span>{details.phone_number || '-'}</span>
          </div>
        </div>
      </div>

      {details.previousApplications && details.previousApplications.length > 0 && (
        <div className="details-section">
          <div className="detail-item full-width">
            <span className="note-duplicate">
              This certificate has been applied {details.previousApplications.length} time(s) previously:
              {details.previousApplications.map((app, idx) => (
                <span key={app.reference_num}>
                  {idx > 0 ? ', ' : ' '}Ref {app.reference_num} on {new Date(app.requested_date).toLocaleDateString()}
                </span>
              ))}
            </span>
          </div>
        </div>
      )}

      {/* Actions Section */}
      <div className="actions-section">
        <button 
          className="back-button"
          onClick={() => navigate(-1)}
          style={{ padding: "6px 12px", fontSize: "14px", width: "auto" }}
        >
          ← Back
        </button>
        
        {rejectError && (
          <div className="reject-error-message">
            ⚠️ {rejectError}
          </div>
        )}
        
        <div className="reject-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            className="reject-dropdown"
            value={rejectReason} 
            onChange={e => {
              setRejectReason(e.target.value);
              setRejectError('');
            }}
            disabled={rejecting || details.status === 'verified'}
          >
            <option value="">-- Select reason to reject --</option>
            {REJECT_REASONS.map((reason) => (
              <option key={reason} value={reason}>{reason === 'Other' ? 'Type reason here' : reason}</option>
            ))}
          </select>

          {rejectReason === 'Other' && (
            <input 
              type="text"
              className="reject-message"
              placeholder="Type reason..."
              value={customReason}
              onChange={e => setCustomReason(e.target.value)}
              disabled={rejecting || details.status === 'verified'}
              style={{ flex: 1 }}
            />
          )}

          <button 
            className="cancel-btn" 
            onClick={handleReject}
            disabled={rejecting || details.status === 'verified' || !rejectReason || (rejectReason === 'Other' && !customReason)}
          >
            {rejecting ? 'Processing...' : '✗ Reject'}
          </button>
        </div>

        <button 
          className="save-btn" 
          onClick={handleApprove}
          disabled={approving || details.status === 'verified'}
        >
          {approving ? 'Processing...' : '✓ Approve & Generate PDF'}
        </button>
      </div>

      {details.status === 'verified' && details.pdf_path && (
        <div className="view-certificate">
          <button className="edit-btn" onClick={() => window.open(`/certificates/${details.pdf_path}`, '_blank')}>View Certificate</button>
        </div>
      )}
    </div>
  );
}

export default RequestDetails;
