const router = require('express').Router();
const pool = require('../config/database');
const { verifyToken } = require('../middleware/auth');

// Helper function untuk validasi slug
function isValidSlug(slug) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

// Helper function untuk validasi content blocks
function validateContentBlocks(blocks) {
  if (!Array.isArray(blocks)) return false;
  
  const validTypes = ['hero', 'text', 'features', 'stats', 'gallery', 'cta'];
  
  return blocks.every(block => {
    if (!block.type || !validTypes.includes(block.type)) return false;
    if (typeof block.data !== 'object' || block.data === null) return false;
    return true;
  });
}

// GET /api/pages - List semua halaman
router.get('/', async (req, res, next) => {
  try {
    const [pages] = await pool.query(
      'SELECT id, slug, title, published, updated_at FROM pages ORDER BY updated_at DESC'
    );
    
    console.log(`[PAGES] Daftar halaman diambil: ${pages.length} halaman`);
    
    res.json({ success: true, data: pages });
  } catch (err) {
    console.error('[PAGES] Error saat mengambil daftar halaman:', err);
    next(err);
  }
});

// GET /api/pages/:slug - Ambil halaman berdasarkan slug
router.get('/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;

    const [pages] = await pool.query('SELECT * FROM pages WHERE slug = ?', [slug]);
    
    if (pages.length === 0) {
      console.warn(`[PAGES] Halaman dengan slug "${slug}" tidak ditemukan`);
      return res.status(404).json({
        success: false,
        message: 'Halaman tidak ditemukan',
        code: 'PAGE_NOT_FOUND'
      });
    }

    const page = pages[0];
    page.content = typeof page.content === 'string' ? JSON.parse(page.content) : page.content;

    res.json({ success: true, data: page });
  } catch (err) {
    console.error('[PAGES] Error saat mengambil halaman:', err);
    next(err);
  }
});

// POST /api/pages - Buat halaman baru
router.post('/', verifyToken, async (req, res, next) => {
  try {
    const { slug, title, content, published } = req.body;

    // Validasi input
    if (!slug || !title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Slug, title, dan content wajib diisi',
        code: 'VALIDATION_ERROR'
      });
    }

    // Validasi slug format
    if (!isValidSlug(slug)) {
      return res.status(400).json({
        success: false,
        message: 'Slug hanya boleh mengandung huruf kecil, angka, dan tanda hubung',
        code: 'INVALID_SLUG_FORMAT'
      });
    }

    // Validasi content blocks
    if (!validateContentBlocks(content)) {
      return res.status(400).json({
        success: false,
        message: 'Format content tidak valid. Setiap block harus memiliki type dan data',
        code: 'INVALID_CONTENT_FORMAT'
      });
    }

    // Cek apakah slug sudah ada
    const [existing] = await pool.query('SELECT id FROM pages WHERE slug = ?', [slug]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Slug sudah digunakan oleh halaman lain',
        code: 'SLUG_ALREADY_EXISTS'
      });
    }

    // Buat halaman baru
    const contentJson = JSON.stringify(content);
    const [result] = await pool.query(
      'INSERT INTO pages (slug, title, content, published) VALUES (?, ?, ?, ?)',
      [slug, title, contentJson, published ?? true]
    );

    console.log(`[PAGES] Halaman baru dibuat: "${slug}" (ID: ${result.insertId})`);

    res.status(201).json({
      success: true,
      message: 'Halaman berhasil dibuat',
      data: { id: result.insertId, slug, title, published: published ?? true }
    });
  } catch (err) {
    console.error('[PAGES] Error saat membuat halaman:', err);
    next(err);
  }
});

