// routes/templates.js
const express = require('express');
const router = express.Router();

// API Placeholder Routes for Certificate Templates

// GET: List all certificate templates
router.get('/', async (req, res) => {
  try {
    // TODO: Query certificate_templates table from database
    // SELECT * FROM certificate_templates ORDER BY lastUpdated DESC
    
    res.json({
      message: "Get all templates endpoint",
      data: []
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching templates", error });
  }
});

// POST: Upload new certificate template
router.post('/upload', async (req, res) => {
  try {
    // TODO: Handle file uploads (backgroundImage, logoImage, hodSignature, principalSignature)
    // Validate file types (JPG/PNG only)
    // Store files in public/templates/ directory
    // Save template metadata to certificate_templates table
    
    const { certificateType } = req.body;
    
    res.status(201).json({
      message: "Template uploaded successfully",
      templateId: Date.now(), // Placeholder
      certificateType
    });
  } catch (error) {
    res.status(500).json({ message: "Error uploading template", error });
  }
});

// GET: Get template by ID with preview
router.get('/:templateId', async (req, res) => {
  try {
    // TODO: Query certificate_templates WHERE id = :templateId
    
    const { templateId } = req.params;
    
    res.json({
      message: "Get template by ID",
      templateId
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching template", error });
  }
});

// PUT: Update certificate template
router.put('/:templateId', async (req, res) => {
  try {
    // TODO: Update template in certificate_templates table
    // Handle file uploads for any updated images
    
    const { templateId } = req.params;
    
    res.json({
      message: "Template updated successfully",
      templateId
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating template", error });
  }
});

// DELETE: Delete certificate template
router.delete('/:templateId', async (req, res) => {
  try {
    // TODO: Delete from certificate_templates table WHERE id = :templateId
    // Delete associated image files from public/templates/ directory
    
    const { templateId } = req.params;
    
    res.json({
      message: "Template deleted successfully",
      templateId
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting template", error });
  }
});

module.exports = router;
