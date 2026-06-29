#!/usr/bin/env node
/*
  Migrate legacy src/data/*.ts into CMS pages table.

  Usage:
    node Backend/scripts/migrate-legacy-data.js [--force]

  Behavior:
    - Loads legacy .ts data files by doing a light transform to JS at runtime (no ts-node needed).
    - Creates pages if missing.
    - Updates pages if empty or when `--force` is passed.
    - Is idempotent and avoids duplicates.
    - Prints a summary report at the end.
*/

const fs = require("fs");
const os = require("os");
const path = require("path");
const vm = require("vm");
const pool = require("../src/config/database");

const DATA_DIR = path.join(__dirname, "..", "..", "src", "data");
const FORCE = process.argv.includes("--force");

function transformTsToJs(source, exportedNames) {
  // Remove Type-only imports
  let code = source.replace(/^import type[\s\S]*?;\s*$/gm, "");
  // Remove other imports (we don't need runtime imports from TS files)
  code = code.replace(/^import\s+[^;]+;\s*$/gm, "");
  // Replace `export const` with `const`
  code = code.replace(/export\s+const\s+/g, "const ");
  // Remove TypeScript type annotations like `: Type[]` in const declarations
  code = code.replace(/:\s*[A-Za-z0-9_\[\]<>, \|{}]+(?=\s*=)/g, "");
  // Remove `as const`
  code = code.replace(/\s+as\s+const/g, "");

  // Append module.exports for requested exported names
  const exportsObj = exportedNames.join(", ");
  code += `\nmodule.exports = { ${exportsObj} };\n`;
  return code;
}

function loadTsModule(filePath) {
  const source = fs.readFileSync(filePath, "utf8");
  const exportMatches = [
    ...source.matchAll(/export\s+const\s+([A-Za-z0-9_]+)/g),
  ];
  const exportedNames = exportMatches.map((m) => m[1]);
  if (exportedNames.length === 0) return {};

  const code = transformTsToJs(source, exportedNames);

  // Write to a temp file and require it safely
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "migrate-"));
  const tmpFile = path.join(
    tmpDir,
    path.basename(filePath).replace(/\.ts$/, ".js"),
  );
  fs.writeFileSync(tmpFile, code, "utf8");
  try {
    const mod = require(tmpFile);
    return mod || {};
  } finally {
    // remove temp files
    try {
      fs.unlinkSync(tmpFile);
      fs.rmdirSync(tmpDir);
    } catch (e) {
      /* ignore */
    }
  }
}

function contentIsEffectivelyEmpty(content) {
  if (!Array.isArray(content)) return true;
  return content.every((block) => {
    if (!block || typeof block.data !== "object") return true;
    return Object.values(block.data).every((v) => {
      if (v == null) return true;
      if (typeof v === "string") return v.trim() === "";
      if (Array.isArray(v)) return v.length === 0;
      if (typeof v === "object")
        return Object.values(v).every(
          (vv) => vv == null || (typeof vv === "string" && vv.trim() === ""),
        );
      return false;
    });
  });
}

async function upsertPage(slug, title, content, force) {
  const [rows] = await pool.query(
    "SELECT id, content FROM pages WHERE slug = ?",
    [slug],
  );
  if (!rows || rows.length === 0) {
    const [res] = await pool.query(
      "INSERT INTO pages (slug, title, content, published, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())",
      [slug, title, JSON.stringify(content), true],
    );
    return { action: "insert", id: res.insertId };
  }
  const existing = rows[0];
  let existingContent = null;
  try {
    existingContent =
      typeof existing.content === "string"
        ? JSON.parse(existing.content)
        : existing.content;
  } catch (e) {
    existingContent = null;
  }

  if (force || !existingContent || contentIsEffectivelyEmpty(existingContent)) {
    await pool.query(
      "UPDATE pages SET title = ?, content = ?, published = ?, updated_at = NOW() WHERE slug = ?",
      [title, JSON.stringify(content), true, slug],
    );
    return { action: "update", id: existing.id };
  }
  return { action: "skip", id: existing.id };
}

