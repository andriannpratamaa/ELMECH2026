const router = require("express").Router();
const pool = require("../config/database");
const { verifyToken } = require("../middleware/auth");

const schemaCache = {};

const hasNavbarColumn = async (column) => {
  if (schemaCache[column] !== undefined) {
    return schemaCache[column];
  }

  const [rows] = await pool.query("SHOW COLUMNS FROM navbar_items LIKE ?", [
    column,
  ]);

  schemaCache[column] = rows.length > 0;
  return schemaCache[column];
};

const normalizeNavbarItem = (item) => {
  // Determine page slug (prefer explicit page_slug, then joined page slug)
  let page_slug = item.page_slug ?? item.page_slug_from_page ?? null;

  // Normalize homepage: if slug is empty string, treat as root
  if (page_slug === "") {
    page_slug = ""; // keep empty to indicate home
  }

  // Build href: if we have a page_slug (including empty string for home), map to '/'
  let href = null;
  if (page_slug !== null) {
    href = page_slug === "" ? "/" : `/${page_slug}`;
  } else {
    href = item.href ?? null;
  }

  return { ...item, page_slug, href };
};

const getNavbarItemsSelect = async (includeActive = true) => {
  const selectFields = ["ni.id", "ni.label", "ni.order_index", "ni.parent_id"];

  if (await hasNavbarColumn("active")) {
    selectFields.push("ni.active");
  }

  const hasPageId = await hasNavbarColumn("page_id");
  const hasPageSlug = await hasNavbarColumn("page_slug");
  const hasHref = await hasNavbarColumn("href");

  if (hasPageId) {
    selectFields.push("ni.page_id");
    selectFields.push("p.slug as page_slug_from_page");
  }
  if (hasPageSlug) {
    selectFields.push("ni.page_slug");
  }
  if (hasHref) {
    selectFields.push("ni.href");
  }

  const joinClause = hasPageId ? "LEFT JOIN pages p ON p.id = ni.page_id" : "";

  // Build WHERE conditions safely to allow multiple filters (active + published)
  const conditions = [];
  if (includeActive) conditions.push("ni.active = 1");
  // If navbar item links to a page (page_id present) and we're fetching public items,
  // ensure the linked page is published so public navbar doesn't show links to unpublished pages.
  if (hasPageId && includeActive) conditions.push("p.published = 1");

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const [items] = await pool.query(
    `SELECT ${selectFields.join(", ")}
       FROM navbar_items ni
       ${joinClause}
       ${whereClause}
       ORDER BY ni.parent_id ASC, ni.order_index ASC`,
  );

  return items.map(normalizeNavbarItem);
};

// Helper function to build hierarchical navbar
const buildNavbarHierarchy = (items) => {
  const itemMap = new Map();
  const rootItems = [];

  // Create map of all items
  items.forEach((item) => {
    itemMap.set(item.id, { ...item, children: [] });
  });

  // Build hierarchy
  items.forEach((item) => {
    if (item.parent_id === null) {
      rootItems.push(itemMap.get(item.id));
    } else if (itemMap.has(item.parent_id)) {
      itemMap.get(item.parent_id).children.push(itemMap.get(item.id));
    }
  });

  return rootItems;
};

// GET /api/navbar - Ambil semua navbar items (public)
// Returns hierarchical structure
// ROLLBACK: Using href field (pre-page_id migration)
router.get("/", async (req, res, next) => {
  try {
    const items = await getNavbarItemsSelect(true);

    console.log(`[NAVBAR] Daftar navbar diambil: ${items.length} items`);

    const hierarchical = buildNavbarHierarchy(items);
    res.json({ success: true, data: hierarchical });
  } catch (err) {
    console.error("[NAVBAR] Error saat mengambil navbar:", err);
    next(err);
  }
});

// GET /api/navbar/admin - Ambil semua navbar items untuk admin (dengan status, dalam format flat)
router.get("/admin", verifyToken, async (req, res, next) => {
  try {
    const items = await getNavbarItemsSelect(false);

    console.log(`[NAVBAR] Admin navbar list diambil: ${items.length} items`);

    res.json({ success: true, data: items });
  } catch (err) {
    console.error("[NAVBAR] Error saat mengambil navbar admin:", err);
    next(err);
  }
});

