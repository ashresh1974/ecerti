const db = require('../config/db');
const crypto = require('crypto');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const transporter = require('../config/mailer');

// QR code directory
const qrCodesDir = path.join(__dirname, '../../public/qr-codes');
if (!fs.existsSync(qrCodesDir)) {
  fs.mkdirSync(qrCodesDir, { recursive: true });
}

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
      present_year,
      remark
    } = req.body;

    console.log('[APPLY] Extracted values:', {
      certificate_type,
      full_name,
      parent_name,
      roll_number,
      course,
      branch,
      duration,
      present_year,
      remark
    });

    // Restriction: Conduct Certificate only for 4th year or course completed students
    if (certificate_type === 'Conduct Certificate' && present_year != 4) {
      return res.status(400).json({ message: "Conduct Certificate is only available for 4th year students or those who have completed their course." });
    }

    // Restriction: Only one application per certificate type per student per calendar year
    try {
      const yearToCheck = requested_date_obj.getFullYear();
      const duplicateCheckSql = `
        SELECT COUNT(*) as cnt FROM certificates
        WHERE roll_number = ? AND certificate_type = ? AND YEAR(requested_date) = ? AND status != 'rejected'
      `;
      const dupRows = await db.query(duplicateCheckSql, [roll_number, certificate_type, yearToCheck]);
      if (dupRows && dupRows[0] && dupRows[0].cnt > 0) {
        return res.status(400).json({ message: 'You have already applied for this certificate in the current year.' });
      }
    } catch (dupErr) {
      console.warn('Duplicate check failed:', dupErr);
      // proceed — don't block apply if check fails unexpectedly
    }

    // Fetch gender from user profile
    let gender = '';
    try {
      const userRows = await db.query('SELECT gender FROM users WHERE roll_number = ?', [roll_number]);
      if (userRows.length > 0) {
        gender = userRows[0].gender || '';
      }
    } catch (userError) {
      console.warn('Error fetching user gender:', userError);
    }

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
    // Note: gender is not stored here; it will be fetched from users table during PDF generation
    const insertSql = `INSERT INTO certificates (
      serial_num, reference_num, certificate_type, full_name,
      parent_name, roll_number, course, branch, duration,
      present_year, qr_code, remark
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
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
      present_year,
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
      SELECT c.*, u.phone_number
      FROM certificates c
      LEFT JOIN users u ON c.roll_number = u.roll_number
      WHERE c.reference_num = ?
    `, [reference_num]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "Certificate not found." });
    }
    
    const details = rows[0];
    
    // Check for duplicate applications
    const duplicateRows = await db.query(`
      SELECT reference_num, requested_date FROM certificates 
      WHERE roll_number = ? AND certificate_type = ? AND full_name = ? AND present_year = ? AND reference_num != ?
      ORDER BY requested_date DESC
    `, [details.roll_number, details.certificate_type, details.full_name, details.present_year, reference_num]);
    
    details.previousApplications = duplicateRows;
    
    res.json(details);
  } catch (error) {
    res.status(500).json({ message: "Error fetching certificate details.", error });
  }
};

