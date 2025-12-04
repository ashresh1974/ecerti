import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDash.css';

function CertificateTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [deleting, setDeleting] = useState({});

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    certificateType: '',
    backgroundImage: null,
    logoImage: null,
    hodSignature: null,
    principalSignature: null,
  });

  const [uploadProgress, setUploadProgress] = useState(false);

  // Certificate types available
  const certificateTypes = [
    'Participation',
    'Completion',
    'Excellence',
    'Participation Certificate',
    'Course Completion',
    'Achievement Certificate'
  ];

  // Fetch templates on mount
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await axios.get(
        'http://localhost:5000/api/templates/',
        { withCredentials: true }
      );
      // API may return either an array or an object like { message, data: [] }
      const payload = response?.data;
      if (Array.isArray(payload)) {
        setTemplates(payload);
      } else if (payload && Array.isArray(payload.data)) {
        setTemplates(payload.data);
      } else {
        setTemplates([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching templates:', error);
      setTemplates([]);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUploadForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload a valid image file (JPG or PNG)');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setUploadForm(prev => ({
        ...prev,
        [fieldName]: file
      }));
    }
  };

  const handleUploadTemplate = async (e) => {
    e.preventDefault();

    // Validation
    if (!uploadForm.certificateType) {
      alert('Please select a certificate type');
      return;
    }
    if (!uploadForm.backgroundImage) {
      alert('Please upload a background image');
      return;
    }

    setUploadProgress(true);

    try {
      const formData = new FormData();
      formData.append('certificateType', uploadForm.certificateType);
      formData.append('backgroundImage', uploadForm.backgroundImage);
      if (uploadForm.logoImage) formData.append('logoImage', uploadForm.logoImage);
      if (uploadForm.hodSignature) formData.append('hodSignature', uploadForm.hodSignature);
      if (uploadForm.principalSignature) formData.append('principalSignature', uploadForm.principalSignature);

      await axios.post(
        'http://localhost:5000/api/templates/upload',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        }
      );

      alert('Template uploaded successfully!');
      setUploadForm({
        certificateType: '',
        backgroundImage: null,
        logoImage: null,
        hodSignature: null,
        principalSignature: null,
      });
      setShowUploadModal(false);
      fetchTemplates();
    } catch (error) {
      console.error('Error uploading template:', error);
      alert('Error uploading template. Please try again.');
    } finally {
      setUploadProgress(false);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return;
    }

    setDeleting(prev => ({ ...prev, [templateId]: true }));

    try {
      await axios.delete(
        `http://localhost:5000/api/templates/${templateId}`,
        { withCredentials: true }
      );
      alert('Template deleted successfully!');
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Error deleting template. Please try again.');
    } finally {
      setDeleting(prev => ({ ...prev, [templateId]: false }));
    }
  };

  const handlePreview = (template) => {
    setSelectedTemplate(template);
    setShowPreviewModal(true);
  };

  const handleEditTemplate = (template) => {
    // Future: Open edit modal
    alert(`Edit functionality for template "${template.certificateType}" coming soon!`);
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p>Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard certificate-templates">
      <div className="templates-header">
        <h1>📋 Certificate Templates</h1>
        <button 
          className="btn-upload"
          onClick={() => setShowUploadModal(true)}
        >
          ✚ Upload New Template
        </button>
      </div>

      {/* Templates Table/Grid */}
      {templates.length === 0 ? (
        <div className="no-templates">
          <p>📭 No certificate templates found</p>
          <p style={{ fontSize: '0.9em', color: '#999' }}>Click "Upload New Template" to get started</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="templates-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Certificate Type</th>
                <th>Preview</th>
                <th>File Name</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template, idx) => (
                <tr key={template.id || idx}>
                  <td>{idx + 1}</td>
                  <td><strong>{template.certificateType}</strong></td>
                  <td>
                    {template.backgroundImagePath ? (
                      <img 
                        src={`http://localhost:5000/${template.backgroundImagePath}`}
                        alt={template.certificateType}
                        className="template-thumbnail"
                      />
                    ) : (
                      <span style={{ color: '#ccc' }}>No preview</span>
                    )}
                  </td>
                  <td style={{ fontSize: '0.9em', color: '#666' }}>
                    {template.fileName || 'template_' + template.id}
                  </td>
                  <td>{template.lastUpdated ? new Date(template.lastUpdated).toLocaleDateString() : '-'}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-preview"
                        onClick={() => handlePreview(template)}
                        title="Preview template"
                      >
                        👁️ Preview
                      </button>
                      <button 
                        className="btn-edit"
                        onClick={() => handleEditTemplate(template)}
                        title="Edit template"
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => handleDeleteTemplate(template.id)}
                        disabled={deleting[template.id]}
                        title="Delete template"
                      >
                        {deleting[template.id] ? '⏳' : '🗑️'} Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Template Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📤 Upload New Template</h2>
              <button 
                className="modal-close"
                onClick={() => setShowUploadModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadTemplate} className="upload-form">
              {/* Certificate Type Dropdown */}
              <div className="form-group">
                <label htmlFor="certificateType">Certificate Type *</label>
                <select
                  id="certificateType"
                  name="certificateType"
                  value={uploadForm.certificateType}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                >
                  <option value="">-- Select Certificate Type --</option>
                  {certificateTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Background Image Upload */}
              <div className="form-group">
                <label htmlFor="backgroundImage">
                  Background Image (JPG/PNG) *
                </label>
                <input
                  id="backgroundImage"
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={(e) => handleFileChange(e, 'backgroundImage')}
                  className="form-control-file"
                  required
                />
                {uploadForm.backgroundImage && (
                  <p className="file-selected">✓ {uploadForm.backgroundImage.name}</p>
                )}
              </div>

              {/* Logo Image Upload */}
              <div className="form-group">
                <label htmlFor="logoImage">Upload Logo Image (Optional)</label>
                <input
                  id="logoImage"
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={(e) => handleFileChange(e, 'logoImage')}
                  className="form-control-file"
                />
                {uploadForm.logoImage && (
                  <p className="file-selected">✓ {uploadForm.logoImage.name}</p>
                )}
              </div>

              {/* HOD Signature Upload */}
              <div className="form-group">
                <label htmlFor="hodSignature">HOD Signature (Optional)</label>
                <input
                  id="hodSignature"
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={(e) => handleFileChange(e, 'hodSignature')}
                  className="form-control-file"
                />
                {uploadForm.hodSignature && (
                  <p className="file-selected">✓ {uploadForm.hodSignature.name}</p>
                )}
              </div>

              {/* Principal Signature Upload */}
              <div className="form-group">
                <label htmlFor="principalSignature">Principal Signature (Optional)</label>
                <input
                  id="principalSignature"
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={(e) => handleFileChange(e, 'principalSignature')}
                  className="form-control-file"
                />
                {uploadForm.principalSignature && (
                  <p className="file-selected">✓ {uploadForm.principalSignature.name}</p>
                )}
              </div>

              <div className="modal-footer">
                <button 
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowUploadModal(false)}
                  disabled={uploadProgress}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn-save"
                  disabled={uploadProgress}
                >
                  {uploadProgress ? '⏳ Saving...' : '💾 Save Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Template Modal */}
      {showPreviewModal && selectedTemplate && (
        <div className="modal-overlay" onClick={() => setShowPreviewModal(false)}>
          <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📄 Certificate Preview - {selectedTemplate.certificateType}</h2>
              <button 
                className="modal-close"
                onClick={() => setShowPreviewModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="certificate-preview">
              {selectedTemplate.backgroundImagePath ? (
                <img
                  src={`http://localhost:5000/${selectedTemplate.backgroundImagePath}`}
                  alt="Certificate Preview"
                  className="preview-image"
                />
              ) : (
                <div className="preview-placeholder">
                  No background image available
                </div>
              )}

              {/* Overlay text placeholders */}
              <div className="preview-overlay">
                <div className="preview-text student-name">John Doe</div>
                <div className="preview-text issued-date">December 2, 2025</div>
                {selectedTemplate.logoImagePath && (
                  <img 
                    src={`http://localhost:5000/${selectedTemplate.logoImagePath}`}
                    alt="Logo"
                    className="preview-logo"
                  />
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button 
                type="button"
                className="btn-cancel"
                onClick={() => setShowPreviewModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CertificateTemplates;