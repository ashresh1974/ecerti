require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Serve static files (certificates)
app.use('/certificates', express.static(path.join(__dirname, '../public/certificates')));

// Serve static files (templates)
app.use('/templates', express.static(path.join(__dirname, '../public/templates')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecretkey',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, sameSite: 'Lax' } // Set to true if using https
}));

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  console.log('isAuthenticated middleware triggered for path:', req.path);
  console.log('req.sessionID:', req.sessionID);
  console.log('req.session.user:', req.session.user);
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized: Session expired or not authenticated.' });
  }
};

// ✅ ADD THIS: Log all incoming requests with body data
app.use((req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log(`📋 [${req.method}] ${req.path} =>`, req.body);
  }
  next();
});

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const certificateRoutes = require('../src/routes/certificate');
const templatesRoutes = require('../src/routes/templates');

app.use('/api', authRoutes);
app.use('/api', isAuthenticated, userRoutes);
app.use('/api/certificate', isAuthenticated, certificateRoutes);
app.use('/api/templates', isAuthenticated, templatesRoutes);

app.get('/', (req, res) => {
  res.send('e-Certificate Management System Backend');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