// POST /api/navbar - Tambah navbar item (termasuk submenu)
// POST /api/navbar - Tambah navbar item (termasuk submenu)
// NEW: Accepts page_id from frontend, auto-generates href from page_slug
router.post("/", verifyToken, async (req, res, next) => {
  try {
    const { label, page_id, parent_id } = req.body;

    // Log incoming request
    console.log("[NAVBAR CREATE] ===== REQUEST =====");
    console.log("[NAVBAR CREATE] Body:", JSON.stringify(req.body, null, 2));
    console.log("[NAVBAR CREATE] Parsed values:", {
      label,
      page_id,
      parent_id,
    });
    console.log("[NAVBAR CREATE] Value types:", {
      label: typeof label,
      page_id: typeof page_id,
      parent_id: typeof parent_id,
    });

    // 1. Validasi label (required)
    if (!label || (typeof label === "string" && label.trim() === "")) {
      console.log(
        "[NAVBAR CREATE] Validation failed: Label is empty or missing",
        { label },
      );
      return res.status(400).json({
        success: false,
        message: "Label wajib diisi",
        code: "VALIDATION_ERROR",
      });
    }

    // 2. Validasi page_id (required, must be positive integer)
    if (!page_id || typeof page_id !== "number" || page_id <= 0) {
      console.log(
        "[NAVBAR CREATE] Validation failed: page_id is required and must be a positive number",
        { page_id },
      );
      return res.status(400).json({
        success: false,
        message: "Page ID wajib diisi dan harus berupa angka positif",
        code: "PAGE_ID_REQUIRED",
      });
    }

    // 3. Lookup page dari tabel pages berdasarkan page_id
    console.log("[NAVBAR CREATE] Looking up page_id:", page_id);
    const [pageExists] = await pool.query(
      "SELECT id, slug FROM pages WHERE id = ?",
      [page_id],
    );

    if (pageExists.length === 0) {
      console.log("[NAVBAR CREATE] Validation failed: Page not found", {
        page_id,
      });
      return res.status(404).json({
        success: false,
        message: "Halaman tidak ditemukan",
        code: "PAGE_NOT_FOUND",
      });
    }

    const page = pageExists[0];
    const page_slug = page.slug;
    const auto_href = `/${page_slug}`;

    console.log("[NAVBAR CREATE] ✓ Page found:", {
      page_id: page.id,
      page_slug: page.slug,
      auto_href,
    });

    // 4. Validasi parent_id jika ada (submenu)
    if (parent_id) {
      console.log("[NAVBAR CREATE] Validating parent_id:", parent_id);
      const [parentExists] = await pool.query(
        "SELECT id FROM navbar_items WHERE id = ?",
        [parent_id],
      );
      if (parentExists.length === 0) {
        console.log("[NAVBAR CREATE] Validation failed: Parent not found", {
          parent_id,
        });
        return res.status(404).json({
          success: false,
          message: "Parent item tidak ditemukan",
          code: "PARENT_NOT_FOUND",
        });
      }
      console.log("[NAVBAR CREATE] Parent exists, proceeding...", {
        parent_id,
      });
    }

    // 5. Get max order_index untuk level yang sama
    console.log("[NAVBAR CREATE] Getting max order_index for level...", {
      parent_id,
    });
    const [maxOrder] = await pool.query(
      "SELECT MAX(order_index) as max_order FROM navbar_items WHERE parent_id " +
        (parent_id ? "= ?" : "IS NULL"),
      parent_id ? [parent_id] : [],
    );
    const nextOrder = (maxOrder[0]?.max_order || -1) + 1;
    console.log("[NAVBAR CREATE] Next order_index:", nextOrder);

    // 6. Prepare data for insert
    const labelValue = label.trim();
    console.log("[NAVBAR CREATE] Preparing insert...", {
      labelValue,
      page_id,
      page_slug,
      auto_href,
      nextOrder,
      parent_id: parent_id || null,
    });

    // 7. Insert into database with dynamic schema support
    console.log("[NAVBAR CREATE] Inserting into database...");
    const insertColumns = ["label", "page_id"];
    const insertValues = [labelValue, page_id];

    if (await hasNavbarColumn("page_slug")) {
      insertColumns.push("page_slug");
      insertValues.push(page_slug);
    }

    if (await hasNavbarColumn("href")) {
      insertColumns.push("href");
      insertValues.push(auto_href);
    }

    insertColumns.push("order_index", "active", "parent_id");
    insertValues.push(nextOrder, true, parent_id || null);

    console.log("[NAVBAR CREATE] Insert columns:", insertColumns);
    console.log("[NAVBAR CREATE] Insert values:", insertValues);

    const [result] = await pool.query(
      `INSERT INTO navbar_items (${insertColumns.join(", ")}) VALUES (${insertColumns.map(() => "?").join(", ")})`,
      insertValues,
    );

    console.log(
      `[NAVBAR CREATE] ✓ Item navbar ditambahkan: "${labelValue}" (ID: ${result.insertId}, Page: ${page_slug}, Parent: ${parent_id || "none"})`,
    );

    // 8. Return response with all data
    res.status(201).json({
      success: true,
      message: "Item navbar berhasil ditambahkan",
      data: {
        id: result.insertId,
        label: labelValue,
        page_id: page_id,
        page_slug: page_slug,
        href: auto_href,
        order_index: nextOrder,
        active: true,
        parent_id: parent_id || null,
      },
    });
  } catch (err) {
    console.error("[NAVBAR CREATE] ✗ Error saat menambah item:", err);
    console.error("[NAVBAR CREATE] Error details:", {
      message: err.message,
      code: err.code,
      errno: err.errno,
      sqlState: err.sqlState,
      sql: err.sql,
    });
    next(err);
  }
});

