const router = require("express").Router();
const pool = require("../config/database");
const { verifyToken } = require("../middleware/auth");

// Helper function untuk validasi slug
function isValidSlug(slug) {
  return slug === "" || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

// Helper function untuk validasi content blocks
function validateContentBlocks(blocks) {
  if (!Array.isArray(blocks)) return false;

  const validTypes = [
    "hero",
    "text",
    "features",
    "stats",
    "gallery",
    "cta",
    // additional page-specific blocks
    "about",
    "program",
    "news",
    "contact",
    "partners",
    "statistics",
    "pagehero",
    "highlights",
    "timeline",
    "achievements",
    "aboutdetail",
    "bento",
    "programs",
    "facilities",
    "kerjasama",
    "documents",
  ];

  return blocks.every((block) => {
    if (!block.type || !validTypes.includes(block.type)) return false;
    if (typeof block.data !== "object" || block.data === null) return false;
    return true;
  });
}

const ROOT_PAGE_SLUG = "";

// Default block definitions for the `beranda` page.
function getDefaultBerandaBlocks() {
  return [
    {
      type: "hero",
      data: {
        badge: "",
        title: "",
        subtitle: "",
        description: "",
        image: "",
        button_text: "",
        button_link: "",
        stats_badge: "",
        stats: [],
        stats_footer: "",
      },
    },
    {
      type: "about",
      data: {
        title: "",
        description: "",
        statistics: [],
      },
    },
    {
      type: "statistics",
      data: {
        cards: [],
      },
    },
    {
      type: "program",
      data: {
        badge: "",
        title: "",
        subtitle: "",
        bentoItems: [],
        programs: [],
        facilities: [],
        kerjasama: [],
      },
    },
    {
      type: "news",
      data: {
        headline: null,
        featured: [],
        items: [],
      },
    },
    {
      type: "gallery",
      data: {
        title: "",
        images: [],
      },
    },
    {
      type: "contact",
      data: {
        title: "",
        address: "",
        phone: "",
        email: "",
        map: "",
      },
    },
    {
      type: "partners",
      data: {
        title: "",
        items: [],
      },
    },
    {
      type: "cta",
      data: {
        title: "",
        subtitle: "",
        description: "",
        button: { label: "", link: "" },
        image: "",
      },
    },
  ];
}

function ensureBerandaContent(blocks) {
  const defaults = getDefaultBerandaBlocks();
  const map = new Map();
  if (Array.isArray(blocks)) {
    for (const b of blocks) {
      if (b && b.type) map.set(b.type, b.data || {});
    }
  }

  // Merge: keep existing data when present, otherwise use default
  return defaults.map((def) => {
    const existing = map.get(def.type);
    if (!existing) return { type: def.type, data: def.data };
    // shallow merge so admin-supplied fields are preserved
    return { type: def.type, data: { ...def.data, ...existing } };
  });
}

async function getRootPage(req, res, next) {
  try {
    const [pages] = await pool.query("SELECT * FROM pages WHERE slug = ?", [
      ROOT_PAGE_SLUG,
    ]);

    if (pages.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Halaman root tidak ditemukan",
        code: "PAGE_NOT_FOUND",
      });
    }

    const page = pages[0];
    page.content =
      typeof page.content === "string"
        ? JSON.parse(page.content)
        : page.content;

    res.json({ success: true, data: page });
  } catch (err) {
    console.error("[PAGES] Error saat mengambil halaman root:", err);
    next(err);
  }
}

