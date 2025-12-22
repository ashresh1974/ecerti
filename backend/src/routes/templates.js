const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
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

const uploadMiddleware = multer({
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

// GET: List all certificate templates
router.get('/', templateController.getAllTemplates);

// GET: Get template by ID
router.get('/:templateId', templateController.getTemplate);

// POST: Upload new certificate template
router.post(
  '/upload',
  uploadMiddleware.fields([
    { name: 'backgroundImage', maxCount: 1 },
    { name: 'logoImage', maxCount: 1 },
    { name: 'hodSignature', maxCount: 1 },
    { name: 'principalSignature', maxCount: 1 }
  ]),
  templateController.uploadTemplate
);

// DELETE: Delete certificate template
router.delete('/:templateId', templateController.deleteTemplate);

module.exports = router;
