const jwt = require('jsonwebtoken');

/**
 * Middleware untuk memverifikasi JWT token
 * Digunakan pada endpoint yang memerlukan autentikasi
 */
const verifyToken = (req, res, next) => {
  try {
    // Ambil token dari header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      console.warn('[AUTH] Request tanpa Authorization header');
      return res.status(401).json({
        success: false,
        message: 'Token tidak ditemukan. Gunakan header Authorization: Bearer <token>',
        code: 'NO_TOKEN'
      });
    }

    // Format: "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      console.warn('[AUTH] Format Authorization header tidak valid');
      return res.status(401).json({
        success: false,
        message: 'Format token tidak valid. Gunakan: Authorization: Bearer <token>',
        code: 'INVALID_TOKEN_FORMAT'
      });
    }

    const token = parts[1];

    // Verifikasi token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      req.user = decoded;
      console.log(`[AUTH] Token terverifikasi untuk user: "${decoded.email}"`);
      next();
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        console.warn('[AUTH] Token sudah kadaluarsa');
        return res.status(401).json({
          success: false,
          message: 'Token sudah kadaluarsa',
          code: 'TOKEN_EXPIRED'
        });
      } else if (jwtErr.name === 'JsonWebTokenError') {
        console.warn('[AUTH] Token tidak valid:', jwtErr.message);
        return res.status(403).json({
          success: false,
          message: 'Token tidak valid',
          code: 'INVALID_TOKEN'
        });
      }
      throw jwtErr;
    }
  } catch (err) {
    console.error('[AUTH] Error saat verifikasi token:', err);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat verifikasi token',
      code: 'VERIFICATION_ERROR'
    });
  }
};

module.exports = { verifyToken };
