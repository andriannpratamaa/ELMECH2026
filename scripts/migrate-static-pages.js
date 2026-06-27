#!/usr/bin/env node
/*
  Migration script: migrate static site data into CMS Pages.
  - Reads a few known `src/data/*.ts` files and `src/components/Hero.tsx` for hero text
  - Builds simple content blocks and calls backend API to create/update pages
  Usage:
    NODE_ENV=development ADMIN_EMAIL=admin@ppns.ac.id ADMIN_PASSWORD=admin123 node scripts/migrate-static-pages.js --run
    Use --dry-run to only preview (default)
*/

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const axios = require("axios");

const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, "src", "data");
const HERO_FILE = path.join(ROOT, "src", "components", "Hero.tsx");

const API_BASE =
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001") + "/api";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@ppns.ac.id";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

function readFileSafe(p) {
  try {
    return fs.readFileSync(p, "utf8");
  } catch (e) {
    return null;
  }
}

// crude extractor for exported const NAME = {...} or = [ ... ]
function extractExport(name, text) {
  const idx = text.indexOf(`export const ${name}`);
  if (idx === -1) return null;
  const after = text.slice(idx);
  const eq = after.indexOf("=");
  if (eq === -1) return null;
  let rest = after.slice(eq + 1);
  // find matching top-level block
  let open = null;
  let i = 0;
  // skip whitespace
  while (i < rest.length && /\s/.test(rest[i])) i++;
  if (rest[i] === "[") open = "]";
  if (rest[i] === "{") open = "}";
  if (!open) return null;
  let depth = 0;
  let start = i;
  for (; i < rest.length; i++) {
    const ch = rest[i];
    if (ch === "{" || ch === "[") depth++;
    if (ch === "}" || ch === "]") depth--;
    if (depth === 0) {
      // include up to i
      return rest.slice(start, i + 1);
    }
  }
  return null;
}

function tsToJsonish(ts) {
  if (!ts) return null;
  let s = ts.replace(/as const/g, "");
  s = s.replace(/\/\/.*$/gm, "");
  s = s.replace(/\/\*[\s\S]*?\*\//g, "");
  s = s.replace(/\'/g, '"');
  s = s.replace(/,\s*([}\]])/g, "$1");
  return s;
}

function loadTsExport(name, filePath) {
  const source = readFileSafe(filePath);
  if (!source) return null;

  const cleaned = source
    .replace(/import\s+type[\s\S]*?;\s*/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/as const/g, "")
    .replace(/export\s+const\s+([A-Za-z0-9_]+)\s*:\s*[^=]+=/g, "const $1 =")
    .replace(/export\s+const\s+([A-Za-z0-9_]+)\s*=/g, "const $1 =")
    .replace(/export\s+let\s+([A-Za-z0-9_]+)\s*:\s*[^=]+=/g, "let $1 =")
    .replace(/export\s+let\s+([A-Za-z0-9_]+)\s*=/g, "let $1 =")
    .replace(/export\s+var\s+([A-Za-z0-9_]+)\s*:\s*[^=]+=/g, "var $1 =")
    .replace(/export\s+var\s+([A-Za-z0-9_]+)\s*=/g, "var $1 =")
    .replace(/^\s*type\s+[A-Za-z0-9_]+[\s\S]*?=\s*[^;]*;/gm, "")
    .replace(/^\s*interface\s+[A-Za-z0-9_]+[\s\S]*?\n\}/gm, "");

  const script = `${cleaned}\nmodule.exports = { ${name} };`;
  const context = { module: {}, exports: {} };
  try {
    vm.createContext(context);
    const compiled = new vm.Script(script, { filename: filePath });
    compiled.runInContext(context);
    return context.module.exports[name];
  } catch (error) {
    console.warn(`Failed to load ${name} from ${filePath}:`, error.message);
    return null;
  }
}

