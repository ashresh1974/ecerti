const db = require('../config/db');

// Get user details
exports.getDetails = async (req, res) => {
  const userId = req.query.id;
  try {
    const user = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (user.length === 0) return res.status(404).json({ message: 'User not found.' });
    res.status(200).json({ user: user[0] });
  } catch (error) {
    res.status(500).json({ message: 'Database error.' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  const userId = req.params.id;
  const {
    full_name,
    username,
    roll_number,
    phone_number,
    course,
    branch,
    gender,
    email_id,
  } = req.body;

  console.log('Updating user profile for ID:', userId);
  console.log('Received data for update:', req.body);

  const fieldsToUpdate = [];
  const values = [];

  if (full_name !== undefined) {
    fieldsToUpdate.push('full_name=?');
    values.push(full_name);
  }
  if (username !== undefined) {
    fieldsToUpdate.push('username=?');
    values.push(username);
  }
  if (roll_number !== undefined) {
    fieldsToUpdate.push('roll_number=?');
    values.push(roll_number);
  }
  if (phone_number !== undefined) {
    fieldsToUpdate.push('phone_number=?');
    values.push(phone_number);
  }
  if (course !== undefined) {
    fieldsToUpdate.push('course=?');
    values.push(course);
  }
  if (branch !== undefined) {
    fieldsToUpdate.push('branch=?');
    values.push(branch);
  }
  if (gender !== undefined) {
    fieldsToUpdate.push('gender=?');
    values.push(gender);
  }
  if (email_id !== undefined) {
    fieldsToUpdate.push('email_id=?');
    values.push(email_id);
  }

  if (fieldsToUpdate.length === 0) {
    return res.status(400).json({ message: 'No fields to update.' });
  }

  values.push(userId); // Add userId to the end for the WHERE clause

  try {
    const updateSql = `UPDATE users SET ${fieldsToUpdate.join(', ')} WHERE id=?`;
    console.log('Executing SQL:', updateSql, 'with values:', values);
    const result = await db.query(
      updateSql,
      values
    );
    console.log('Update query result:', result);
    res.status(200).json({ message: "Profile updated successfully." });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: "Database error.", error });
  }
};

// Get all students for admin view
exports.getAllStudents = async (req, res) => {
  console.log('Attempting to fetch all students...');
  try {
    const students = await db.query('SELECT id, full_name, roll_number, course, branch FROM users WHERE role = 0'); // Assuming role 0 is for students
    console.log('Fetched students successfully.', students.length, 'students found.');
    res.status(200).json({ students });
  } catch (error) {
    console.error('Error fetching all students:', error);
    res.status(500).json({ message: "Database error.", error });
  }
};

// Get single student by ID for admin view
exports.getStudentById = async (req, res) => {
  const studentId = req.params.id;
  try {
    const student = await db.query('SELECT id, full_name, username, roll_number, phone_number, course, branch, gender, email_id FROM users WHERE id = ? AND role = 0', [studentId]);
    if (student.length === 0) return res.status(404).json({ message: 'Student not found.' });
    res.status(200).json({ student: student[0] });
  } catch (error) {
    console.error('Error fetching student by ID:', error);
    res.status(500).json({ message: "Database error.", error });
  }
};

// Example: apply for certificate (from your code)
exports.applyCertificate = async (req, res) => {
  const { userId, certificateType } = req.body;
  try {
    await db.query('INSERT INTO certificate_requests (user_id, certificate_type, status) VALUES (?, ?, "pending")', [userId, certificateType]);
    res.status(201).json({ message: 'Certificate application submitted.' });
  } catch (error) {
    res.status(500).json({ message: 'Database error.' });
  }
};