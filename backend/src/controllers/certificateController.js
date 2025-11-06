const db = require('../config/db');
const crypto = require('crypto');

const certificateController = {};

// GET /api/certificate/issued - List all issued certificates
certificateController.getIssuedCertificates = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT reference_num, serial_num, full_name, roll_number, certificate_type, issued_date
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
    const reference_num = crypto.randomBytes(8).toString('hex'); // 16 digits hex
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
    const [result] = await db.query(
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
    const [rows] = await db.query(`
      SELECT serial_num, requested_date, roll_number, full_name, certificate_type, status
      FROM certificates
      ORDER BY requested_date DESC
      LIMIT 10
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching recent certificates.", error });
  }
};

module.exports = certificateController;
