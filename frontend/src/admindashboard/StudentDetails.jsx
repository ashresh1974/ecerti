import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminDash.css'; // Assuming shared CSS

function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const response = await axios.get(`http://10.55.47.47:5000/api/admin/student/${id}`, { withCredentials: true });
        setStudent(response.data.student);
      } catch (err) {
        console.error("Error fetching student details:", err);
        setError("Failed to load student details.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDetails();
  }, [id]);

  if (loading) {
    return <div className="loading">Loading student details...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!student) {
    return <div className="no-data">No student found.</div>;
  }

  return (
    <div className="student-details-container">
      <h2>Student Details</h2>
      <div className="details-card">
        <p><strong>Full Name:</strong> {student.full_name}</p>
        <p><strong>Username:</strong> {student.username}</p>
        <p><strong>Roll Number:</strong> {student.roll_number}</p>
        <p><strong>Phone Number:</strong> {student.phone_number}</p>
        <p><strong>Course:</strong> {student.course}</p>
        <p><strong>Branch:</strong> {student.branch}</p>
        <p><strong>Gender:</strong> {student.gender}</p>
        <p><strong>Email ID:</strong> {student.email_id}</p>
        {/* Add other details as needed, excluding password and id */}
      </div>
      <button className="back-button" onClick={() => navigate(-1)} style={{ padding: "6px 12px", fontSize: "14px", width: "auto" }}>Back</button>
    </div>
  );
}

export default StudentDetails;
