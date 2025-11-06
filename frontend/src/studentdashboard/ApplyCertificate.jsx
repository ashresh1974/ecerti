import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';

const certificateTypes = [
  "Bonafide Certificate",
  "Study Conduct Certificate",
  "Scholarship Bonafide Certificate"
];

function ApplyCertificate() {
  const { profile } = useOutletContext();
  const [type, setType] = useState('');
  const [parentName, setParentName] = useState('');
  const [duration, setDuration] = useState('');
  const [remark, setRemark] = useState('');
  const [loading, setLoading] = useState(false);

  // Use gender from user profile
  const getPrefix = () => profile.gender === 'male' ? 'Mr.' : 'Mrs.';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const applicationData = {
      certificate_type: type,
      full_name: profile.full_name,
      parent_name: `${getPrefix()} ${parentName}`,
      roll_number: profile.roll_number,
      course: profile.course,
      branch: profile.branch,
      duration: duration,
      remark: remark
    };

    try {
      const response = await axios.post("http://localhost:5000/api/certificate/apply", applicationData, { withCredentials: true });
      if (response.status === 201) {
        alert("Certificate application submitted successfully!");
        setType('');
        setParentName('');
        setDuration('');
        setRemark('');
      }
    } catch (error) {
      console.error("Error submitting certificate application:", error);
      alert(`Failed to submit application. Error: ${error.response ? error.response.data.message : error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="apply-cert-form">
      <h2>Apply Certificate</h2>
      <form onSubmit={handleSubmit}>
        <label>Certificate Type:</label>
        <select value={type} onChange={(e) => setType(e.target.value)} required>
          <option value="">Select Type</option>
          {certificateTypes.map(ct => (
            <option key={ct} value={ct}>{ct}</option>
          ))}
        </select>
        <label>Student Name:</label>
        <input type="text" value={profile.full_name} disabled />
        <label>Parent Name (S/o or D/o):</label>
        <input type="text" value={parentName} onChange={(e) => setParentName(e.target.value)} required />
        <label>Roll Number:</label>
        <input type="text" value={profile.roll_number} disabled />
        <label>Course:</label>
        <input type="text" value={profile.course} disabled />
        <label>Branch:</label>
        <input type="text" value={profile.branch} disabled />
        <label>Duration (e.g. 2022-2026):</label>
        <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)} required />
        <label>Remark (optional):</label>
        <input type="text" value={remark} onChange={(e) => setRemark(e.target.value)} />
        <button type="submit" disabled={loading}>{loading ? "Submitting..." : "Apply"}</button>
      </form>
    </div>
  );
}

export default ApplyCertificate;
