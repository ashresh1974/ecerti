import React, { useState, useEffect } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const certificateTypes = [
  "Bonafide Certificate",
  "Study Conduct Certificate",
  "Scholarship Bonafide Certificate"
];

function ApplyCertificate() {
  const { profile } = useOutletContext();
  const [searchParams] = useSearchParams();
  const referenceNum = searchParams.get('ref');
  const [type, setType] = useState('');
  const [prefix, setPrefix] = useState('Mr.');
  const [parentName, setParentName] = useState('');
  const [duration, setDuration] = useState('');
  const [presentYear, setPresentYear] = useState('');
  const [remark, setRemark] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Use gender from user profile
    const getPrefix = () => {
      if (!profile || !profile.gender) return 'Mr.';
      const g = String(profile.gender).toLowerCase();
      return g === 'female' ? 'Mrs.' : 'Mr.';
    };
    setPrefix(getPrefix());
  }, [profile]);

  // If opened for re-application, fetch existing application details and prefill
  useEffect(() => {
    const fetchExisting = async () => {
      if (!referenceNum) return;
      try {
        const res = await fetch(`http://10.55.47.47:5000/api/certificate/details/${referenceNum}`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) return;
        const data = await res.json();
        // Fill form fields from certificate details
        setType(data.certificate_type || '');
        setParentName(data.parent_name || '');
        setDuration(data.duration || '');
        setPresentYear(data.present_year || '');
        setRemark(data.remark || '');
      } catch (err) {
        console.error('Failed to fetch existing application:', err);
      }
    };
    fetchExisting();
  }, [referenceNum]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const applicationData = {
      certificate_type: type,
      full_name: profile.full_name,
      parent_prefix: prefix,
      parent_name: parentName,
      roll_number: profile.roll_number,
      course: profile.course,
      branch: profile.branch,
      duration: duration,
      present_year: presentYear,
      remark: remark
    };

    try {
      if (referenceNum) {
        // Re-apply (update existing application and set to pending)
        const response = await axios.post(`http://10.55.47.47:5000/api/certificate/reapply/${referenceNum}`, applicationData, { withCredentials: true });
        if (response.status === 200) {
          alert('Re-application submitted; status set to pending.');
          // redirect back to status page
          window.location.href = '/studentdashboard/certificate-status';
        }
      } else {
        const response = await axios.post("http://10.55.47.47:5000/api/certificate/apply", applicationData, { withCredentials: true });
        if (response.status === 201) {
          alert("Certificate application submitted successfully!");
          setType('');
          setParentName('');
          setDuration('');
          setPresentYear('');
          setRemark('');
        }
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
        <div>
          <label>Certificate Type:</label>
          <select value={type} onChange={(e) => setType(e.target.value)} required>
            <option value="">Select Type</option>
            {certificateTypes.map(ct => (
              <option key={ct} value={ct}>{ct}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Student Name:</label>
          <input type="text" value={profile.full_name} disabled />
        </div>
        <div>
          <label>Parent Name (Please enter full name):</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select value={prefix || 'Mr.'} onChange={(e) => setPrefix(e.target.value)} style={{ flex: '0 0 20%' }}>
              <option value="Mr.">Mr.</option>
              <option value="Mrs.">Mrs.</option>
            </select>
            <input type="text" value={parentName} onChange={(e) => setParentName(e.target.value)} required style={{ flex: 1 }} />
          </div>
        </div>
        <div>
          <label>Roll Number:</label>
          <input type="text" value={profile.roll_number} disabled />
        </div>
        <div>
          <label>Course:</label>
          <input type="text" value={profile.course} disabled />
        </div>
        <div>
          <label>Branch:</label>
          <input type="text" value={profile.branch} disabled />
        </div>
        <div>
          <label>Duration (e.g. 2022-2026):</label>
          <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)} required />
        </div>
        <div>
          <label>Present Studying Year:</label>
          <select value={presentYear} onChange={(e) => setPresentYear(e.target.value)} required>
            <option value="">Select Year</option>
            <option value="I">I Year</option>
            <option value="II">II Year</option>
            <option value="III">III Year</option>
            <option value="IV">IV Year</option>
          </select>
        </div>
        <div>
          <label>Remark (optional):</label>
          <input type="text" value={remark} onChange={(e) => setRemark(e.target.value)} />
        </div>
        <button type="submit" disabled={loading}>{loading ? "Submitting..." : "Apply"}</button>
      </form>
    </div>
  );
}

export default ApplyCertificate;
