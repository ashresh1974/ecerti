import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import useSessionTimeout from '../hooks/useSessionTimeout';
import './StudDash.css';

function StudDash() {
  useSessionTimeout(30 * 60 * 1000);
  const [profile, setProfile] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

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
        const response = await fetch(`http://10.55.47.47:5000/api/user/details?id=${userId}`, {
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

  const handleLogout = async () => {
    try {
      // Call backend logout to destroy session
      await fetch('http://10.55.47.47:5000/api/logout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      // Always clear local storage and redirect
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear browser history to prevent back button access
      window.history.pushState(null, null, '/login');
      window.history.forward();
      
      // Use window.location for hard redirect
      window.location.href = '/login';
    }
  };

  return (
    <div className="admin-container">
      <aside className="admin-menu">
        <h2 className="menu-title">Student Menu</h2>
        <ul>
          <li><button className={location.pathname === '/studentdashboard' ? 'active' : ''} onClick={() => navigate('/studentdashboard')}>Profile</button></li>
          <li><button className={location.pathname === '/studentdashboard/apply-certificate' ? 'active' : ''} onClick={() => navigate('/studentdashboard/apply-certificate')}>Apply Certificate</button></li>
          <li><button className={location.pathname === '/studentdashboard/certificate-status' ? 'active' : ''} onClick={() => navigate('/studentdashboard/certificate-status')}>Certificate Status</button></li>
          <li><button className={location.pathname === '/studentdashboard/download-certificates' ? 'active' : ''} onClick={() => navigate('/studentdashboard/download-certificates')}>Download Certificates</button></li>
          <li><button className={location.pathname === '/studentdashboard/change-password' ? 'active' : ''} onClick={() => navigate('/studentdashboard/change-password')}>Change Password</button></li>
          <li><button className="logout" onClick={handleLogout}>Logout</button></li>
        </ul>
      </aside>

      <main className="admin-main">
        <Outlet context={{ profile, setProfile }} />
      </main>
    </div>
  );
}

export default StudDash;