async function login() {
  try {
    const res = await axios.post(API_BASE + "/auth/login", {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    return res.data.data.token;
  } catch (e) {
    throw new Error("Auth failed: " + (e.response?.data?.message || e.message));
  }
}

function makePagePayload(slug, title, contentBlocks, published = true) {
  return { slug, title, content: contentBlocks, published };
}

function buildBlocksFromData() {
  const blocksBySlug = {};

  const about = loadTsExport("ABOUT_DATA", path.join(DATA_DIR, "about.ts"));
  if (about) {
    const aboutBlocks = [];
    if (Array.isArray(about.sejarah) && about.sejarah.length) {
      aboutBlocks.push({
        type: "text",
        data: { title: "Sejarah", body: about.sejarah.join("\n\n") },
      });
    }
    if (typeof about.visi === "string") {
      aboutBlocks.push({
        type: "text",
        data: { title: "Visi", body: about.visi },
      });
    }
    blocksBySlug["tentang"] = { title: "Tentang", blocks: aboutBlocks };
  }

  const programs = loadTsExport("PROGRAMS", path.join(DATA_DIR, "programs.ts"));
  if (Array.isArray(programs)) {
    blocksBySlug["program"] = {
      title: "Program",
      blocks: [
        {
          type: "features",
          data: {
            title: "Program Studi",
            items: programs.map((p) => ({
              title: p.title || p.name || p.program || "-",
              desc: p.desc || p.description || "",
            })),
          },
        },
      ],
    };
  }

  const news = loadTsExport("NEWS_ITEMS", path.join(DATA_DIR, "news.ts"));
  if (Array.isArray(news)) {
    blocksBySlug["berita"] = {
      title: "Berita",
      blocks: [
        {
          type: "text",
          data: {
            title: "Berita",
            body: news
              .map(
                (item) =>
                  `- ${item.title || item.headline || item.name || "Berita"}`,
              )
              .join("\n"),
          },
        },
      ],
    };
  }

  const gallery = loadTsExport(
    "GALLERY_ITEMS",
    path.join(DATA_DIR, "gallery.ts"),
  );
  if (Array.isArray(gallery)) {
    blocksBySlug["galeri"] = {
      title: "Galeri",
      blocks: [
        {
          type: "gallery",
          data: {
            title: "Galeri",
            images: gallery
              .map((item) => item.image || item.src || item.url)
              .filter(Boolean),
          },
        },
      ],
    };
  }

  const contact = loadTsExport(
    "CONTACT_INFO",
    path.join(DATA_DIR, "contact.ts"),
  );
  if (contact) {
    const body = [];
    if (contact.address) body.push(`Alamat: ${contact.address}`);
    if (contact.phone) body.push(`Telepon: ${contact.phone}`);
    if (contact.email) body.push(`Email: ${contact.email}`);
    blocksBySlug["kontak"] = {
      title: "Kontak",
      blocks: [
        {
          type: "text",
          data: { title: "Kontak", body: body.join("\n") },
        },
      ],
    };
  }

  const reports = loadTsExport("REPORTS", path.join(DATA_DIR, "reports.ts"));
  if (Array.isArray(reports)) {
    blocksBySlug["laporan"] = {
      title: "Laporan",
      blocks: [
        {
          type: "text",
          data: {
            title: "Laporan",
            body: reports
              .map((r) => `- ${r.title || r.name || "Laporan"}`)
              .join("\n"),
          },
        },
      ],
    };
  }

  // HOMEPAGE (beranda) - assemble hero + about excerpt + programs highlight
  const heroText = readFileSafe(HERO_FILE);
  const blocksHome = [];
  if (heroText) {
    blocksHome.push({
      type: "hero",
      data: {
        title: "PPNS Smart",
        subtitle: "Maritime Campus",
        description:
          "Portal informasi akademik, inovasi teknologi, berita kampus, dan kolaborasi industri maritim modern.",
      },
    });
  }
  if (about) {
    blocksHome.push({
      type: "text",
      data: {
        title: "Tentang Singkat",
        body: "PPNS - Politeknik Perkapalan Negeri Surabaya. Lihat halaman Tentang untuk detail.",
      },
    });
  }
  blocksBySlug[""] = { title: "Beranda", blocks: blocksHome };

  return blocksBySlug;
}

async function run() {
  const args = process.argv.slice(2);
  const doRun = args.includes("--run");
  const dry = !doRun;

  console.log(
    "Migration script - API base:",
    API_BASE,
    dry ? "(dry-run)" : "(live)",
  );

  const pages = buildBlocksFromData();
  const slugs = Object.keys(pages);

  // Always write out the prepared pages to a file for inspection / DB import
  try {
    const outPath = path.join(ROOT, "scripts", "migration-output.json");
    fs.writeFileSync(outPath, JSON.stringify(pages, null, 2), "utf8");
    console.log("Wrote prepared pages to", outPath);
  } catch (e) {
    console.warn("Failed writing migration-output.json:", e.message);
  }

  if (dry) {
    console.log("Preview pages to migrate:");
    for (const slug of slugs) {
      console.log(
        "-",
        slug || "/",
        "->",
        pages[slug].title,
        "blocks:",
        pages[slug].blocks.length,
      );
    }
    console.log(
      "\nRun with --run to perform migration (requires admin credentials).",
    );
    return;
  }

  let token;
  try {
    token = await login();
    console.log("Authenticated.");
  } catch (e) {
    console.error("Auth failed:", e.message);
    process.exit(1);
  }

  const headers = { Authorization: "Bearer " + token };

  for (const slug of slugs) {
    const page = pages[slug];
    const payload = makePagePayload(slug, page.title, page.blocks, true);
    const pagePath = slug === "" ? "/pages/root" : `/pages/${slug}`;
    try {
      // check exists
      const getRes = await axios.get(API_BASE + pagePath);
      if (getRes.status === 200) {
        // update
        await axios.put(
          API_BASE + pagePath,
          {
            title: payload.title,
            content: payload.content,
            published: payload.published,
          },
          { headers },
        );
        console.log("Updated page:", payload.slug === "" ? "/" : payload.slug);
      } else {
        // create
        await axios.post(API_BASE + "/pages", payload, { headers });
        console.log("Created page:", payload.slug === "" ? "/" : payload.slug);
      }
    } catch (e) {
      // if 404 on GET -> create
      if (e.response && e.response.status === 404) {
        try {
          await axios.post(API_BASE + "/pages", payload, { headers });
          console.log("Created page:", payload.slug);
        } catch (err) {
          console.error(
            "Failed creating",
            payload.slug,
            err.response?.data || err.message,
          );
        }
      } else {
        console.error(
          "Error processing",
          payload.slug,
          e.response?.data || e.message,
        );
      }
    }
  }

  console.log("Migration finished. Check Admin / Pages to verify.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
