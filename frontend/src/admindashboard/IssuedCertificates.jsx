import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminDash.css';

function IssuedCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/api/certificate/issued', { withCredentials: true })
      .then(res => setCertificates(res.data))
      .catch(() => setCertificates([]));
  }, []);

  const sorted = React.useMemo(() => {
    let sortable = [...certificates];
    if (sortConfig.key) {
      sortable.sort((a, b) => {
        let aVal = a[sortConfig.key] || '';
        let bVal = b[sortConfig.key] || '';
        if (sortConfig.key === 'issued_date') {
          aVal = aVal ? new Date(aVal) : 0;
          bVal = bVal ? new Date(bVal) : 0;
        }
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortable.filter(cert => {
      const searchText = search.toLowerCase();
      return (
        (cert.full_name || '').toLowerCase().includes(searchText) ||
        (cert.roll_number || '').toLowerCase().includes(searchText) ||
        (cert.certificate_type || '').toLowerCase().includes(searchText) ||
        (cert.reference_num || '').toLowerCase().includes(searchText)
      );
    });
  }, [certificates, search, sortConfig]);

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
    <div className="dashboard requested-certificates">
      <h1>Issued Certificates</h1>
      <div style={{ marginBottom: 18, display: 'flex', gap: 16 }}>
        <input
          type="text"
          placeholder="Search by reference number, roll number, name, or type..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search-input"
        />
      </div>
      <table>
        <thead>
          <tr>
            <th onClick={() => requestSort('reference_num')} style={{ cursor: 'pointer' }}>
              Reference No {renderSortArrow('reference_num')}
            </th>
            <th onClick={() => requestSort('serial_num')} style={{ cursor: 'pointer' }}>
              Serial No {renderSortArrow('serial_num')}
            </th>
            <th onClick={() => requestSort('full_name')} style={{ cursor: 'pointer' }}>
              Name {renderSortArrow('full_name')}
            </th>
            <th onClick={() => requestSort('roll_number')} style={{ cursor: 'pointer' }}>
              Roll Number {renderSortArrow('roll_number')}
            </th>
            <th onClick={() => requestSort('certificate_type')} style={{ cursor: 'pointer' }}>
              Certificate Type {renderSortArrow('certificate_type')}
            </th>
            <th onClick={() => requestSort('issued_date')} style={{ cursor: 'pointer' }}>
              Issued Date {renderSortArrow('issued_date')}
            </th>
            <th>View</th>
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr><td colSpan={7} style={{ textAlign: 'center', padding: '24px' }}>No issued certificates found.</td></tr>
          ) : (
            sorted.map((cert, idx) => (
              <tr key={cert.reference_num || idx}>
                <td>{cert.reference_num}</td>
                <td>{cert.serial_num}</td>
                <td>{cert.full_name}</td>
                <td>{cert.roll_number}</td>
                <td>{cert.certificate_type}</td>
                <td>{cert.issued_date ? new Date(cert.issued_date).toLocaleString() : '-'}</td>
                <td><button onClick={() => navigate(`/certificate-view/${cert.reference_num}`)} className="edit-btn">View</button></td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default IssuedCertificates;
