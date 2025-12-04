const db = require('../config/db');
const crypto = require('crypto');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Create certificates directory if it doesn't exist
const certificatesDir = path.join(__dirname, '../../public/certificates');
if (!fs.existsSync(certificatesDir)) {
  fs.mkdirSync(certificatesDir, { recursive: true });
}

const certificateController = {};

// GET /api/certificate/issued - List all issued certificates
certificateController.getIssuedCertificates = async (req, res) => {
  try {
    const rows = await db.query(`
      SELECT reference_num, serial_num, full_name, roll_number, certificate_type, issued_date, pdf_path
      FROM certificates
      WHERE status = 'verified'
      ORDER BY issued_date DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching issued certificates.", error });
  }
};

// POST /api/certificate/apply - Student applies for a certificate
certificateController.applyCertificate = async (req, res) => {
  console.log('applyCertificate function entered.');
  console.log('Request body:', req.body);
  try {
    const {
      certificate_type,
      full_name,
      parent_name,
      roll_number,
      course,
      branch,
      duration,
      remark
    } = req.body;

    const requested_date_obj = new Date();
    const currentYear = requested_date_obj.getFullYear();
    const randomFiveDigits = Math.floor(10000 + Math.random() * 90000);
    const serial_num = `CERT/${currentYear}/${randomFiveDigits}`;

    // Reference number format: 14 digits numeric -> 4-digit college code + 4-digit year + 6 random digits
    const collegeCode = '4511';
    const yearPart = String(currentYear);
    const randomSix = String(Math.floor(100000 + Math.random() * 900000));
    const reference_num = `${collegeCode}${yearPart}${randomSix}`; // e.g. 45112025123456
    const hashData = `${serial_num}_${full_name}_${roll_number}_${certificate_type}`;
    const qr_code = crypto.createHash('sha256').update(hashData).digest('hex');

    // Set requested_date as MySQL DATETIME string
    const requested_date = requested_date_obj.toISOString().slice(0, 19).replace('T', ' ');

    // Insert all required fields, qr_code, remark.
    // status and requested_date have default values in the database.
    const insertSql = `INSERT INTO certificates (
      serial_num, reference_num, certificate_type, full_name,
      parent_name, roll_number, course, branch, duration,
      qr_code, remark
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const insertValues = [
      serial_num,
      reference_num,
      certificate_type,
      full_name,
      parent_name,
      roll_number,
      course,
      branch,
      duration,
      qr_code,
      remark
    ];
    console.log('Executing SQL:', insertSql, 'with values:', insertValues);
    console.log('Insert values array:', insertValues);
    try {
      const result = await db.query(insertSql, insertValues);
      console.log('Database query successful:', result);
      res.status(201).json({ message: "Certificate application submitted.", serial_num });
    } catch (queryError) {
      console.error('Database query failed:', queryError);
      if (queryError.sqlMessage) console.error('SQL Error Message:', queryError.sqlMessage);
      if (queryError.sql) console.error('SQL:', queryError.sql);
      res.status(500).json({ message: "Error submitting certificate.", error: queryError.message || "Unknown database error" });
    }
  } catch (error) {
    console.error('Error submitting certificate:', error);
    res.status(500).json({ message: "Error submitting certificate.", error: error.message || "Unknown database error" });
  }
};

// GET /api/certificate/stats - Dashboard statistics for admin
certificateController.getCertificateStats = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
        COUNT(*) as total,
        SUM(status = 'pending') as pending,
        SUM(status = 'verified') as verified,
        SUM(status = 'rejected') as rejected
      FROM certificates`
    );
    res.json({
      total: result[0].total,
      pending: result[0].pending,
      verified: result[0].verified,
      rejected: result[0].rejected
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching certificate stats.", error });
  }
};

// GET /api/certificate/recent - Recent activity for dashboard table
certificateController.getRecentCertificates = async (req, res) => {
  try {
    const rows = await db.query(`
      SELECT reference_num, serial_num, requested_date, roll_number, full_name, certificate_type, status, pdf_path
      FROM certificates
      ORDER BY requested_date DESC
      LIMIT 10
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching recent certificates.", error });
  }
};

// GET /api/certificate/details/:reference_num - Get certificate details by reference number
certificateController.getCertificateDetails = async (req, res) => {
  try {
    const { reference_num } = req.params;
    const rows = await db.query(`
      SELECT * FROM certificates WHERE reference_num = ?
    `, [reference_num]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "Certificate not found." });
    }
    
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error fetching certificate details.", error });
  }
};

// POST /api/certificate/approve/:reference_num - Approve certificate
certificateController.approveCertificate = async (req, res) => {
  try {
    const { reference_num } = req.params;
    const issued_date = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    const result = await db.query(`
      UPDATE certificates 
      SET status = 'verified', issued_date = ?
      WHERE reference_num = ?
    `, [issued_date, reference_num]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Certificate not found." });
    }
    
    // Get certificate data and generate PDF
    const certRows = await db.query(`
      SELECT * FROM certificates WHERE reference_num = ?
    `, [reference_num]);
    
    if (certRows.length > 0) {
      try {
        await certificateController.generateCertificatePDF(certRows[0]);
        const fileName = `${reference_num}.pdf`;
        await db.query(`
          UPDATE certificates 
          SET pdf_path = ?
          WHERE reference_num = ?
        `, [fileName, reference_num]);
      } catch (pdfError) {
        console.error('Error generating PDF:', pdfError);
        // Continue even if PDF generation fails
      }
    }
    
    res.json({ message: "Certificate approved and PDF generated successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error approving certificate.", error });
  }
};

