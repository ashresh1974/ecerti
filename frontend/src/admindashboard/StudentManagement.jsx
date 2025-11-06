import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminDash.css';

function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/admin/students", { withCredentials: true });
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

  if (loading) {
    return <div className="loading">Loading students...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="student-management-container">
      <h1>Student Management</h1>
      {students.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Roll Number</th>
              <th>Name</th>
              <th>Course</th>
              <th>Branch</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
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