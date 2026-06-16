import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminDash.css';

function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get("${process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"}/api/admin/students", { withCredentials: true });
        setStudents(response.data.students);
      } catch (err) {
        console.error("Error fetching students:", err);
        setError("Failed to load student data.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

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

  const sortedAndFilteredStudents = React.useMemo(() => {
    let sortable = [...students];
    if (sortConfig.key) {
      sortable.sort((a, b) => {
        let aVal = a[sortConfig.key] || '';
        let bVal = b[sortConfig.key] || '';
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortable.filter(student => {
      const searchText = search.toLowerCase();
      return (
        (student.full_name || '').toLowerCase().includes(searchText) ||
        (student.roll_number || '').toLowerCase().includes(searchText)
      );
    });
  }, [students, search, sortConfig]);

  if (loading) {
    return <div className="loading">Loading students...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="student-management-container">
      <h1>Student Management</h1>
      <div style={{ marginBottom: 18, display: 'flex', gap: 16 }}>
        <input
          type="text"
          placeholder="Search by name or roll number..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search-input"
        />
      </div>
      {sortedAndFilteredStudents.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th onClick={() => requestSort('roll_number')} style={{ cursor: 'pointer' }}>
                Roll Number {renderSortArrow('roll_number')}
              </th>
              <th onClick={() => requestSort('full_name')} style={{ cursor: 'pointer' }}>
                Name {renderSortArrow('full_name')}
              </th>
              <th onClick={() => requestSort('course')} style={{ cursor: 'pointer' }}>
                Course {renderSortArrow('course')}
              </th>
              <th onClick={() => requestSort('branch')} style={{ cursor: 'pointer' }}>
                Branch {renderSortArrow('branch')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedAndFilteredStudents.map(student => (
              <tr key={student.id}>
                <td>{student.roll_number}</td>
                <td>{student.full_name}</td>
                <td>{student.course}</td>
                <td>{student.branch}</td>
                <td>
                  <button className="more-btn" onClick={() => navigate(`/admin/student-details/${student.id}`)}>More</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="no-data">No student records found.</div>
      )}
    </div>
  );
}

export default StudentManagement;
