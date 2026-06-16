import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import './VerifyQuickly.css';
import mguLogo from '../pages/MGU_LOGO.png';

function VerifyCertificate() {
  const { reference_num } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const verifyCertificate = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"}/api/certificate/verify/${reference_num}`
      );
      const data = await response.json();

      if (data.verified) {
        setCertificate(data.data);
        setError(null);
        // Log page view for analytics
        console.log(`[QR Verification] Certificate ${reference_num} verified and displayed`);
      } else {
        setError(data.message || 'Certificate not found or not verified');
        setCertificate(null);
      }
    } catch (err) {
      setError('Error verifying certificate: ' + err.message);
      setCertificate(null);
    } finally {
      setLoading(false);
    }
  }, [reference_num]);

  useEffect(() => {
    if (reference_num) {
      verifyCertificate();
    }
  }, [reference_num, verifyCertificate]);

  return (
    <div className="verify-container" style={{'--watermark-url': `url(${mguLogo})`}}>
      <div className="verify-card">
        <div className="verify-header">
          <h1 className="verify-title">✓ Certificate Verification</h1>
        </div>

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Verifying certificate...</p>
          </div>
        )}

        {error && (
          <div className="error-message">
            <span style={{ fontSize: '24px' }}>✗</span>
            <p>{error}</p>
          </div>
        )}

        {certificate && (
          <div className="certificate-details">
            <div className="verification-badge verified">
              <span className="badge-icon">✓</span>
              <span className="badge-text">VERIFIED</span>
            </div>


            <div className="detail-section">
              <h2>Certificate Information</h2>
              
              <div className="detail-grid">
                <div className="detail-row">
                  <span className="label">Certificate Type:</span>
                  <span className="value highlight">{certificate.certificate_type}</span>
                </div>
                
                <div className="detail-row">
                  <span className="label">Serial Number:</span>
                  <span className="value mono">{certificate.serial_num}</span>
                </div>
                
                <div className="detail-row">
                  <span className="label">Name:</span>
                  <span className="value">{certificate.full_name}</span>
                </div>
                
                <div className="detail-row">
                  <span className="label">Roll Number:</span>
                  <span className="value mono">{certificate.roll_number}</span>
                </div>

                {certificate.present_year && (
                  <div className="detail-row">
                    <span className="label">Present Year:</span>
                    <span className="value">{certificate.present_year}</span>
                  </div>
                )}
                
                <div className="detail-row">
                  <span className="label">Course & Branch:</span>
                  <span className="value">{certificate.course || 'N/A'} - {certificate.branch || 'N/A'}</span>
                </div>

                {certificate.duration && (
                  <div className="detail-row">
                    <span className="label">Duration:</span>
                    <span className="value">{certificate.duration}</span>
                  </div>
                )}
                
                <div className="detail-row">
                  <span className="label">Issue Date:</span>
                  <span className="value">
                    {new Date(certificate.issued_date).toLocaleDateString('en-IN')}
                  </span>
                </div>

                <div className="detail-row">
                  <span className="label">Issued By:</span>
                  <span className="value"><strong>UCE&T MGU Nalgonda</strong></span>
                </div>
              </div>
            </div>

            <div className="reference-section">
              <div className="reference-box">
                <label>Reference Number:</label>
                <code className="reference-code">{certificate.reference_num}</code>
              </div>
            </div>

            <div className="action-buttons">
              <button onClick={() => window.print()} className="btn btn-primary">
                🖨️ Print Details
              </button>
            </div>

            <div className="verification-footer">
              <p>This certificate has been verified through our secure verification system.</p>
              <p style={{ fontSize: '0.85em', color: '#999' }}>
                Verification Date: {new Date().toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyCertificate;
