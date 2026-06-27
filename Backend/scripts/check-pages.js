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
      "SELECT id, slug, title, published, JSON_LENGTH(content) AS blocks FROM pages ORDER BY slug",
    );
    console.log(JSON.stringify(pages, null, 2));
  } catch (err) {
    console.error(err.message || err);
    process.exit(1);
  } finally {
    await conn.end();
  }
})();