// PUT /api/pages/:slug - Update halaman
router.put('/:slug', verifyToken, async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { title, content, published } = req.body;

    // Validasi input
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title dan content wajib diisi',
        code: 'VALIDATION_ERROR'
      });
    }

    // Validasi content blocks
    if (!validateContentBlocks(content)) {
      return res.status(400).json({
        success: false,
        message: 'Format content tidak valid. Setiap block harus memiliki type dan data',
        code: 'INVALID_CONTENT_FORMAT'
      });
    }

    // Cek apakah halaman ada
    const [existing] = await pool.query('SELECT id FROM pages WHERE slug = ?', [slug]);
    if (existing.length === 0) {
      // Jika belum ada, buat halaman baru (backward compatibility)
      const contentJson = JSON.stringify(content);
      const [result] = await pool.query(
        'INSERT INTO pages (slug, title, content, published) VALUES (?, ?, ?, ?)',
        [slug, title, contentJson, published ?? true]
      );
      
      console.log(`[PAGES] Halaman baru dibuat (via PUT): "${slug}" (ID: ${result.insertId})`);
      
      return res.status(201).json({
        success: true,
        message: 'Halaman berhasil dibuat',
        data: { id: result.insertId }
      });
    }

    // Update halaman
    const contentJson = JSON.stringify(content);
    await pool.query(
      'UPDATE pages SET title = ?, content = ?, published = ?, updated_at = NOW() WHERE slug = ?',
      [title, contentJson, published ?? true, slug]
    );

    console.log(`[PAGES] Halaman diperbarui: "${slug}"`);

    res.json({
      success: true,
      message: 'Halaman berhasil diperbarui'
    });
  } catch (err) {
    console.error('[PAGES] Error saat memperbarui halaman:', err);
    next(err);
  }
});

// DELETE /api/pages/:slug - Hapus halaman
router.delete('/:slug', verifyToken, async (req, res, next) => {
  try {
    const { slug } = req.params;

    // Cek apakah halaman ada
    const [existing] = await pool.query('SELECT id FROM pages WHERE slug = ?', [slug]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Halaman tidak ditemukan',
        code: 'PAGE_NOT_FOUND'
      });
    }

    // Hapus halaman
    await pool.query('DELETE FROM pages WHERE slug = ?', [slug]);

    console.log(`[PAGES] Halaman dihapus: "${slug}"`);

    res.json({
      success: true,
      message: 'Halaman berhasil dihapus'
    });
  } catch (err) {
    console.error('[PAGES] Error saat menghapus halaman:', err);
    next(err);
  }
});

// POST /api/pages/:slug/publish - Publikasikan halaman
router.post('/:slug/publish', verifyToken, async (req, res, next) => {
  try {
    const { slug } = req.params;

    // Cek apakah halaman ada
    const [existing] = await pool.query('SELECT id FROM pages WHERE slug = ?', [slug]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Halaman tidak ditemukan',
        code: 'PAGE_NOT_FOUND'
      });
    }

    // Publikasikan halaman
    await pool.query(
      'UPDATE pages SET published = true, updated_at = NOW() WHERE slug = ?',
      [slug]
    );

    console.log(`[PAGES] Halaman dipublikasikan: "${slug}"`);

    res.json({
      success: true,
      message: 'Halaman berhasil dipublikasikan'
    });
  } catch (err) {
    console.error('[PAGES] Error saat mempublikasikan halaman:', err);
    next(err);
  }
});

// POST /api/pages/:slug/unpublish - Batalkan publikasi halaman
router.post('/:slug/unpublish', verifyToken, async (req, res, next) => {
  try {
    const { slug } = req.params;

    // Cek apakah halaman ada
    const [existing] = await pool.query('SELECT id FROM pages WHERE slug = ?', [slug]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Halaman tidak ditemukan',
        code: 'PAGE_NOT_FOUND'
      });
    }

    // Batalkan publikasi halaman
    await pool.query(
      'UPDATE pages SET published = false, updated_at = NOW() WHERE slug = ?',
      [slug]
    );

    console.log(`[PAGES] Publikasi halaman dibatalkan: "${slug}"`);

    res.json({
      success: true,
      message: 'Publikasi halaman berhasil dibatalkan'
    });
  } catch (err) {
    console.error('[PAGES] Error saat membatalkan publikasi halaman:', err);
    next(err);
  }
});

module.exports = router;