// POST /api/certificate/approve/:reference_num - Approve certificate
certificateController.approveCertificate = async (req, res) => {
  try {
    const { reference_num } = req.params;
    const { template_id } = req.body; // Extract template_id from request body
    const issued_date = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    console.log(`[APPROVE] Processing approval for certificate: ${reference_num}`);
    
    // Prepare update query - include template_id if provided
    let updateQuery = `UPDATE certificates SET status = 'verified', issued_date = ?`;
    const params = [issued_date];
    
    if (template_id) {
      updateQuery += `, template_id = ?`;
      params.push(template_id);
    }
    
    updateQuery += ` WHERE reference_num = ?`;
    params.push(reference_num);
    
    const result = await db.query(updateQuery, params);
    
    if (result.affectedRows === 0) {
      console.warn(`[APPROVE] Certificate not found: ${reference_num}`);
      return res.status(404).json({ message: "Certificate not found." });
    }
    
    console.log(`[APPROVE] Certificate status updated to 'verified' for: ${reference_num}`);
    
    // Get certificate data and generate PDF
    const certRows = await db.query(`
      SELECT * FROM certificates WHERE reference_num = ?
    `, [reference_num]);
    
    if (certRows.length > 0) {
      try {
        console.log(`[APPROVE] Starting PDF generation for: ${reference_num}`);
        await certificateController.generateCertificatePDF(certRows[0]);
        const fileName = `${reference_num}.pdf`;
        await db.query(`
          UPDATE certificates 
          SET pdf_path = ?
          WHERE reference_num = ?
        `, [fileName, reference_num]);
        console.log(`[APPROVE] PDF generated and pdf_path updated: ${fileName}`);
      } catch (pdfError) {
        console.error(`[APPROVE] Error generating PDF for ${reference_num}:`, pdfError);
        // Continue even if PDF generation fails
      }
    }
    
    // Send approval email to student
    try {
      const studentData = await db.query(`
        SELECT u.email_id, u.full_name, c.certificate_type FROM users u
        JOIN certificates c ON u.roll_number = c.roll_number
        WHERE c.reference_num = ?
      `, [reference_num]);
      
      if (studentData.length > 0) {
        const { email_id, full_name, certificate_type } = studentData[0];
        const loginUrl = 'http://10.55.47.47:3000/login';
        const subject = 'Certificate Approved - Download Now';
        const htmlContent = `
          <p>Dear ${full_name},</p>
          <p>Your ${certificate_type} certificate has been approved.</p>
          <p>Check your student portal to download the certificate.</p>
          <p>Click here to login and download:</p>
          <a href="${loginUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Download</a>
          <p>Don't share OTP with others. Thank you.</p>
        `;
        
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email_id,
          subject: subject,
          html: htmlContent,
        });
        
        console.log(`[APPROVE] Approval email sent to: ${email_id}`);
      } else {
        console.warn(`[APPROVE] No email found for certificate: ${reference_num}`);
      }
    } catch (emailError) {
      console.error(`[APPROVE] Error sending approval email for ${reference_num}:`, emailError);
      // Continue even if email fails
    }
    
    res.json({ 
      message: "Certificate approved and PDF generated successfully.",
      reference_num: reference_num,
      pdf_path: `${reference_num}.pdf`
    });
  } catch (error) {
    console.error(`[APPROVE] Error approving certificate:`, error);
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
    
    // Send rejection email to student
    try {
      const studentData = await db.query(`
        SELECT u.email_id, u.full_name, c.certificate_type FROM users u
        JOIN certificates c ON u.roll_number = c.roll_number
        WHERE c.reference_num = ?
      `, [reference_num]);
      
      if (studentData.length > 0) {
        const { email_id, full_name, certificate_type } = studentData[0];
        const loginUrl = 'http://10.55.47.47:3000/login';
        const subject = 'Certificate Application Rejected';
        const htmlContent = `
          <p>Dear ${full_name},</p>
          <p>Your ${certificate_type} certificate application has been rejected because of: ${remark || 'No reason provided'}.</p>
          <p>Click here to check:</p>
          <a href="${loginUrl}" style="display: inline-block; padding: 10px 20px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 5px;">Check Now</a>
          <p>Don't share OTP with others. Thank you.</p>
        `;
        
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email_id,
          subject: subject,
          html: htmlContent,
        });
        
        console.log(`[REJECT] Rejection email sent to: ${email_id}`);
      } else {
        console.warn(`[REJECT] No email found for certificate: ${reference_num}`);
      }
    } catch (emailError) {
      console.error(`[REJECT] Error sending rejection email for ${reference_num}:`, emailError);
      // Continue even if email fails
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

// Helper function to generate certificate PDF from HTML template
certificateController.generateCertificatePDF = async (certificateData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const fileName = `${certificateData.reference_num}.pdf`;
      const filePath = path.join(certificatesDir, fileName);

      // Prepare QR code data - encode certificate details for verification
      // When scanned, it will open the verify page with the reference number
      // Use environment variable for domain, fallback to localhost for development
      const domain = process.env.FRONTEND_URL || 'http://localhost:3000';
      const verifyUrl = `${domain}/verify/${certificateData.reference_num}`;
      
      // Create QR code with high error correction to ensure it works even if partially obscured
      const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        margin: 2,
        width: 300
      });

      console.log(`[PDF] QR Code generated for reference: ${certificateData.reference_num}`);

      // Write a local copy of qr image (optional, keep for compatibility)
      const qrCodePath = path.join(qrCodesDir, `${certificateData.reference_num}.png`);
      const base64Data = qrDataUrl.replace(/^data:image\/(png|jpeg);base64,/, '');
      fs.writeFileSync(qrCodePath, base64Data, 'base64');

      // Map certificate types to template file names
      const type = (certificateData.certificate_type || '').toLowerCase();
      let templateFile = 'bonafide-certificate.html';
      if (type.includes('conduct')) templateFile = 'conduct-certificate.html';
      else if (type.includes('scholar')) templateFile = 'schoarship-bonafide-certificate.html';

      // Try to find template in multiple locations (backend templates are primary)
      let templatePath = null;
      const possiblePaths = [
        path.join(__dirname, '../../public/templates', templateFile),
        path.join(__dirname, '../../backend/public/templates', templateFile),
        path.join(__dirname, '../public/templates', templateFile),
        path.join(__dirname, '../../frontend/src/templates', templateFile),
        path.join(__dirname, '../../public/templates/bonafide-certificate.html')
      ];

      for (const filePath of possiblePaths) {
        if (fs.existsSync(filePath)) {
          templatePath = filePath;
          console.log('[PDF] Template found at:', filePath);
          break;
        }
      }

      if (!templatePath) {
        throw new Error(`No certificate template found. Checked: ${possiblePaths.join(', ')}`);
      }

      // Read HTML template
      let htmlContent = fs.readFileSync(templatePath, 'utf8');

      // Prepare replacement values
      let gender = certificateData.gender || '';
      
      // If gender is not in certificate record, fetch from users table
      if (!gender && certificateData.roll_number) {
        try {
          const userRows = await db.query('SELECT gender FROM users WHERE roll_number = ?', [certificateData.roll_number]);
          if (userRows.length > 0) {
            gender = userRows[0].gender || '';
            console.log('[PDF] Gender fetched from users table:', gender);
          }
        } catch (userError) {
          console.warn('Error fetching user gender:', userError);
        }
      }
      
      const academicYear = certificateData.duration || 'N/A';
      const heShe = String(gender).toLowerCase() === 'female' ? 'She' : 'He';
      const hisHer = String(gender).toLowerCase() === 'female' ? 'Her' : 'His';
      const soDo = String(gender).toLowerCase() === 'female' ? 'D/o' : 'S/o';
      
      // Determine student prefix based on gender (for student name only)
      const studentPrefix = String(gender).toLowerCase() === 'female' ? 'Ms.' : 'Mr.';
      
      // Format issued date - handle both timestamp and null values
      let issuedDate = 'N/A';
      if (certificateData.issued_date) {
        try {
          const dateObj = new Date(certificateData.issued_date);
          issuedDate = dateObj.toLocaleDateString('en-IN');
        } catch (dateErr) {
          console.warn('[PDF] Error formatting issued_date:', dateErr);
          issuedDate = new Date().toLocaleDateString('en-IN');
        }
      } else {
        issuedDate = new Date().toLocaleDateString('en-IN');
      }
      
      console.log('[PDF] Replacement values:', {
        serial_num: certificateData.serial_num,
        issuedDate: issuedDate,
        soDo: soDo,
        gender: gender,
        heShe: heShe,
        hisHer: hisHer
      });

      // Load and embed logo as base64 (if it exists), otherwise use placeholder
      let logoBase64 = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0OCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMjA1MWE3IiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=';
      const assetPaths = [
        path.join(__dirname, '../../frontend/src/assets/MGU_LOGO.png'),
        path.join(__dirname, '../../backend/public/assets/MGU_LOGO.png'),
        path.join(__dirname, '../../public/assets/MGU_LOGO.png')
      ];
      for (const assetPath of assetPaths) {
        if (fs.existsSync(assetPath)) {
          try {
            const logoBuffer = fs.readFileSync(assetPath);
            logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
            console.log('[PDF] Logo loaded from:', assetPath);
            break;
          } catch (logoErr) {
            console.warn('[PDF] Failed to load logo from', assetPath, logoErr.message);
          }
        }
      }

      // Replace placeholders including QR code base64
      htmlContent = htmlContent.replace(/\{\{SERIAL_NUM\}\}/g, certificateData.serial_num || 'N/A');
      htmlContent = htmlContent.replace(/\{\{SL_NO\}\}/g, certificateData.serial_num || 'N/A');
      console.log('[PDF] Replaced {{SL_NO}} with:', certificateData.serial_num);
      
      htmlContent = htmlContent.replace(/\{\{QR_CODE_BASE64\}\}/g, qrDataUrl);
      htmlContent = htmlContent.replace(/\/assets\/MGU_LOGO\.png/g, logoBase64); // Embed logo as data URI
      htmlContent = htmlContent.replace(/\{\{QR_CODE_PATH\}\}/g, `qr-codes/${certificateData.reference_num}.png`);
      
      htmlContent = htmlContent.replace(/\{\{ISSUED_DATE\}\}/g, issuedDate);
      htmlContent = htmlContent.replace(/\{\{DATE\}\}/g, issuedDate);
      console.log('[PDF] Replaced {{DATE}} with:', issuedDate);
      
      htmlContent = htmlContent.replace(/\{\{ROLL_NO\}\}/g, certificateData.roll_number || 'N/A');
      htmlContent = htmlContent.replace(/\{\{PREFIX\}\}/g, certificateData.parent_prefix || 'Mr.');
      htmlContent = htmlContent.replace(/\{\{STUDENT_NAME\}\}/g, `${studentPrefix} ${certificateData.full_name || 'N/A'}`);
      htmlContent = htmlContent.replace(/\{\{PARENT_NAME\}\}/g, certificateData.parent_name || 'N/A');
      
      htmlContent = htmlContent.replace(/\{\{SO_DO\}\}/g, soDo);
      console.log('[PDF] Replaced {{SO_DO}} with:', soDo);
      
      htmlContent = htmlContent.replace(/\{\{HE_SHE\}\}/g, heShe);
      htmlContent = htmlContent.replace(/\{\{HIS_HER\}\}/g, hisHer);
      htmlContent = htmlContent.replace(/\{\{BRANCH\}\}/g, certificateData.branch || 'N/A');
      htmlContent = htmlContent.replace(/\{\{COURSE\}\}/g, certificateData.course || 'N/A');
      htmlContent = htmlContent.replace(/\{\{ACADEMIC_YEAR\}\}/g, academicYear);
      htmlContent = htmlContent.replace(/\{\{PRESENT_YEAR\}\}/g, certificateData.present_year || 'N/A');
      htmlContent = htmlContent.replace(/\{\{REFERENCE_NUM\}\}/g, certificateData.reference_num || '');

      // Load signature images as base64
      let hodSig = '', prinSig = '';
      const sigDirs = [path.join(__dirname, '../../public/assets/signatures'), path.join(__dirname, '../../backend/public/assets/signatures')];
      for (const d of sigDirs) {
        const h = path.join(d, 'hod-signature.png');
        const p = path.join(d, 'principal-signature.png');
        if (!hodSig && fs.existsSync(h)) {
          try { hodSig = `data:image/png;base64,${fs.readFileSync(h).toString('base64')}`; } catch(e) {}
        }
        if (!prinSig && fs.existsSync(p)) {
          try { prinSig = `data:image/png;base64,${fs.readFileSync(p).toString('base64')}`; } catch(e) {}
        }
      }
      if (hodSig) htmlContent = htmlContent.replace(/\/assets\/signatures\/hod-signature(\.png)?/g, hodSig);
      if (prinSig) htmlContent = htmlContent.replace(/\/assets\/signatures\/principal-signature(\.png)?/g, prinSig);

      // Convert HTML to PDF (use html-pdf if puppeteer not available)
      let pdfGenerated = false;
      // Try to use puppeteer if available for better fidelity
      try {
        const puppeteer = require('puppeteer');
        console.log('[PDF] Attempting PDF generation with Puppeteer for reference:', certificateData.reference_num);
        const browser = await puppeteer.launch({ 
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
          headless: 'new'
        });
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.pdf({ 
          path: filePath, 
          format: 'A4', 
          printBackground: true, 
          margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' } 
        });
        await browser.close();
        console.log('[PDF] ✓ PDF generated successfully with Puppeteer:', filePath);
        pdfGenerated = true;
      } catch (puppeteerErr) {
        console.warn('[PDF] Puppeteer failed, falling back to html-pdf:', puppeteerErr && puppeteerErr.message);
      }

      if (!pdfGenerated) {
        console.log('[PDF] Attempting PDF generation with html-pdf for reference:', certificateData.reference_num);
        const htmlPdf = require('html-pdf');
        const options = {
          format: 'A4',
          orientation: 'portrait',
          border: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
          timeout: 30000,
          width: '210mm',
          height: '297mm'
        };
        htmlPdf.create(htmlContent, options).toFile(filePath, (err, res) => {
          if (err) {
            console.error('[PDF] Error generating PDF with html-pdf:', err);
            return reject(err);
          }
          console.log('[PDF] ✓ PDF generated successfully with html-pdf:', filePath);
          return resolve(filePath);
        });
        return;
      }

      // If puppeteer succeeded
      resolve(filePath);
    } catch (error) {
      console.error('Error in generateCertificatePDF:', error);
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
    
    // Set headers to display PDF inline in browser instead of forcing download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${rows[0].pdf_path}"`);
    
    // Send the PDF file
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }
    });
  } catch (error) {
    console.error('Error downloading certificate:', error);
    res.status(500).json({ message: "Error downloading certificate.", error });
  }
};

