const mysql = require("mysql2/promise");

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "green_campus_cms",
    port: process.env.DB_PORT || 3306,
  });

  try {
    const [pages] = await conn.query(
      "SELECT id, slug, title, published, JSON_LENGTH(content) AS blocks FROM pages WHERE slug = ? OR slug = ? OR slug = ? ORDER BY id",
      ["", "beranda", "/"],
    );
    console.log("Pages with root/beranda slugs:");
    console.log(JSON.stringify(pages, null, 2));

    const [cols] = await conn.query("SHOW COLUMNS FROM navbar_items");
    console.log("Navbar columns:");
    console.log(JSON.stringify(cols, null, 2));

    const [navbar] = await conn.query("SELECT * FROM navbar_items ORDER BY id");
    console.log("Navbar items:");
    console.log(JSON.stringify(navbar, null, 2));
  } catch (err) {
    console.error(err.message || err);
    process.exit(1);
  } finally {
    await conn.end();
  }
})();
