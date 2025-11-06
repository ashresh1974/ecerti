import React from 'react';
import { useOutletContext } from 'react-router-dom';
import './StudDash.css'; // Assuming shared CSS

function DownloadCertificates() {
  const { profile } = useOutletContext();
  return (
    <section className="dashboard">
      <h1>Download Certificates</h1>
      <div className="stud-content-box">
        {/* Your Download Certificates content goes here */}
        <p>This is the Download Certificates page content.</p>
      </div>
    </section>
  );
}

export default DownloadCertificates;
