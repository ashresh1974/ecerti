import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const useSessionTimeout = (timeout = 30 * 60 * 1000) => { // 30 minutes
  const navigate = useNavigate();

  useEffect(() => {
    let timeoutId;

    const resetTimeout = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        localStorage.clear();
        alert('Session expired. Please login again.');
        navigate('/login', { replace: true });
      }, timeout);
      console.log('Session timeout reset. Timeout duration:', timeout);
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, resetTimeout);
    });

    resetTimeout();

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => {
        window.removeEventListener(event, resetTimeout);
      });
    };
  }, [navigate, timeout]);
};

export default useSessionTimeout;

// Ensure this logic is implemented in the appropriate login function in your application.
/*
localStorage.setItem('token', response.data.token);
localStorage.setItem('role', response.data.role);
navigate('/studentdashboard');
*/

<>
  <li className="menu-item"><Link to="/studentdashboard/apply-certificate">Apply Certificate</Link></li>
  <li className="menu-item"><Link to="/studentdashboard/certificate-status">Certificate Status</Link></li>
  <li className="menu-item"><Link to="/studentdashboard/download-certificates">Download Certificates</Link></li>
</>
