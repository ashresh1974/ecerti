const db = require('../config/db');
const transporter = require('../config/mailer');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Encryption functions for OTP
const algorithm = 'aes-256-cbc';
const key = crypto.scryptSync('otpSecretKey', 'salt', 32); // Derive key from password
const iv = crypto.randomBytes(16); // Initialization vector

function encrypt(text) {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted; // Store iv with encrypted data
}

function decrypt(encrypted) {
  const parts = encrypted.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encryptedText = parts[1];
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

exports.register = async (req, res) => {
  const { fullName, roll, course, branch, gender, mobile, email, username, password } = req.body;

  console.log('Registering user with data:', req.body);

  if (!fullName || !roll || !course || !branch || !gender || !mobile || !email || !username || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const checkDuplicateSql = 'SELECT * FROM users WHERE username = ? OR email_id = ? OR roll_number = ? OR phone_number = ?';
    const duplicateUsers = await db.query(checkDuplicateSql, [username, email, roll, mobile]);

    if (duplicateUsers.length > 0) {
      const existing = duplicateUsers[0];
      if (existing.username === username) return res.status(409).json({ message: 'Username already exists.' });
      if (existing.email_id === email) return res.status(409).json({ message: 'Email already exists.' });
      if (existing.roll_number === roll) return res.status(409).json({ message: 'Roll number already exists.' });
      if (existing.phone_number === mobile) return res.status(409).json({ message: 'Mobile number already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const insertUserSql = 'INSERT INTO users (full_name, roll_number, course, branch, gender, phone_number, email_id, username, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const insertValues = [fullName, roll, course, branch, gender, mobile, email, username, hashedPassword];
    console.log('Executing SQL:', insertUserSql, 'with values:', insertValues);
    await db.query(insertUserSql, insertValues);

    res.status(201).json({ message: 'Registration successful!' });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Server error during registration.', error: error.message });
  }
};

exports.sendRegisterOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: 'Email is required.' });

  try {
    const checkUserSql = 'SELECT * FROM users WHERE email_id = ?';
    const results = await db.query(checkUserSql, [email]);
    if (results.length > 0) return res.status(409).json({ message: 'Email is exist.' });

    const otp = crypto.randomInt(100000, 999999).toString();
    const encryptedOtp = encrypt(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');

    await db.query('DELETE FROM otps WHERE email = ?', [email]);
    await db.query('INSERT INTO otps (email, otp, expires_at) VALUES (?, ?, ?)', [email, encryptedOtp, expiresAt]);

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'e-Certificate Registration OTP',
      text: `Your OTP for e-Certificate registration is: ${otp}. It is valid for 10 minutes. Don't share OTP with others. Thank you.`,
    });

    res.status(200).json({ message: 'Enter OTP.' });
  } catch (error) {
    console.error('Error in /api/register/send-otp:', error);
    res.status(500).json({ message: 'Invalid mail id.', error: error.message });
  }
};

exports.verifyRegisterOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required.' });

  try {
    const checkOtpSql = 'SELECT * FROM otps WHERE email = ? AND expires_at > UTC_TIMESTAMP()';
    const results = await db.query(checkOtpSql, [email]);

    if (results.length === 0) return res.status(400).json({ message: 'Invalid mail.' });

    const decryptedOtp = decrypt(results[0].otp);
    if (decryptedOtp !== otp) return res.status(400).json({ message: 'Invalid OTP.' });

    await db.query('DELETE FROM otps WHERE id = ?', [results[0].id]);
    res.status(200).json({ message: 'OTP verified successfully.' });
  } catch (error) {
    console.error('Error checking OTP:', error);
    res.status(500).json({ message: 'Database error.' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });

  try {
    const sql = 'SELECT * FROM users WHERE email_id = ? OR username = ?';
    const results = await db.query(sql, [email, email]);
    if (results.length === 0) return res.status(401).json({ message: 'Invalid email or password.' });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password.' });

    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email_id,
      roll_number: user.roll_number,
      role: user.role,
    };
    console.log('User logged in. Session user:', req.session.user);

    res.status(200).json({
      message: 'Login successful!',
      user: {
        id: user.id,
        username: user.username,
        email: user.email_id,
        full_name: user.full_name,
        role: user.role,
        roll_number: user.roll_number,
        phone_number: user.phone_number,
        course: user.course,
        branch: user.branch,
        gender: user.gender || '',
      },
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Database error.' });
  }
};

exports.sendForgotPasswordOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required.' });

  try {
    const checkUserSql = 'SELECT * FROM users WHERE email_id = ?';
    const results = await db.query(checkUserSql, [email]);
    if (results.length === 0) return res.status(404).json({ message: 'Invalid email address.' });

    const otp = crypto.randomInt(100000, 999999).toString();
    const encryptedOtp = encrypt(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');

    await db.query('DELETE FROM otps WHERE email = ?', [email]);
    await db.query('INSERT INTO otps (email, otp, expires_at) VALUES (?, ?, ?)', [email, encryptedOtp, expiresAt]);

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'e-Certificate Password Reset OTP',
      text: `Your OTP for password reset is: ${otp}. It is valid for 10 minutes. Don't share OTP with others. Thank you.`,
    });

    res.status(200).json({ message: 'OTP is sent to mail id.' });
  } catch (error) {
    console.error('Error in /api/forgot-password/send-otp:', error);
    res.status(500).json({ message: 'Mail id is invalid.' });
  }
};

