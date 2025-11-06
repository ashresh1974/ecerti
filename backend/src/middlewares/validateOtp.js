const db = require('../config/db');

module.exports = async (req, res, next) => {
  const { email, otp } = req.body;
  try {
    const rows = await db.query('SELECT * FROM otps WHERE email = ? AND otp = ? AND expires_at > UTC_TIMESTAMP()', [email, otp]);
    if (rows.length === 0) return res.status(400).json({ message: 'Invalid or expired OTP.' });
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error during OTP validation.' });
  }
};