// POST /api/certificate/reject/:reference_num - Reject certificate
certificateController.rejectCertificate = async (req, res) => {
  try {
    const { reference_num } = req.params;
    const { remark } = req.body;
    
    const result = await db.query(`
      UPDATE certificates 
      SET status = 'rejected', remark = ?
      WHERE reference_num = ?
    `, [remark || '', reference_num]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Certificate not found." });
    }
    
    res.json({ message: "Certificate rejected successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error rejecting certificate.", error });
  }
};

// GET /api/certificates/student - Get all certificates for logged-in student
certificateController.getStudentCertificates = async (req, res) => {
  try {
    const roll_number = req.session.user.roll_number;
    
    const rows = await db.query(`
      SELECT reference_num, serial_num, certificate_type, requested_date, status, remark, issued_date, pdf_path
      FROM certificates
      WHERE roll_number = ?
      ORDER BY requested_date DESC
    `, [roll_number]);
    
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching certificates.", error });
  }
};

// Helper function to generate certificate PDF
certificateController.generateCertificatePDF = async (certificateData) => {
  return new Promise((resolve, reject) => {
    try {
      const fileName = `${certificateData.reference_num}.pdf`;
      const filePath = path.join(certificatesDir, fileName);
      
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50
      });
      
      const stream = fs.createWriteStream(filePath);
      
      doc.pipe(stream);
      
      // Certificate Header
      doc.fontSize(28).font('Helvetica-Bold').text('CERTIFICATE', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica').text('of', { align: 'center' });
      doc.fontSize(18).font('Helvetica-Bold').text(certificateData.certificate_type, { align: 'center' });
      
      doc.moveDown(1);
      doc.fontSize(10).font('Helvetica').text('─'.repeat(80), { align: 'center' });
      
      // Body content
      doc.moveDown(1);
      doc.fontSize(12).font('Helvetica').text('This is to certify that', { align: 'center' });
      doc.moveDown(0.5);
      
      doc.fontSize(14).font('Helvetica-Bold').text(certificateData.full_name.toUpperCase(), { align: 'center' });
      doc.moveDown(0.5);
      
      doc.fontSize(12).font('Helvetica').text('has successfully completed', { align: 'center' });
      doc.moveDown(0.5);
      
      const course = certificateData.course || 'N/A';
      const branch = certificateData.branch || 'N/A';
      doc.fontSize(11).font('Helvetica-Bold').text(`${course} - ${branch}`, { align: 'center' });
      doc.moveDown(0.3);
      
      if (certificateData.duration) {
        doc.fontSize(10).font('Helvetica').text(`Duration: ${certificateData.duration}`, { align: 'center' });
      }
      
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica').text('─'.repeat(80), { align: 'center' });
      
      // Footer information
      doc.moveDown(2);
      
      // Left column - Date issued
      doc.fontSize(9).font('Helvetica').text('Date of Issuance:', 50);
      const issuedDate = new Date(certificateData.issued_date).toLocaleDateString('en-IN');
      doc.fontSize(10).font('Helvetica-Bold').text(issuedDate, 50);
      
      // Right column - Certificate details
      doc.fontSize(9).font('Helvetica').text('Serial Number:', 350);
      doc.fontSize(10).font('Helvetica-Bold').text(certificateData.serial_num, 350);
      
      doc.moveDown(0.5);
      doc.fontSize(9).font('Helvetica').text('Reference Number:', 350);
      doc.fontSize(10).font('Helvetica-Bold').text(certificateData.reference_num, 350);
      
      // Additional details at bottom
      doc.moveDown(2);
      doc.fontSize(9).font('Helvetica').text('─'.repeat(80), { align: 'center' });
      doc.moveDown(1);
      
      doc.fontSize(8).font('Helvetica').text('This certificate is issued by the Institution and serves as proof of completion.', { align: 'center' });
      doc.fontSize(8).font('Helvetica').text(`QR Code: ${certificateData.qr_code ? certificateData.qr_code.substring(0, 16) + '...' : 'N/A'}`, { align: 'center' });
      
      doc.end();
      
      stream.on('finish', () => {
        resolve(filePath);
      });
      
      stream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};

// POST /api/certificate/generate/:reference_num - Generate and store PDF certificate
certificateController.generateAndStoreCertificate = async (req, res) => {
  try {
    const { reference_num } = req.params;
    
    // Get certificate details
    const rows = await db.query(`
      SELECT * FROM certificates WHERE reference_num = ?
    `, [reference_num]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "Certificate not found." });
    }
    
    const certificate = rows[0];
    
    // Generate PDF
    const filePath = await certificateController.generateCertificatePDF(certificate);
    
    // Update certificate with pdf_path
    const fileName = `${reference_num}.pdf`;
    await db.query(`
      UPDATE certificates 
      SET pdf_path = ?
      WHERE reference_num = ?
    `, [fileName, reference_num]);
    
    res.json({ 
      message: "Certificate PDF generated successfully.",
      pdf_path: fileName
    });
  } catch (error) {
    console.error('Error generating certificate:', error);
    res.status(500).json({ message: "Error generating certificate.", error: error.message });
  }
};

// GET /api/certificate/download/:reference_num - Download certificate PDF
certificateController.downloadCertificate = async (req, res) => {
  try {
    const { reference_num } = req.params;
    
    const rows = await db.query(`
      SELECT pdf_path FROM certificates WHERE reference_num = ?
    `, [reference_num]);
    
    if (rows.length === 0 || !rows[0].pdf_path) {
      return res.status(404).json({ message: "Certificate PDF not found." });
    }
    
    const filePath = path.join(certificatesDir, rows[0].pdf_path);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Certificate file not found on disk." });
    }
    
    res.download(filePath, rows[0].pdf_path, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
      }
    });
  } catch (error) {
    console.error('Error downloading certificate:', error);
    res.status(500).json({ message: "Error downloading certificate.", error });
  }
};

module.exports = certificateController;