exports.verifyForgotPasswordOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required.' });

  try {
    const checkOtpSql = 'SELECT * FROM otps WHERE email = ? AND expires_at > UTC_TIMESTAMP()';
    const results = await db.query(checkOtpSql, [email]);

    if (results.length === 0) return res.status(400).json({ message: 'Invalid or expired OTP.' });

    const decryptedOtp = decrypt(results[0].otp);
    if (decryptedOtp !== otp) return res.status(400).json({ message: 'Invalid or expired OTP.' });

    res.status(200).json({ message: 'OTP verified successfully.' });
  } catch (error) {
    console.error('Error verifying forgot password OTP:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) return res.status(400).json({ message: 'Email, OTP, and new password are required.' });

  try {
    const checkOtpSql = 'SELECT * FROM otps WHERE email = ? AND expires_at > UTC_TIMESTAMP()';
    const otpResults = await db.query(checkOtpSql, [email]);

    if (otpResults.length === 0) return res.status(400).json({ message: 'Invalid or expired OTP. Please try again.' });

    const decryptedOtp = decrypt(otpResults[0].otp);
    if (decryptedOtp !== otp) return res.status(400).json({ message: 'Invalid or expired OTP. Please try again.' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = ? WHERE email_id = ?', [hashedPassword, email]);
    await db.query('DELETE FROM otps WHERE email = ?', [email]);

    res.status(200).json({ message: 'Password reset successfully.' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Server error during password reset.' });
  }
};

exports.sendForgotPasswordOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: 'Email is required.' });

  try {
    const checkUserSql = 'SELECT * FROM users WHERE email_id = ?';
    const results = await db.query(checkUserSql, [email]);
    if (results.length === 0) return res.status(404).json({ message: 'User with this email does not exist.' });

    const otp = crypto.randomInt(100000, 999999).toString();
    const encryptedOtp = encrypt(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');

    await db.query('DELETE FROM otps WHERE email = ?', [email]);
    await db.query('INSERT INTO otps (email, otp, expires_at) VALUES (?, ?, ?)', [email, encryptedOtp, expiresAt]);

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'e-Certificate Password Reset OTP',
      text: `Your OTP for e-Certificate password reset is: ${otp}. It is valid for 10 minutes.`,
    });

    res.status(200).json({ message: 'OTP sent to your email.' });
  } catch (error) {
    console.error('Error in /api/auth/forgot-password/send-otp:', error);
    res.status(500).json({ message: 'Failed to send OTP email.', error: error.message });
  }
};

exports.verifyForgotPasswordOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required.' });

  try {
    const checkOtpSql = 'SELECT * FROM otps WHERE email = ? AND expires_at > UTC_TIMESTAMP()';
    const results = await db.query(checkOtpSql, [email]);

    if (results.length === 0) return res.status(400).json({ message: 'Invalid or expired OTP.' });

    const decryptedOtp = decrypt(results[0].otp);
    if (decryptedOtp !== otp) return res.status(400).json({ message: 'Invalid or expired OTP.' });

    res.status(200).json({ message: 'OTP verified successfully.' });
  } catch (error) {
    console.error('Error verifying forgot password OTP:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ message: 'Could not log out, please try again.' });
    }
    // Clear session cookie
    res.clearCookie('connect.sid');
    res.status(200).json({ message: 'Logged out successfully.' });
  });
};

// Validate if user session is still active
exports.validateSession = (req, res) => {
  if (req.session && req.session.user) {
    res.status(200).json({ 
      isValid: true, 
      user: req.session.user 
    });
  } else {
    res.status(401).json({ 
      isValid: false, 
      message: 'Session expired or invalid' 
    });
  }
};


