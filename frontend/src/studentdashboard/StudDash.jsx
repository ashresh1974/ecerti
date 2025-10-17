import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './StudDash.css';

function StudDash() {
  const [profile, setProfile] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [activeMenu, setActiveMenu] = useState('profile');
  const navigate = useNavigate();

  useEffect(() => {
    // FIXED: Get user data from localStorage (set during login)
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      const userProfile = {
        fullName: user.name || '',
        username: user.username || '',
        roll: user.roll || '',
        email: user.email || '',
      };
      setProfile(userProfile);
      setEditedProfile(userProfile);
    } else {
      // Redirect to login if no user data
      navigate('/');
    }
  }, [navigate]);

  const handleEdit = () => {
    setEditMode(true);
    setEditedProfile(profile);
  };

  const handleChange = (e) => {
    setEditedProfile({ ...editedProfile, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setProfile(editedProfile);
    setEditMode(false);
    // TODO: Add API call to update profile in backend
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setEditMode(false);
  };

  const handleMenuClick = (menuItem) => {
    setActiveMenu(menuItem);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'profile':
        return (
          <div className="profile-card">
            <form>
              <div className="profile-field">
                <label>Full Name:</label>
                {editMode ? (
                  <input
                    type="text"
                    name="fullName"
                    value={editedProfile.fullName}
                    onChange={handleChange}
                  />
                ) : (
                  <span>{profile.fullName}</span>
                )}
              </div>
              <div className="profile-field">
                <label>Username:</label>
                {editMode ? (
                  <input
                    type="text"
                    name="username"
                    value={editedProfile.username}
                    onChange={handleChange}
                  />
                ) : (
                  <span>{profile.username}</span>
                )}
              </div>
              <div className="profile-field">
                <label>Roll Number:</label>
                {editMode ? (
                  <input
                    type="text"
                    name="roll"
                    value={editedProfile.roll}
                    onChange={handleChange}
                  />
                ) : (
                  <span>{profile.roll}</span>
                )}
              </div>
              <div className="profile-field">
                <label>Email ID:</label>
                {editMode ? (
                  <input
                    type="email"
                    name="email"
                    value={editedProfile.email}
                    onChange={handleChange}
                  />
                ) : (
                  <span>{profile.email}</span>
                )}
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
        );
      case 'apply':
        return <div className="content-section">Apply Certificate - Coming Soon</div>;
      case 'status':
        return <div className="content-section">Certificate Status - Coming Soon</div>;
      case 'download':
        return <div className="content-section">Download Certificates - Coming Soon</div>;
      default:
        return <div className="content-section">Select a menu item</div>;
    }
  };

  return (
    <div className="stud-dashboard-bg">
      <div className="stud-dashboard-container">
        <div className="stud-dashboard-menu">
          <h2 className="menu-title">Menu</h2>
          <ul className="menu-list">
            <li 
              className={`menu-item ${activeMenu === 'profile' ? 'active' : ''}`}
              onClick={() => handleMenuClick('profile')}
            >
              Profile
            </li>
            <li 
              className={`menu-item ${activeMenu === 'apply' ? 'active' : ''}`}
              onClick={() => handleMenuClick('apply')}
            >
              Apply Certificate
            </li>
            <li 
              className={`menu-item ${activeMenu === 'status' ? 'active' : ''}`}
              onClick={() => handleMenuClick('status')}
            >
              Certificate Status
            </li>
            <li 
              className={`menu-item ${activeMenu === 'download' ? 'active' : ''}`}
              onClick={() => handleMenuClick('download')}
            >
              Download Certificates
            </li>
            <li className="menu-item logout" onClick={handleLogout}>
              Logout
            </li>
          </ul>
        </div>
        <div className="stud-dashboard-content">
          <h2 className="content-title">
            {activeMenu === 'profile' && 'Student Profile'}
            {activeMenu === 'apply' && 'Apply Certificate'}
            {activeMenu === 'status' && 'Certificate Status'}
            {activeMenu === 'download' && 'Download Certificates'}
          </h2>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default StudDash;
