import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import './StudDash.css';

function CertificateView() {
  const { reference_num } = useParams();
  const [pdfPath, setPdfPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        // Load the PDF directly from the /certificates folder using the reference number
        // No API call needed - just use the static file
        const directPath = `http://localhost:5000/certificates/${reference_num}.pdf`;
        setPdfPath(directPath);
        setLoading(false);
      } catch (err) {
        console.error('Error loading certificate:', err);
        setError('Unable to load certificate. ' + err.message);
        setLoading(false);
      }
    };

    if (reference_num) fetchDetails();
  }, [reference_num]);

  const handlePrint = () => {
    if (!iframeRef.current) return;
    try {
      iframeRef.current.contentWindow.focus();
      iframeRef.current.contentWindow.print();
    } catch (err) {
      // fallback: open pdf in new tab and let user print
      window.open(pdfPath, '_blank');
    }
  };

  if (loading) return <div className="dashboard"><h2>Loading certificate...</h2></div>;

  if (error) {
    return (
      <div className="dashboard">
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
          <button className="edit-btn" onClick={() => window.history.back()}>← Back</button>
        </div>
        <div style={{ padding: 24, background: '#fff1f0', borderRadius: 6, marginTop: 16 }}>
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  if (!pdfPath) {
    return (
      <div className="dashboard">
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
          <button className="edit-btn" onClick={() => window.history.back()}>← Back</button>
        </div>
        <div style={{ padding: 24, background: '#f0f8ff', borderRadius: 6, marginTop: 16 }}>
          Certificate PDF not available.
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
        <button className="edit-btn" onClick={() => window.history.back()}>← Back</button>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          {pdfPath && (
            <a href={pdfPath} target="_blank" rel="noreferrer" className="edit-btn">Open in new tab</a>
          )}
        </div>
      </div>

      <div style={{ border: '1px solid #e0e0e0', borderRadius: 6, overflow: 'hidden', position: 'relative' }}> 
        {pdfPath && (
          <iframe
            ref={iframeRef}
            src={pdfPath}
            title={`Certificate ${reference_num}`}
            style={{ width: '100%', height: '80vh', border: 'none' }}
          />
        )}

        {/* Bottom print bar */}
        <div style={{
          position: 'sticky',
          bottom: 0,
          background: '#fff',
          borderTop: '1px solid #e6e6e6',
          padding: '12px',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 8
        }}>
          <button className="save-btn" onClick={handlePrint} disabled={!pdfPath}>Print</button>
        </div>
      </div>
    </div>
  );
}

export default CertificateView;
