const db = require('../config/db');
const crypto = require('crypto');

// Encryption functions for OTP (same as in authController)
const algorithm = 'aes-256-cbc';
const key = crypto.scryptSync('otpSecretKey', 'salt', 32);
const iv = crypto.randomBytes(16);

function decrypt(encrypted) {
  const parts = encrypted.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encryptedText = parts[1];
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

module.exports = async (req, res, next) => {
  const { email, otp } = req.body;
  try {
    const rows = await db.query('SELECT * FROM otps WHERE email = ? AND expires_at > UTC_TIMESTAMP()', [email]);
    if (rows.length === 0) return res.status(400).json({ message: 'Invalid or expired OTP.' });

    const decryptedOtp = decrypt(rows[0].otp);
    if (decryptedOtp !== otp) return res.status(400).json({ message: 'Invalid or expired OTP.' });

    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error during OTP validation.' });
  }
};