async function upsertRootPage(req, res, next) {
  try {
    const { title, content, published } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title dan content wajib diisi",
        code: "VALIDATION_ERROR",
      });
    }

    if (!validateContentBlocks(content)) {
      return res.status(400).json({
        success: false,
        message:
          "Format content tidak valid. Setiap block harus memiliki type dan data",
        code: "INVALID_CONTENT_FORMAT",
      });
    }

    const [existing] = await pool.query("SELECT id FROM pages WHERE slug = ?", [
      ROOT_PAGE_SLUG,
    ]);

    const contentJson = JSON.stringify(content);

    if (existing.length === 0) {
      const [result] = await pool.query(
        "INSERT INTO pages (slug, title, content, published) VALUES (?, ?, ?, ?)",
        [ROOT_PAGE_SLUG, title, contentJson, published ?? true],
      );

      console.log(`[PAGES] Halaman root dibuat: (ID: ${result.insertId})`);

      return res.status(201).json({
        success: true,
        message: "Halaman root berhasil dibuat",
        data: { id: result.insertId },
      });
    }

    await pool.query(
      "UPDATE pages SET title = ?, content = ?, published = ?, updated_at = NOW() WHERE slug = ?",
      [title, contentJson, published ?? true, ROOT_PAGE_SLUG],
    );

    console.log("[PAGES] Halaman root diperbarui");

    res.json({
      success: true,
      message: "Halaman root berhasil diperbarui",
    });
  } catch (err) {
    console.error("[PAGES] Error saat memperbarui halaman root:", err);
    next(err);
  }
}

async function deleteRootPage(req, res, next) {
  try {
    const [existing] = await pool.query("SELECT id FROM pages WHERE slug = ?", [
      ROOT_PAGE_SLUG,
    ]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Halaman root tidak ditemukan",
        code: "PAGE_NOT_FOUND",
      });
    }

    await pool.query("DELETE FROM pages WHERE slug = ?", [ROOT_PAGE_SLUG]);
    console.log("[PAGES] Halaman root dihapus");

    res.json({
      success: true,
      message: "Halaman root berhasil dihapus",
    });
  } catch (err) {
    console.error("[PAGES] Error saat menghapus halaman root:", err);
    next(err);
  }
}

async function publishRootPage(req, res, next) {
  try {
    const [existing] = await pool.query("SELECT id FROM pages WHERE slug = ?", [
      ROOT_PAGE_SLUG,
    ]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Halaman root tidak ditemukan",
        code: "PAGE_NOT_FOUND",
      });
    }

    await pool.query(
      "UPDATE pages SET published = true, updated_at = NOW() WHERE slug = ?",
      [ROOT_PAGE_SLUG],
    );

    console.log("[PAGES] Halaman root dipublikasikan");

    res.json({
      success: true,
      message: "Halaman root berhasil dipublikasikan",
    });
  } catch (err) {
    console.error("[PAGES] Error saat mempublikasikan halaman root:", err);
    next(err);
  }
}

async function unpublishRootPage(req, res, next) {
  try {
    const [existing] = await pool.query("SELECT id FROM pages WHERE slug = ?", [
      ROOT_PAGE_SLUG,
    ]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Halaman root tidak ditemukan",
        code: "PAGE_NOT_FOUND",
      });
    }

    await pool.query(
      "UPDATE pages SET published = false, updated_at = NOW() WHERE slug = ?",
      [ROOT_PAGE_SLUG],
    );

    console.log("[PAGES] Publikasi halaman root dibatalkan");

    res.json({
      success: true,
      message: "Publikasi halaman root berhasil dibatalkan",
    });
  } catch (err) {
    console.error(
      "[PAGES] Error saat membatalkan publikasi halaman root:",
      err,
    );
    next(err);
  }
}

// GET /api/pages - List semua halaman
router.get("/", async (req, res, next) => {
  try {
    const [pages] = await pool.query(
      "SELECT id, slug, title, published, updated_at FROM pages ORDER BY updated_at DESC",
    );

    console.log(`[PAGES] Daftar halaman diambil: ${pages.length} halaman`);

    res.json({ success: true, data: pages });
  } catch (err) {
    console.error("[PAGES] Error saat mengambil daftar halaman:", err);
    next(err);
  }
});

// GET /api/pages/root - Ambil halaman root (home) berdasarkan slug kosong
router.get("/root", async (req, res, next) => {
  return getRootPage(req, res, next);
});