function buildBeranda(data) {
  const {
    CONTACT_INFO = {},
    HERO_STATS = [],
    HERO_NEWS = {},
    STATISTICS = [],
    ABOUT_DATA = {},
    PROGRAMS = [],
    BENTO_ITEMS = [],
    FASILITAS = [],
    NEWS_ITEMS = [],
    GALLERY_ITEMS = [],
    PARTNERS = [],
    KERJASAMA = [],
  } = data;
  const heroStats = Array.isArray(HERO_STATS)
    ? HERO_STATS.map((s) => ({ label: s.label, value: s.value }))
    : [];
  const content = [
    {
      type: "hero",
      data: {
        badge: "",
        title: HERO_NEWS.title || "",
        subtitle: "",
        description: HERO_NEWS.desc || "",
        image: "",
        button_text: "",
        button_link: "",
        stats_badge: "",
        stats: heroStats,
        stats_footer: "",
      },
    },
    {
      type: "about",
      data: {
        title: "Tentang PPNS",
        description: ABOUT_DATA.sejarah || [],
        statistics: STATISTICS || [],
      },
    },
    { type: "statistics", data: { cards: STATISTICS || [] } },
    {
      type: "program",
      data: {
        badge: "",
        title: "Program Studi",
        subtitle: "",
        bentoItems: BENTO_ITEMS || [],
        programs: PROGRAMS || [],
        facilities: FASILITAS || [],
        kerjasama: KERJASAMA || [],
      },
    },
    {
      type: "news",
      data: {
        headline: NEWS_ITEMS && NEWS_ITEMS.length ? NEWS_ITEMS[0] : null,
        featured: NEWS_ITEMS ? NEWS_ITEMS.slice(0, 3) : [],
        items: NEWS_ITEMS || [],
      },
    },
    { type: "gallery", data: { title: "Galeri", images: GALLERY_ITEMS || [] } },
    {
      type: "contact",
      data: {
        title: "Kontak",
        address: CONTACT_INFO.address || "",
        phone: CONTACT_INFO.phone || "",
        email: CONTACT_INFO.email || "",
        map: CONTACT_INFO.maps || "",
      },
    },
    {
      type: "partners",
      data: { title: "Mitra & Kerjasama", items: PARTNERS || [] },
    },
    {
      type: "cta",
      data: {
        title: "Jelajahi Program PPNS",
        subtitle: "",
        description: "Pelajari program studi dan peluang karir di PPNS.",
        button: { label: "Lihat Program", link: "/program" },
        image: PROGRAMS && PROGRAMS.length ? PROGRAMS[0].image : "",
      },
    },
  ];
  return content;
}

function buildTentang(data) {
  const {
    ABOUT_DATA = {},
    STATISTICS = [],
    TIMELINE = [],
    ACHIEVEMENTS = [],
  } = data;

  const hero = {
    type: "hero",
    data: {
      badge: "",
      title: ABOUT_DATA?.judul || "Tentang PPNS",
      subtitle: ABOUT_DATA?.visi || "",
      description:
        ABOUT_DATA && ABOUT_DATA.sejarah && ABOUT_DATA.sejarah.length
          ? ABOUT_DATA.sejarah[0]
          : "",
      image: "",
      button_text: "",
      button_link: "",
      stats_badge: "",
      stats: (STATISTICS || []).map((s) => ({
        label: s.label,
        value: s.value,
      })),
      stats_footer: "",
    },
  };

  const visionMission = {
    type: "vision_mission",
    data: {
      vision: ABOUT_DATA.visi || "",
      mission: ABOUT_DATA.misi || [],
    },
  };

  const history = {
    type: "history",
    data: {
      timeline: TIMELINE || ABOUT_DATA.sejarah || [],
    },
  };

  const statistics = {
    type: "statistics",
    data: {
      cards: STATISTICS || [],
    },
  };

  const cta = {
    type: "cta",
    data: {
      title: "Bergabung dengan PPNS",
      subtitle: "",
      description: "Pelajari lebih lanjut tentang program dan kerjasama kami.",
      button: { label: "Hubungi Kami", link: "/kontak" },
      image: ACHIEVEMENTS && ACHIEVEMENTS.length ? ACHIEVEMENTS[0].image : "",
    },
  };

  return [hero, visionMission, history, statistics, cta];
}

function buildProgram(data) {
  const {
    PROGRAMS = [],
    BENTO_ITEMS = [],
    FASILITAS = [],
    KERJASAMA = [],
  } = data;
  return [
    {
      type: "program",
      data: {
        badge: "",
        title: "Program Studi",
        subtitle: "",
        bentoItems: BENTO_ITEMS || [],
        programs: PROGRAMS || [],
        facilities: FASILITAS || [],
        kerjasama: KERJASAMA || [],
      },
    },
  ];
}