// PUT /api/navbar/:id - Update navbar item
// CURRENT: Can update label, href, active, parent_id
// FUTURE: Will support page_id after migration
router.put("/:id", verifyToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { label, href, active, parent_id } = req.body;

    // Check exists
    const [existing] = await pool.query(
      "SELECT id, parent_id FROM navbar_items WHERE id = ?",
      [id],
    );
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Item navbar tidak ditemukan",
        code: "NAVBAR_ITEM_NOT_FOUND",
      });
    }

    // Validasi parent_id jika ada perubahan
    if (parent_id !== undefined && parent_id !== existing[0].parent_id) {
      if (parent_id !== null) {
        // Check if parent exists dan bukan dirinya sendiri
        if (parent_id === id) {
          return res.status(400).json({
            success: false,
            message: "Item tidak bisa menjadi parent dari dirinya sendiri",
            code: "INVALID_PARENT",
          });
        }
        const [parentExists] = await pool.query(
          "SELECT id FROM navbar_items WHERE id = ?",
          [parent_id],
        );
        if (parentExists.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Parent item tidak ditemukan",
            code: "PARENT_NOT_FOUND",
          });
        }
      }
    }

    // Update
    const updates = [];
    const values = [];
    if (label !== undefined) {
      updates.push("label = ?");
      values.push(label);
    }
    if (href !== undefined) {
      updates.push("href = ?");
      values.push(href);
    }
    if (active !== undefined) {
      updates.push("active = ?");
      values.push(active);
    }
    if (parent_id !== undefined) {
      updates.push("parent_id = ?");
      values.push(parent_id || null);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Tidak ada field yang diupdate",
        code: "NO_UPDATE_FIELDS",
      });
    }

    values.push(id);
    await pool.query(
      `UPDATE navbar_items SET ${updates.join(", ")}, updated_at = NOW() WHERE id = ?`,
      values,
    );

    console.log(`[NAVBAR] Item navbar diperbarui: ID ${id}`);

    res.json({
      success: true,
      message: "Item navbar berhasil diperbarui",
    });
  } catch (err) {
    console.error("[NAVBAR] Error saat update item:", err);
    next(err);
  }
});

// PUT /api/navbar/reorder - Reorder navbar items
router.put("/reorder/items", verifyToken, async (req, res, next) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Items array wajib diisi",
        code: "VALIDATION_ERROR",
      });
    }

    // Update order untuk setiap item
    for (let i = 0; i < items.length; i++) {
      await pool.query(
        "UPDATE navbar_items SET order_index = ?, updated_at = NOW() WHERE id = ?",
        [i, items[i].id],
      );
    }

    console.log(`[NAVBAR] Navbar items diurutkan ulang`);

    res.json({
      success: true,
      message: "Urutan navbar berhasil diperbarui",
    });
  } catch (err) {
    console.error("[NAVBAR] Error saat reorder:", err);
    next(err);
  }
});

// DELETE /api/navbar/:id - Hapus navbar item
router.delete("/:id", verifyToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check exists
    const [existing] = await pool.query(
      "SELECT label FROM navbar_items WHERE id = ?",
      [id],
    );
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Item navbar tidak ditemukan",
        code: "NAVBAR_ITEM_NOT_FOUND",
      });
    }

    const label = existing[0].label;

    // Delete
    await pool.query("DELETE FROM navbar_items WHERE id = ?", [id]);

    console.log(`[NAVBAR] Item navbar dihapus: "${label}" (ID: ${id})`);

    res.json({
      success: true,
      message: "Item navbar berhasil dihapus",
    });
  } catch (err) {
    console.error("[NAVBAR] Error saat hapus item:", err);
    next(err);
  }
});

// GET /api/navbar/pages/available - Get all available CMS pages for admin page selector
// TEMPORARY: This endpoint is for FUTURE use after page_id migration
// Currently disabled because pages table uses 'published' not 'active'
// Will be enabled after migration to page_id-based architecture
router.get("/pages/available", verifyToken, async (req, res, next) => {
  try {
    console.log("[NAVBAR] Fetching available CMS pages for navbar...");

    // Using 'published' not 'active' - matches actual pages table schema
    const [pages] = await pool.query(
      `SELECT id, title, slug 
       FROM pages 
       WHERE published = 1 
       ORDER BY title ASC`,
    );

    console.log(`[NAVBAR] Found ${pages.length} available pages`);

    res.json({
      success: true,
      data: pages.map((p) => ({
        id: p.id,
        label: p.title,
        slug: p.slug,
        href: `/${p.slug}`,
      })),
    });
  } catch (err) {
    console.error("[NAVBAR] Error saat mengambil available pages:", err);
    next(err);
  }
});

module.exports = router;
