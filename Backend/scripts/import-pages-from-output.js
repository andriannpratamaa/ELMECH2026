const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

async function run() {
  const file = path.join(
    __dirname,
    "..",
    "..",
    "scripts",
    "migration-output.json",
  );
  if (!fs.existsSync(file)) {
    console.error(
      "migration-output.json not found. Run scripts/migrate-static-pages.js first (dry-run)",
    );
    process.exit(1);
  }

  const pages = JSON.parse(fs.readFileSync(file, "utf8"));

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "green_campus_cms",
    port: process.env.DB_PORT || 3306,
  });

  for (const slugKey of Object.keys(pages)) {
    const meta = pages[slugKey];
    const slug = slugKey;
    const title = meta.title || (slug === "" ? "Beranda" : slug);
    const blocks = meta.blocks || [];
    const content = JSON.stringify(blocks);

    try {
      // Check if page exists
      const [rows] = await conn.query("SELECT id FROM pages WHERE slug = ?", [
        slug,
      ]);
      if (rows.length > 0) {
        await conn.query(
          "UPDATE pages SET title = ?, content = ?, published = ?, updated_at = NOW() WHERE slug = ?",
          [title, content, 1, slug],
        );
        console.log("Updated page:", slug);
      } else {
        const [res] = await conn.query(
          "INSERT INTO pages (title, slug, content, published) VALUES (?, ?, ?, ?)",
          [title, slug, content, 1],
        );
        console.log("Created page:", slug);
      }

      console.log(
        `Wrote ${blocks.length} blocks into pages.content for ${slug}`,
      );
    } catch (e) {
      console.error("Failed processing", slug, e.message || e);
    }
  }

  await conn.end();
  console.log("Import finished");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