// PUT /api/pages/root - Update halaman root (home)
router.put("/root", verifyToken, async (req, res, next) => {
  return upsertRootPage(req, res, next);
});

// DELETE /api/pages/root - Hapus halaman root
router.delete("/root", verifyToken, async (req, res, next) => {
  return deleteRootPage(req, res, next);
});

// POST /api/pages/root/publish - Publikasikan halaman root
router.post("/root/publish", verifyToken, async (req, res, next) => {
  return publishRootPage(req, res, next);
});

// POST /api/pages/root/unpublish - Batalkan publikasi halaman root
router.post("/root/unpublish", verifyToken, async (req, res, next) => {
  return unpublishRootPage(req, res, next);
});

// GET /api/pages/:slug - Ambil halaman berdasarkan slug
router.get("/:slug", async (req, res, next) => {
  try {
    const rawSlug = req.params.slug;
    const slug = rawSlug === "beranda" ? ROOT_PAGE_SLUG : rawSlug;

    const [pages] = await pool.query("SELECT * FROM pages WHERE slug = ?", [
      slug,
    ]);

    if (pages.length === 0) {
      console.warn(`[PAGES] Halaman dengan slug "${slug}" tidak ditemukan`);
      return res.status(404).json({
        success: false,
        message: "Halaman tidak ditemukan",
        code: "PAGE_NOT_FOUND",
      });
    }

    let page = pages[0];
    page.content =
      typeof page.content === "string"
        ? JSON.parse(page.content)
        : page.content;

    // If requested page is the root (or legacy 'beranda'), ensure all required blocks exist
    if (slug === ROOT_PAGE_SLUG || slug === "beranda") {
      page.content = ensureBerandaContent(page.content);
    }

    res.json({ success: true, data: page });
  } catch (err) {
    console.error("[PAGES] Error saat mengambil halaman:", err);
    next(err);
  }
});

// POST /api/pages - Buat halaman baru
router.post("/", verifyToken, async (req, res, next) => {
  try {
    const { slug, title, content, published } = req.body;
    // Normalize legacy 'beranda' to canonical root slug "" to avoid creating 'beranda'
    const normalizedSlug = slug === "beranda" ? ROOT_PAGE_SLUG : slug;

    // Validasi input
    if (slug === undefined || slug === null || !title || !content) {
      return res.status(400).json({
        success: false,
        message: "Slug, title, dan content wajib diisi",
        code: "VALIDATION_ERROR",
      });
    }

    // Validasi slug format
    if (!isValidSlug(normalizedSlug)) {
      return res.status(400).json({
        success: false,
        message:
          "Slug hanya boleh mengandung huruf kecil, angka, dan tanda hubung",
        code: "INVALID_SLUG_FORMAT",
      });
    }

    // Jika membuat halaman beranda (root or legacy 'beranda'), isi default block jika perlu
    let finalContent = content;
    if (normalizedSlug === ROOT_PAGE_SLUG) {
      finalContent = ensureBerandaContent(
        Array.isArray(content) ? content : [],
      );
    }

    // Validasi content blocks
    if (!validateContentBlocks(finalContent)) {
      return res.status(400).json({
        success: false,
        message:
          "Format content tidak valid. Setiap block harus memiliki type dan data",
        code: "INVALID_CONTENT_FORMAT",
      });
    }

    // Cek apakah slug sudah ada
    const [existing] = await pool.query("SELECT id FROM pages WHERE slug = ?", [
      normalizedSlug,
    ]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Slug sudah digunakan oleh halaman lain",
        code: "SLUG_ALREADY_EXISTS",
      });
    }

    // Buat halaman baru
    const contentJson = JSON.stringify(finalContent);
    const [result] = await pool.query(
      "INSERT INTO pages (slug, title, content, published) VALUES (?, ?, ?, ?)",
      [normalizedSlug, title, contentJson, published ?? true],
    );

    console.log(
      `[PAGES] Halaman baru dibuat: "${slug}" (ID: ${result.insertId})`,
    );

    res.status(201).json({
      success: true,
      message: "Halaman berhasil dibuat",
      data: {
        id: result.insertId,
        slug: normalizedSlug,
        title,
        published: published ?? true,
      },
    });
  } catch (err) {
    console.error("[PAGES] Error saat membuat halaman:", err);
    next(err);
  }
});

