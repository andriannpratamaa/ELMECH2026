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
    const [cols] = await conn.query("SHOW COLUMNS FROM pages LIKE 'content'");
    console.log("content column exists:", cols.length > 0);
    if (cols.length === 0) {
      console.log("Adding content column...");
      await conn.query(
        "ALTER TABLE pages ADD COLUMN content JSON NULL AFTER title",
      );
      console.log("Added content column.");
    }
    const [rows] = await conn.query(
      "SELECT id, slug, title, content FROM pages LIMIT 5",
    );
    console.log(rows);
  } catch (e) {
    console.error("ERROR", e.message);
    process.exit(1);
  } finally {
    await conn.end();
  }
})();