// GET /api/certificate/verify/:reference_num - Verify certificate via QR code
certificateController.verifyCertificate = async (req, res) => {
  try {
    const { reference_num } = req.params;
    
    const rows = await db.query(`
      SELECT reference_num, serial_num, full_name, roll_number, certificate_type, 
             issued_date, course, branch, parent_name, duration, present_year
      FROM certificates
      WHERE reference_num = ? AND status = 'verified'
    `, [reference_num]);
    
    if (rows.length === 0) {
      return res.status(404).json({ 
        message: "Certificate not found or not yet verified",
        verified: false 
      });
    }
    
    const cert = rows[0];
    
    // Log QR verification for audit trail
    try {
      const user_agent = req.get('user-agent') || 'Unknown';
      const ip_address = req.ip || req.connection.remoteAddress || 'Unknown';
      
      await db.query(`
        INSERT INTO qr_verification_logs (reference_num, user_agent, ip_address)
        VALUES (?, ?, ?)
      `, [reference_num, user_agent, ip_address]);
      
      console.log(`[QR VERIFY] Certificate verified via QR: ${reference_num} from ${ip_address}`);
    } catch (logError) {
      console.warn('[QR VERIFY] Failed to log QR verification:', logError.message);
      // Continue even if logging fails - don't block the verification
    }
    
    res.json({
      verified: true,
      data: {
        reference_num: cert.reference_num,
        serial_num: cert.serial_num,
        full_name: cert.full_name,
        roll_number: cert.roll_number,
        certificate_type: cert.certificate_type,
        issued_date: cert.issued_date,
        course: cert.course,
        branch: cert.branch,
        parent_name: cert.parent_name,
        duration: cert.duration,
        present_year: cert.present_year
      }
    });
  } catch (error) {
    console.error('Error verifying certificate:', error);
    res.status(500).json({ message: "Error verifying certificate.", error });
  }
};

