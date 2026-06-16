import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './StudDash.css';
import { FaRegFolderOpen } from 'react-icons/fa';  // for "No Records" icon

function CertificateStatus() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });


  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const response = await fetch('${process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"}/api/certificate/student', {
        method: 'GET',
        credentials: 'include',
        headers: {
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
  const navigate = useNavigate();

  const handleReapply = (reference_num) => {
    // Open application form prefilled for this reference number so student can edit
    navigate(`/studentdashboard/apply-certificate?ref=${reference_num}`);
  };

  const sorted = React.useMemo(() => {
    let sortable = [...certificates];
    if (sortConfig.key) {
      sortable.sort((a, b) => {
        let aVal = a[sortConfig.key] || '';
        let bVal = b[sortConfig.key] || '';
        if (sortConfig.key === 'requested_date') {
          aVal = aVal ? new Date(aVal) : 0;
          bVal = bVal ? new Date(bVal) : 0;
        }
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [certificates, sortConfig]);

  const requestSort = key => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const renderSortArrow = key => {
    if (sortConfig.key !== key) return <span style={{ fontSize: '0.9em', marginLeft: 4 }}>▲▼</span>;
    return sortConfig.direction === 'asc'
      ? <span style={{ fontSize: '0.9em', marginLeft: 4 }}>▲</span>
      : <span style={{ fontSize: '0.9em', marginLeft: 4 }}>▼</span>;
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
                <th onClick={() => requestSort('certificate_type')} style={{ cursor: 'pointer' }}>
                  Certificate Type {renderSortArrow('certificate_type')}
                </th>
                <th onClick={() => requestSort('requested_date')} style={{ cursor: 'pointer' }}>
                  Applied Date {renderSortArrow('requested_date')}
                </th>
                <th onClick={() => requestSort('status')} style={{ cursor: 'pointer' }}>
                  Status {renderSortArrow('status')}
                </th>
                <th onClick={() => requestSort('issued_date')} style={{ cursor: 'pointer' }}>
                  Issued Date {renderSortArrow('issued_date')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((cert, index) => (
                <React.Fragment key={cert.id}>
                  <tr>
                    <td>{index + 1}</td>
                    <td>{cert.reference_num || '—'}</td>
                    <td>{cert.certificate_type}</td>
                    <td>{new Date(cert.requested_date).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${cert.status?.toLowerCase() || 'pending'}`}>
                        {cert.status || 'Pending'}
                      </span>
                    </td>
                    <td>{cert.issued_date ? new Date(cert.issued_date).toLocaleDateString() : '—'}</td>
                  </tr>
                  {cert.status === 'rejected' && cert.remark && (
                    <tr className="rejection-reason-row">
                      <td colSpan="6">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="rejection-note">Note: Rejected because of {cert.remark}</span>
                          <button className="reapply-button" onClick={() => handleReapply(cert.reference_num)}>Reapply</button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default CertificateStatus;
