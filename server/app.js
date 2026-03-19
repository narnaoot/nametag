require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/profiles', require('./routes/profile'));
app.use('/api/admin', require('./routes/admin'));

app.get('/api/health', (req, res) => res.json({ ok: true }));

// Global error handler — catches multer errors and any other middleware errors
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'Photo must be under 5 MB' });
  }
  if (err.message === 'Only images allowed') {
    return res.status(400).json({ error: 'Only image files are allowed' });
  }
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

module.exports = app;
