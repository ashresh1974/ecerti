import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDash.css';

function QRVerificationLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQRLogs();
  }, []);

  const fetchQRLogs = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/certificate/qr-logs', {
        withCredentials: true
      });
      setLogs(response.data || []);
    } catch (error) {
      console.error('Error fetching QR logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard qr-logs">
      <h1>QR Code Verification Logs</h1>
      <p>Track when certificates are verified via QR code scanning</p>

      {loading ? (
        <p>Loading logs...</p>
      ) : logs.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          No QR verification logs yet.
        </p>
      ) : (
        <div className="qr-logs-table-wrapper">
          <table className="qr-logs-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Reference Number</th>
                <th>Verified Date & Time</th>
                <th>IP Address</th>
                <th>User Agent</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr key={log.id}>
                  <td>{index + 1}</td>
                  <td className="qr-reference-num">{log.reference_num}</td>
                  <td>
                    {log.verified_at ? new Date(log.verified_at).toLocaleString() : '-'}
                  </td>
                  <td className="qr-ip-address">{log.ip_address}</td>
                  <td className="qr-user-agent">{log.user_agent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default QRVerificationLogs;
