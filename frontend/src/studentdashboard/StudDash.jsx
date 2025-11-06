import React, { useState, useEffect } from 'react';
import { useNavigate, Link, Outlet } from 'react-router-dom';
import useSessionTimeout from '../hooks/useSessionTimeout';
import './StudDash.css';

function StudDash() {
  useSessionTimeout(30 * 60 * 1000);
  const [profile, setProfile] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    const preventBack = () => {
      window.history.pushState(null, '', window.location.href);
    };
    preventBack();
    window.addEventListener('popstate', preventBack);

    return () => {
      window.removeEventListener('popstate', preventBack);
    };
  }, [navigate]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setProfile(JSON.parse(userData));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      if (!token || !userId) {
        navigate('/login', { replace: true });
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/user/details?id=${userId}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setProfile(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        } else {
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
        navigate('/login', { replace: true });
      }
    };

    fetchUserDetails();
  }, [navigate, setProfile]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="admin-container">
      <aside className="admin-menu">
        <h2 className="menu-title">Student Menu</h2>
        <ul>
          <li><Link to="/studentdashboard">Profile</Link></li>
          <li><Link to="/studentdashboard/apply-certificate">Apply Certificate</Link></li>
          <li><Link to="/studentdashboard/certificate-status">Certificate Status</Link></li>
          <li><Link to="/studentdashboard/download-certificates">Download Certificates</Link></li>
          <li className="logout" onClick={handleLogout}>Logout</li>
        </ul>
      </aside>

      <main className="admin-main">
        <Outlet context={{ profile, setProfile }} />
      </main>
    </div>
  );
}

export default StudDash;
