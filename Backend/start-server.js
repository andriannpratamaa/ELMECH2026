#!/usr/bin/env node

/**
 * Start Backend-cms server for testing
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/pages', require('./src/routes/pageRoutes'));
app.use('/api/upload', require('./src/routes/uploadRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'OK',
    message: 'Server CMS berjalan dengan baik',
    timestamp: new Date().toISOString()
  });
});

// 404 Handler
app.use((req, res) => {
  console.warn(`[404] Rute tidak ditemukan: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    message: 'Rute tidak ditemukan',
    code: 'ROUTE_NOT_FOUND',
    path: req.path
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.name || 'UnknownError'}:`, err.message);

  let statusCode = 500;
  let errorCode = 'INTERNAL_SERVER_ERROR';
  let message = 'Terjadi kesalahan pada server';

  if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    errorCode = 'DUPLICATE_ENTRY';
    message = 'Data sudah ada di database';
  } else if (err.code === 'ER_NO_REFERENCED_ROW') {
    statusCode = 400;
    errorCode = 'INVALID_REFERENCE';
    message = 'Referensi tidak valid';
  } else if (err.code && err.code.startsWith('ER_')) {
    statusCode = 400;
    errorCode = 'DATABASE_ERROR';
    message = `Error database: ${err.message}`;
  }

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    errorCode = 'INVALID_JSON';
    message = 'Format JSON tidak valid';
  }

  const response = {
    success: false,
    message,
    code: errorCode,
    ...(process.env.NODE_ENV === 'development' && {
      details: err.message,
      stack: err.stack.split('\n')
    })
  };

  res.status(statusCode).json(response);
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`\n🚀 CMS Server running on port ${PORT}`);
  console.log(`📝 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

module.exports = app;
