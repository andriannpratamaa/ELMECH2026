const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { verifyToken } = require('../middleware/auth');

// POST /api/auth/login - Login user
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password wajib diisi',
        code: 'VALIDATION_ERROR'
      });
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Format email tidak valid',
        code: 'INVALID_EMAIL_FORMAT'
      });
    }

    // Cari user berdasarkan email
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      console.warn(`[AUTH] Login gagal: email "${email}" tidak ditemukan`);
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah',
        code: 'INVALID_CREDENTIALS'
      });
    }

    const user = users[0];

    // Verifikasi password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      console.warn(`[AUTH] Login gagal: password salah untuk email "${email}"`);
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    console.log(`[AUTH] Login berhasil: user "${user.email}" (ID: ${user.id})`);

    res.json({
      success: true,
      message: 'Login berhasil',
      data: {
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      },
    });
  } catch (err) {
    console.error('[AUTH] Error saat login:', err);
    next(err);
  }
});

// GET /api/auth/me - Get current user profile
router.get('/me', verifyToken, async (req, res, next) => {
  try {
    const [users] = await pool.query('SELECT id, name, email, role FROM users WHERE id = ?', [req.user.id]);
    
    if (users.length === 0) {
      console.warn(`[AUTH] User dengan ID ${req.user.id} tidak ditemukan`);
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: users[0]
    });
  } catch (err) {
    console.error('[AUTH] Error saat mendapatkan profil user:', err);
    next(err);
  }
});

// POST /api/auth/logout - Logout user (client-side implementation)
router.post('/logout', verifyToken, async (req, res) => {
  try {
    console.log(`[AUTH] Logout berhasil: user "${req.user.email}" (ID: ${req.user.id})`);
    res.json({
      success: true,
      message: 'Logout berhasil'
    });
  } catch (err) {
    console.error('[AUTH] Error saat logout:', err);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat logout',
      code: 'LOGOUT_ERROR'
    });
  }
});

// POST /api/auth/register - Register user (admin only)
router.post('/register', verifyToken, async (req, res, next) => {
  try {
    // Hanya admin yang bisa register user baru
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Hanya admin yang dapat membuat user baru',
        code: 'FORBIDDEN'
      });
    }

    const { name, email, password } = req.body;

    // Validasi input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nama, email, dan password wajib diisi',
        code: 'VALIDATION_ERROR'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password minimal 6 karakter',
        code: 'WEAK_PASSWORD'
      });
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Format email tidak valid',
        code: 'INVALID_EMAIL_FORMAT'
      });
    }

    // Cek apakah email sudah terdaftar
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email sudah terdaftar',
        code: 'EMAIL_ALREADY_EXISTS'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat user baru
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'admin']
    );

    console.log(`[AUTH] User baru terdaftar: "${email}" (ID: ${result.insertId})`);

    res.status(201).json({
      success: true,
      message: 'User berhasil dibuat',
      data: { id: result.insertId, name, email }
    });
  } catch (err) {
    console.error('[AUTH] Error saat register:', err);
    next(err);
  }
});

module.exports = router;
