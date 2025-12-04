import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import './StudDash.css';

function DownloadCertificates() {
  const { profile: _profile } = useOutletContext();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVerifiedCertificates();
  }, []);

  const fetchVerifiedCertificates = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/certificate/student', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();

      if (response.ok) {
        // Filter only verified/issued certificates
        const verifiedCerts = data.filter(cert => cert.status === 'verified');
        setCertificates(verifiedCerts);
      } else {
        setCertificates([]);
      }
    } catch (error) {
      console.error('Error fetching certificates:', error);
      setCertificates([]);
    }
    setLoading(false);
  };

  const handleView = (cert) => {
    if (!cert.pdf_path) {
      return alert('Certificate PDF not available yet.');
    }
    // Open the stored PDF served by the backend's static files route
    const openUrl = `/certificates/${cert.pdf_path}`;
    window.open(openUrl, '_blank');
  };

  if (loading) {
    return <section className="dashboard"><h1>Loading...</h1></section>;
  }

  return (
    <section className="dashboard">
      <h1>📄 View Certificates</h1>
      
      {certificates.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          background: '#f5f5f5',
          borderRadius: '8px',
          marginTop: '20px'
        }}>
          <h3 style={{ color: '#666', marginBottom: '10px' }}>No Verified Certificates Yet</h3>
          <p style={{ color: '#999' }}>Your certificates will appear here once approved by the admin.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', marginTop: '20px' }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <thead>
              <tr style={{ background: '#2051a7', color: '#fff' }}>
                <th style={{ padding: '15px', textAlign: 'left' }}>Reference No</th>
                <th style={{ padding: '15px', textAlign: 'left' }}>Serial No</th>
                <th style={{ padding: '15px', textAlign: 'left' }}>Certificate Type</th>
                <th style={{ padding: '15px', textAlign: 'left' }}>Issued Date</th>
                <th style={{ padding: '15px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {certificates.map((cert, idx) => (
                <tr 
                  key={cert.reference_num || idx} 
                  style={{ 
                    borderBottom: '1px solid #e0e0e0',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                >
                  <td style={{ padding: '15px' }}>
                    <strong>{cert.reference_num}</strong>
                  </td>
                  <td style={{ padding: '15px' }}>
                    {cert.serial_num}
                  </td>
                  <td style={{ padding: '15px' }}>
                    {cert.certificate_type}
                  </td>
                  <td style={{ padding: '15px' }}>
                    {new Date(cert.issued_date).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleView(cert)}
                      disabled={!cert.pdf_path}
                      style={{
                        padding: '10px 20px',
                        background: '#2051a7',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: !cert.pdf_path ? 'not-allowed' : 'pointer',
                        opacity: !cert.pdf_path ? 0.7 : 1,
                        transition: 'all 0.2s',
                        fontWeight: '500'
                      }}
                      onMouseEnter={(e) => cert.pdf_path && (e.currentTarget.style.background = '#0d2c6f')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#2051a7')}
                    >
                      { !cert.pdf_path ? 'Unavailable' : '👁️ View' }
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default DownloadCertificates;
