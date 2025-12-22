import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import './StudDash.css';

const courseOptions = ['B.Tech', 'MCA'];
const branchOptions = ['CSE', 'ECE', 'EEE', 'MCA'];
const genderOptions = ['Male', 'Female', 'Other'];

function StudentProfile() {
  const { profile, setProfile } = useOutletContext();
  const [editMode, setEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);

  useEffect(() => {
    setEditedProfile(profile);
  }, [profile]);

  const handleEdit = () => {
    setEditMode(true);
    setEditedProfile(profile);
  };

  const handleChange = (e) => {
    setEditedProfile({ ...editedProfile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const userId = profile.id;
      const response = await axios.put(`http://10.55.47.47:5000/api/user/update/${userId}`, editedProfile, { withCredentials: true });
      if (response.status === 200) {
        setProfile(editedProfile);
        setEditMode(false);
        localStorage.setItem('user', JSON.stringify({ ...JSON.parse(localStorage.getItem('user')), ...editedProfile }));
        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(`Failed to update profile. Please try again. Error: ${error.response ? error.response.data.message : error.message}`);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setEditMode(false);
  };

  return (
    <section className="dashboard">
      <h1>Student Profile</h1>
      <div className="stud-card">
        <form>
          <div className="stud-field">
            <label>Full Name:</label>
            {editMode ? (
              <input
                type="text"
                name="full_name"
                value={editedProfile.full_name}
                onChange={handleChange}
              />
            ) : (
              <span>{profile.full_name}</span>
            )}
          </div>
          <div className="stud-field">
            <label>Gender:</label>
            {editMode ? (
              <div className="gender-options">
                {genderOptions.map(opt => (
                  <label key={opt}>
                    <input
                      type="radio"
                      name="gender"
                      value={opt}
                      checked={editedProfile.gender === opt}
                      onChange={handleChange}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            ) : (
              <span>{profile.gender}</span>
            )}
          </div>
          <div className="stud-field">
            <label>Username:</label>
            <span>{profile.username}</span>
          </div>
          <div className="stud-field">
            <label>Roll Number:</label>
            <span>{profile.roll_number}</span>
          </div>
          <div className="stud-field">
            <label>Phone Number:</label>
            {editMode ? (
              <input
                type="text"
                name="phone_number"
                value={editedProfile.phone_number}
                onChange={handleChange}
              />
            ) : (
              <span>{profile.phone_number}</span>
            )}
          </div>
          <div className="stud-field">
            <label>Course:</label>
            {editMode ? (
              <select
                name="course"
                value={editedProfile.course}
                onChange={handleChange}
                className="stud-select"
              >
                <option value="">Select Course</option>
                {courseOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <span>{profile.course}</span>
            )}
          </div>
          <div className="stud-field">
            <label>Branch:</label>
            {editMode ? (
              <select
                name="branch"
                value={editedProfile.branch}
                onChange={handleChange}
                className="stud-select"
              >
                <option value="">Select Branch</option>
                {branchOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <span>{profile.branch}</span>
            )}
          </div>
          <div className="stud-field">
            <label>Email ID:</label>
            <span>{profile.email_id}</span>
          </div>
          <div className="profile-actions">
            {editMode ? (
              <>
                <button type="button" className="save-btn" onClick={handleSave}>Save</button>
                <button type="button" className="cancel-btn" onClick={handleCancel}>Cancel</button>
              </>
            ) : (
              <button type="button" className="edit-btn" onClick={handleEdit}>Edit Profile</button>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}

export default StudentProfile;