function buildBerita(data) {
  const { NEWS_ITEMS = [] } = data;
  return [
    {
      type: "news",
      data: {
        headline: NEWS_ITEMS && NEWS_ITEMS.length ? NEWS_ITEMS[0] : null,
        featured: NEWS_ITEMS ? NEWS_ITEMS.slice(0, 3) : [],
        items: NEWS_ITEMS || [],
      },
    },
  ];
}

function buildGaleri(data) {
  const { GALLERY_ITEMS = [] } = data;
  return [
    { type: "gallery", data: { title: "Galeri", images: GALLERY_ITEMS || [] } },
  ];
}

function buildKontak(data) {
  const { CONTACT_INFO = {}, HERO_STATS = [], HERO_NEWS = {} } = data;
  return [
    {
      type: "contact",
      data: {
        title: "Kontak",
        address: CONTACT_INFO.address || "",
        phone: CONTACT_INFO.phone || "",
        email: CONTACT_INFO.email || "",
        map: CONTACT_INFO.maps || "",
      },
    },
  ];
}

function buildLaporan(data) {
  const { REPORTS = [] } = data;
  return [{ type: "text", data: { title: "Laporan", content: REPORTS || [] } }];
}

function buildNavbar(data) {
  const { NAV_LINKS = [] } = data;
  return [{ type: "text", data: { title: "Navbar", links: NAV_LINKS || [] } }];
}

function buildFooter(data) {
  const { FOOTER_LINKS = {} } = data;
  return [
    { type: "text", data: { title: "Footer", links: FOOTER_LINKS || {} } },
  ];
}

