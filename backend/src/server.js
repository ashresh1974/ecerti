require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

app.use('/api', authRoutes);
app.use('/api', userRoutes);

app.get('/', (req, res) => {
  res.send('e-Certificate Management System Backend');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
