import React, { useEffect, useState } from 'react';
import './StudDash.css';
import { FaRegFolderOpen } from 'react-icons/fa';  // for "No Records" icon

function CertificateStatus() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/certificates/student', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();

      if (response.ok) {
        setCertificates(data || []);
      } else {
        setCertificates([]);
      }
    } catch (error) {
      console.error('Error fetching certificates:', error);
      setCertificates([]);
    }
    setLoading(false);
  };

  return (
    <div className="dashboard">
      <h1>Certificate Application Status</h1>

      {loading ? (
        <p>Loading...</p>
      ) : certificates.length === 0 ? (
        <div className="no-records">
          <FaRegFolderOpen className="no-icon" />
          <p>No certificate applications found.</p>
        </div>
      ) : (
        <div className="status-table-container">
          <table className="status-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Reference No.</th>
                <th>Certificate Type</th>
                <th>Applied Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {certificates.map((cert, index) => (
                <tr key={cert.id}>
                  <td>{index + 1}</td>
                  <td>{cert.reference_num || '—'}</td>
                  <td>{cert.certificate_type}</td>
                  <td>{new Date(cert.requested_date).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${cert.status?.toLowerCase() || 'pending'}`}>
                      {cert.status || 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default CertificateStatus;