async function main() {
  console.log("[MIGRATE] Loading legacy data from", DATA_DIR);
  const files = {
    about: path.join(DATA_DIR, "about.ts"),
    news: path.join(DATA_DIR, "news.ts"),
    gallery: path.join(DATA_DIR, "gallery.ts"),
    contact: path.join(DATA_DIR, "contact.ts"),
    partners: path.join(DATA_DIR, "partners.ts"),
    programs: path.join(DATA_DIR, "programs.ts"),
    fasilitas: path.join(DATA_DIR, "fasilitas.ts"),
    reports: path.join(DATA_DIR, "reports.ts"),
    navigation: path.join(DATA_DIR, "navigation.ts"),
  };

  const data = {};
  for (const key of Object.keys(files)) {
    try {
      if (fs.existsSync(files[key])) {
        Object.assign(data, loadTsModule(files[key]));
        console.log("[MIGRATE] Loaded", key);
      } else {
        console.log("[MIGRATE] Missing", files[key]);
      }
    } catch (e) {
      console.error("[MIGRATE] Error loading", files[key], e.message);
    }
  }

  // Migrate non-beranda pages first. We'll build `beranda` afterwards
  // using the migrated pages so its blocks are populated from real data.
  const tasks = [
    { slug: "tentang", title: "Tentang", content: buildTentang(data) },
    { slug: "program", title: "Program", content: buildProgram(data) },
    { slug: "berita", title: "Berita", content: buildBerita(data) },
    { slug: "galeri", title: "Galeri", content: buildGaleri(data) },
    { slug: "kontak", title: "Kontak", content: buildKontak(data) },
    { slug: "laporan", title: "Laporan", content: buildLaporan(data) },
    { slug: "navbar", title: "Navbar", content: buildNavbar(data) },
    { slug: "footer", title: "Footer", content: buildFooter(data) },
  ];

  const report = {
    migrated: [],
    skipped: [],
    counts: {
      pages: 0,
      blocksByPage: {},
      news: 0,
      programs: 0,
      gallery: 0,
      partners: 0,
      facilities: 0,
    },
  };

  for (const t of tasks) {
    try {
      const res = await upsertPage(t.slug, t.title, t.content, FORCE);
      report.counts.pages += res.action === "insert" ? 1 : 0;
      report.counts.blocksByPage[t.slug] = Array.isArray(t.content)
        ? t.content.length
        : 0;
      if (res.action === "insert" || res.action === "update")
        report.migrated.push({ slug: t.slug, action: res.action, id: res.id });
      else
        report.skipped.push({ slug: t.slug, action: res.action, id: res.id });
    } catch (e) {
      console.error("[MIGRATE] Error upserting page", t.slug, e.message);
    }
  }

  // After migrating non-beranda pages, fetch their content from DB and build Beranda
  async function fetchPageContent(slug) {
    try {
      const [rows] = await pool.query(
        "SELECT content FROM pages WHERE slug = ?",
        [slug],
      );
      // Ensure we use slug = "" as the canonical root page.
      // If an accidental 'beranda' page exists, move its content into root and remove it.
      try {
        // Check for existing 'beranda' row
        const [berandaRows] = await pool.query(
          "SELECT id, content FROM pages WHERE slug = ?",
          ["beranda"],
        );
        const [rootRows] = await pool.query(
          "SELECT id, content FROM pages WHERE slug = ?",
          [""],
        );

        // If beranda exists and root does not, move beranda -> root
        if (berandaRows && berandaRows.length > 0) {
          const berandaRow = berandaRows[0];
          let berandaRaw = null;
          try {
            berandaRaw =
              typeof berandaRow.content === "string"
                ? JSON.parse(berandaRow.content)
                : berandaRow.content;
          } catch (e) {
            berandaRaw = null;
          }

          if ((!rootRows || rootRows.length === 0) && berandaRaw) {
            // insert root with beranda content
            const [ins] = await pool.query(
              "INSERT INTO pages (slug, title, content, published, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())",
              ["", "Beranda", JSON.stringify(berandaRaw), true],
            );
            report.migrated.push({
              slug: "",
              action: "insert",
              id: ins.insertId,
            });
            // delete old beranda
            await pool.query("DELETE FROM pages WHERE slug = ?", ["beranda"]);
            console.log(
              '[MIGRATE] Moved content from slug="beranda" into root (slug="").',
            );
          } else if (rootRows && rootRows.length > 0 && berandaRaw) {
            // root exists; decide whether to overwrite: if root empty or FORCE
            const rootRow = rootRows[0];
            let rootRaw = null;
            try {
              rootRaw =
                typeof rootRow.content === "string"
                  ? JSON.parse(rootRow.content)
                  : rootRow.content;
            } catch (e) {
              rootRaw = null;
            }

            const rootIsEmpty = !rootRaw || contentIsEffectivelyEmpty(rootRaw);
            if (FORCE || rootIsEmpty) {
              await pool.query(
                "UPDATE pages SET title = ?, content = ?, published = ?, updated_at = NOW() WHERE slug = ?",
                ["Beranda", JSON.stringify(berandaRaw), true, ""],
              );
              report.migrated.push({
                slug: "",
                action: "update",
                id: rootRow.id,
              });
              await pool.query("DELETE FROM pages WHERE slug = ?", ["beranda"]);
              console.log(
                '[MIGRATE] Replaced root content with content from slug="beranda" and removed old beranda row.',
              );
            } else {
              // root has content; keep it and remove beranda to avoid duplication
              await pool.query("DELETE FROM pages WHERE slug = ?", ["beranda"]);
              report.skipped.push({
                slug: "beranda",
                action: "deleted_duplicate",
                id: berandaRow.id,
              });
              console.log(
                '[MIGRATE] Root page already has content; deleted duplicate slug="beranda".',
              );
            }
          }
        }

        // root upsert will be performed after assembling full berandaContent below
      } catch (e) {
        console.error(
          "[MIGRATE] Error checking/integrating legacy beranda",
          e.message,
        );
      }
    } catch (e) {
      return null;
    }
  }

  const programPage = await fetchPageContent("program");
  const newsPage = await fetchPageContent("berita");
  const galleryPage = await fetchPageContent("galeri");
  const contactPage = await fetchPageContent("kontak");
  const partnersPage =
    (await fetchPageContent("footer")) ||
    (await fetchPageContent("navbar")) ||
    (await fetchPageContent("partners"));
  const aboutPage = await fetchPageContent("tentang");

  // Build a data object for Beranda using migrated pages where possible
  const berandaData = Object.assign({}, data);
  function findBlock(pageContent, type) {
    if (!Array.isArray(pageContent)) return null;
    const b = pageContent.find((x) => x && x.type === type);
    return b ? b.data : null;
  }

  if (programPage) {
    const programBlock = findBlock(programPage, "program");
    if (programBlock) {
      berandaData.PROGRAMS = programBlock.programs || berandaData.PROGRAMS;
      berandaData.BENTO_ITEMS =
        programBlock.bentoItems || berandaData.BENTO_ITEMS;
      berandaData.FASILITAS = programBlock.facilities || berandaData.FASILITAS;
      berandaData.KERJASAMA = programBlock.kerjasama || berandaData.KERJASAMA;
    }
  }

  if (newsPage) {
    const newsBlock = findBlock(newsPage, "news");
    if (newsBlock)
      berandaData.NEWS_ITEMS = newsBlock.items || berandaData.NEWS_ITEMS;
  }

  if (galleryPage) {
    const galleryBlock = findBlock(galleryPage, "gallery");
    if (galleryBlock)
      berandaData.GALLERY_ITEMS =
        galleryBlock.images || berandaData.GALLERY_ITEMS;
  }

  if (contactPage) {
    const contactBlock = findBlock(contactPage, "contact");
    if (contactBlock) {
      berandaData.CONTACT_INFO = {
        address: contactBlock.address || berandaData.CONTACT_INFO?.address,
        phone: contactBlock.phone || berandaData.CONTACT_INFO?.phone,
        email: contactBlock.email || berandaData.CONTACT_INFO?.email,
        maps: contactBlock.map || berandaData.CONTACT_INFO?.maps,
      };
    }
  }

  if (partnersPage) {
    const partnersBlock =
      findBlock(partnersPage, "partners") || findBlock(partnersPage, "text");
    if (partnersBlock)
      berandaData.PARTNERS = partnersBlock.items || berandaData.PARTNERS;
  }

  if (aboutPage) {
    const aboutBlock =
      findBlock(aboutPage, "about") || findBlock(aboutPage, "text");
    if (aboutBlock) {
      berandaData.ABOUT_DATA = berandaData.ABOUT_DATA || {};
      berandaData.ABOUT_DATA.sejarah =
        aboutBlock.description ||
        aboutBlock.content ||
        berandaData.ABOUT_DATA.sejarah;
      berandaData.STATISTICS = aboutBlock.statistics || berandaData.STATISTICS;
    }
  }

  const berandaContent = buildBeranda(berandaData);
  try {
    // Never create a page with slug "beranda". Use the empty-string root as canonical homepage.
    const res = await upsertPage("", "Beranda", berandaContent, FORCE);
    report.counts.blocksByPage[""] = Array.isArray(berandaContent)
      ? berandaContent.length
      : 0;
    if (res.action === "insert" || res.action === "update")
      report.migrated.push({ slug: "", action: res.action, id: res.id });
    else report.skipped.push({ slug: "", action: res.action, id: res.id });
  } catch (e) {
    console.error('[MIGRATE] Error upserting root ("" )', e.message);
  }

  // Totals
  report.counts.news = Array.isArray(data.NEWS_ITEMS)
    ? data.NEWS_ITEMS.length
    : 0;
  report.counts.programs = Array.isArray(data.PROGRAMS)
    ? data.PROGRAMS.length
    : 0;
  report.counts.gallery = Array.isArray(data.GALLERY_ITEMS)
    ? data.GALLERY_ITEMS.length
    : 0;
  report.counts.partners = Array.isArray(data.PARTNERS)
    ? data.PARTNERS.length
    : 0;
  report.counts.facilities = Array.isArray(data.FASILITAS)
    ? data.FASILITAS.length
    : 0;

  console.log("\n=== Migration Report ===");
  console.log("Force mode:", FORCE);
  console.log("Pages migrated:", report.migrated.length);
  for (const m of report.migrated)
    console.log(" -", m.slug, m.action, "(id:", m.id + ")");
  console.log("Pages skipped (already had content):", report.skipped.length);
  for (const s of report.skipped)
    console.log(" -", s.slug, s.action, "(id:", s.id + ")");
  console.log("\nBlocks per page:");
  for (const [k, v] of Object.entries(report.counts.blocksByPage))
    console.log(" -", k + ":", v);
  console.log("\nTotals:");
  console.log(" - news items:", report.counts.news);
  console.log(" - programs:", report.counts.programs);
  console.log(" - gallery items:", report.counts.gallery);
  console.log(" - partners:", report.counts.partners);
  console.log(" - facilities:", report.counts.facilities);

  // close pool
  try {
    await pool.end();
  } catch (e) {
    /* ignore */
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