// PUT /api/pages/:slug - Update halaman
router.put("/:slug", verifyToken, async (req, res, next) => {
  try {
    const rawSlug = req.params.slug;
    const slug = rawSlug === "beranda" ? ROOT_PAGE_SLUG : rawSlug;
    const { title, content, published } = req.body;

    // Validasi input
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title dan content wajib diisi",
        code: "VALIDATION_ERROR",
      });
    }

    // Validasi content blocks (special-case root/legacy 'beranda')
    let finalContent = content;
    if (slug === ROOT_PAGE_SLUG || slug === "beranda") {
      finalContent = ensureBerandaContent(
        Array.isArray(content) ? content : [],
      );
    }

    if (!validateContentBlocks(finalContent)) {
      return res.status(400).json({
        success: false,
        message:
          "Format content tidak valid. Setiap block harus memiliki type dan data",
        code: "INVALID_CONTENT_FORMAT",
      });
    }

    // Cek apakah halaman ada
    const [existing] = await pool.query("SELECT id FROM pages WHERE slug = ?", [
      slug,
    ]);
    if (existing.length === 0) {
      // Jika belum ada, buat halaman baru (backward compatibility)
      const contentJson = JSON.stringify(finalContent);
      const [result] = await pool.query(
        "INSERT INTO pages (slug, title, content, published) VALUES (?, ?, ?, ?)",
        [slug, title, contentJson, published ?? true],
      );

      console.log(
        `[PAGES] Halaman baru dibuat (via PUT): "${slug}" (ID: ${result.insertId})`,
      );

      return res.status(201).json({
        success: true,
        message: "Halaman berhasil dibuat",
        data: { id: result.insertId },
      });
    }

    // Update halaman
    const contentJson = JSON.stringify(content);
    await pool.query(
      "UPDATE pages SET title = ?, content = ?, published = ?, updated_at = NOW() WHERE slug = ?",
      [title, contentJson, published ?? true, slug],
    );

    console.log(`[PAGES] Halaman diperbarui: "${slug}"`);

    res.json({
      success: true,
      message: "Halaman berhasil diperbarui",
    });
  } catch (err) {
    console.error("[PAGES] Error saat memperbarui halaman:", err);
    next(err);
  }
});

// PATCH /api/pages/:slug/slug - Update slug halaman
router.patch("/:slug/slug", verifyToken, async (req, res, next) => {
  try {
    const rawSlug = req.params.slug;
    const slug = rawSlug === "beranda" ? ROOT_PAGE_SLUG : rawSlug;

    // Cegah rename slug beranda
    if (slug === ROOT_PAGE_SLUG) {
      return res.status(400).json({
        success: false,
        message: "Slug halaman beranda tidak dapat diubah",
        code: "CANNOT_CHANGE_ROOT_SLUG",
      });
    }

    const { new_slug } = req.body;
    const normalizedSlug = new_slug === "beranda" ? ROOT_PAGE_SLUG : new_slug;

    if (!normalizedSlug || normalizedSlug === "") {
      return res.status(400).json({
        success: false,
        message: "Slug baru wajib diisi",
        code: "VALIDATION_ERROR",
      });
    }

    if (!isValidSlug(normalizedSlug)) {
      return res.status(400).json({
        success: false,
        message: "Slug hanya boleh mengandung huruf kecil, angka, dan tanda hubung",
        code: "INVALID_SLUG_FORMAT",
      });
    }

    // Cek apakah halaman lama ada
    const [existing] = await pool.query("SELECT id FROM pages WHERE slug = ?", [slug]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Halaman tidak ditemukan",
        code: "PAGE_NOT_FOUND",
      });
    }

    // Cek apakah slug baru sudah dipakai
    const [duplicate] = await pool.query("SELECT id FROM pages WHERE slug = ? AND id != ?", [
      normalizedSlug,
      existing[0].id,
    ]);
    if (duplicate.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Slug sudah digunakan oleh halaman lain",
        code: "SLUG_ALREADY_EXISTS",
      });
    }

    await pool.query("UPDATE pages SET slug = ?, updated_at = NOW() WHERE id = ?", [
      normalizedSlug,
      existing[0].id,
    ]);

    console.log(`[PAGES] Slug halaman diubah: "${slug}" → "${normalizedSlug}"`);

    res.json({
      success: true,
      message: "Slug berhasil diperbarui",
      data: { slug: normalizedSlug },
    });
  } catch (err) {
    console.error("[PAGES] Error saat mengubah slug:", err);
    next(err);
  }
});

