require('dotenv').config();
const nodemailer = require('nodemailer');

const tlsOptions = {};

// Allow self-signed certificates in non-production environments
if (process.env.NODE_ENV !== 'production') {
  tlsOptions.rejectUnauthorized = false;
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: tlsOptions,
});

module.exports = transporter;
