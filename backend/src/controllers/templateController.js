const path = require('path');
const fs = require('fs');
const multer = require('multer');
const db = require('../config/db');

// Configure multer for template uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '../../public/templates');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}_${timestamp}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG and PNG allowed.'));
    }
  }
});

// Get all templates
exports.getAllTemplates = async (req, res) => {
  try {
    const templates = await db.query(
      'SELECT * FROM certificate_templates ORDER BY last_updated DESC'
    );
    res.json(templates || []);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ message: 'Error fetching templates', error });
  }
};

// Get single template by ID
exports.getTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const template = await db.query(
      'SELECT * FROM certificate_templates WHERE id = ?',
      [templateId]
    );
    if (template && template.length > 0) {
      res.json(template[0]);
    } else {
      res.status(404).json({ message: 'Template not found' });
    }
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ message: 'Error fetching template', error });
  }
};

// Upload new template
exports.uploadTemplate = async (req, res) => {
  try {
    const { certificateType } = req.body;
    
    if (!certificateType) {
      return res.status(400).json({ message: 'Certificate type is required' });
    }

    // Build image paths from uploaded files
    let backgroundImagePath = null;
    let logoImagePath = null;
    let hodSignaturePath = null;
    let principalSignaturePath = null;

    if (req.files && req.files.backgroundImage) {
      backgroundImagePath = `/templates/${req.files.backgroundImage[0].filename}`;
    }
    if (req.files && req.files.logoImage) {
      logoImagePath = `/templates/${req.files.logoImage[0].filename}`;
    }
    if (req.files && req.files.hodSignature) {
      hodSignaturePath = `/templates/${req.files.hodSignature[0].filename}`;
    }
    if (req.files && req.files.principalSignature) {
      principalSignaturePath = `/templates/${req.files.principalSignature[0].filename}`;
    }

    // Insert template into database
    const insertQuery = `
      INSERT INTO certificate_templates 
      (certificate_type, background_image_path, logo_image_path, hod_signature_path, principal_signature_path, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `;
    
    const result = await db.query(insertQuery, [
      certificateType,
      backgroundImagePath,
      logoImagePath,
      hodSignaturePath,
      principalSignaturePath
    ]);

    res.status(201).json({
      message: 'Template uploaded successfully',
      templateId: result.insertId,
      certificateType,
      backgroundImagePath,
      logoImagePath,
      hodSignaturePath,
      principalSignaturePath
    });
  } catch (error) {
    console.error('Error uploading template:', error);
    res.status(500).json({ message: 'Error uploading template', error });
  }
};

// Delete template
exports.deleteTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    
    // Get template to find files
    const template = await db.query(
      'SELECT * FROM certificate_templates WHERE id = ?',
      [templateId]
    );

    if (!template || template.length === 0) {
      return res.status(404).json({ message: 'Template not found' });
    }

    const tmpl = template[0];
    const uploadsDir = path.join(__dirname, '../../public/templates');

    // Delete files from disk
    [tmpl.background_image_path, tmpl.logo_image_path, tmpl.hod_signature_path, tmpl.principal_signature_path]
      .forEach(filePath => {
        if (filePath) {
          const fullPath = path.join(uploadsDir, path.basename(filePath));
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        }
      });

    // Delete from database
    await db.query('DELETE FROM certificate_templates WHERE id = ?', [templateId]);
    
    res.json({ message: 'Template deleted successfully', templateId });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ message: 'Error deleting template', error });
  }
};

// Export controller functions
module.exports = {
  getAllTemplates: exports.getAllTemplates,
  getTemplate: exports.getTemplate,
  uploadTemplate: exports.uploadTemplate,
  deleteTemplate: exports.deleteTemplate,
  upload // multer upload middleware (if needed elsewhere)
};