// GET /api/certificate/qr-logs - Get QR verification logs
certificateController.getQRVerificationLogs = async (req, res) => {
  try {
    const rows = await db.query(`
      SELECT id, reference_num, user_agent, ip_address, verified_at
      FROM qr_verification_logs
      ORDER BY verified_at DESC
      LIMIT 100
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching QR verification logs:', error);
    res.status(500).json({ message: "Error fetching QR logs.", error });
  }
};

// POST /api/certificate/reapply/:reference_num - Allow re-application by setting status to pending
certificateController.reapplyCertificate = async (req, res) => {
  try {
    const { reference_num } = req.params;
    // Accept optional updated fields from student and set status back to pending
    const {
      certificate_type,
      full_name,
      parent_name,
      course,
      branch,
      duration,
      present_year,
      remark
    } = req.body || {};

    const requested_date = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Update provided fields and set status to pending
    const updateSql = `UPDATE certificates SET
      certificate_type = COALESCE(?, certificate_type),
      full_name = COALESCE(?, full_name),
      parent_name = COALESCE(?, parent_name),
      course = COALESCE(?, course),
      branch = COALESCE(?, branch),
      duration = COALESCE(?, duration),
      present_year = COALESCE(?, present_year),
      remark = COALESCE(?, remark),
      status = 'pending',
      requested_date = ?
      WHERE reference_num = ?`;

    const params = [
      certificate_type || null,
      full_name || null,
      parent_name || null,
      course || null,
      branch || null,
      duration || null,
      present_year || null,
      remark || null,
      requested_date,
      reference_num
    ];

    const result = await db.query(updateSql, params);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Certificate not found.' });
    }

    res.json({ message: 'Certificate updated and set to pending for re-application.' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating certificate status.', error });
  }
};

module.exports = certificateController;
