const mysql = require("mysql2/promise");

async function verify() {
  const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "green_campus_cms",
    port: 3306
  });

  const connection = await pool.getConnection();

  try {
    console.log("\n========================================");
    console.log("FINAL VERIFICATION");
    console.log("========================================\n");

    const [items] = await connection.query(
      "SELECT id, label, page_id, page_slug, href FROM navbar_items ORDER BY id"
    );

    console.log("All navbar items:");
    items.forEach(item => {
      const status = item.page_id ? "✓" : "✗";
      console.log(`${status} ID=${item.id}, Label="${item.label}", page_id=${item.page_id}, page_slug="${item.page_slug}", href="${item.href}"`);
    });

    const complete = items.every(i => i.page_id !== null);
    console.log(`\nMigration Status: ${complete ? "✅ COMPLETE - All items have page_id" : "⚠️  Some items missing page_id"}`);

  } finally {
    await connection.release();
    await pool.end();
  }
}

verify();