// DELETE /api/pages/:slug - Hapus halaman
router.delete("/:slug", verifyToken, async (req, res, next) => {
  try {
    const rawSlug = req.params.slug;
    const slug = rawSlug === "beranda" ? ROOT_PAGE_SLUG : rawSlug;

    // Cek apakah halaman ada
    const [existing] = await pool.query("SELECT id FROM pages WHERE slug = ?", [
      slug,
    ]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Halaman tidak ditemukan",
        code: "PAGE_NOT_FOUND",
      });
    }

    // Hapus halaman
    await pool.query("DELETE FROM pages WHERE slug = ?", [slug]);

    console.log(`[PAGES] Halaman dihapus: "${slug}"`);

    res.json({
      success: true,
      message: "Halaman berhasil dihapus",
    });
  } catch (err) {
    console.error("[PAGES] Error saat menghapus halaman:", err);
    next(err);
  }
});

// POST /api/pages/:slug/publish - Publikasikan halaman
router.post("/:slug/publish", verifyToken, async (req, res, next) => {
  try {
    const rawSlug = req.params.slug;
    const slug = rawSlug === "beranda" ? ROOT_PAGE_SLUG : rawSlug;

    // Cek apakah halaman ada
    const [existing] = await pool.query("SELECT id FROM pages WHERE slug = ?", [
      slug,
    ]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Halaman tidak ditemukan",
        code: "PAGE_NOT_FOUND",
      });
    }

    // Publikasikan halaman
    await pool.query(
      "UPDATE pages SET published = true, updated_at = NOW() WHERE slug = ?",
      [slug],
    );

    console.log(`[PAGES] Halaman dipublikasikan: "${slug}"`);

    res.json({
      success: true,
      message: "Halaman berhasil dipublikasikan",
    });
  } catch (err) {
    console.error("[PAGES] Error saat mempublikasikan halaman:", err);
    next(err);
  }
});

// POST /api/pages/:slug/unpublish - Batalkan publikasi halaman
router.post("/:slug/unpublish", verifyToken, async (req, res, next) => {
  try {
    const rawSlug = req.params.slug;
    const slug = rawSlug === "beranda" ? ROOT_PAGE_SLUG : rawSlug;

    // Cek apakah halaman ada
    const [existing] = await pool.query("SELECT id FROM pages WHERE slug = ?", [
      slug,
    ]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Halaman tidak ditemukan",
        code: "PAGE_NOT_FOUND",
      });
    }

    // Batalkan publikasi halaman
    await pool.query(
      "UPDATE pages SET published = false, updated_at = NOW() WHERE slug = ?",
      [slug],
    );

    console.log(`[PAGES] Publikasi halaman dibatalkan: "${slug}"`);

    res.json({
      success: true,
      message: "Publikasi halaman berhasil dibatalkan",
    });
  } catch (err) {
    console.error("[PAGES] Error saat membatalkan publikasi halaman:", err);
    next(err);
  }
});

module.exports = router;
