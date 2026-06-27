const mysql = require("mysql2/promise");

async function fixBeranda() {
  const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "green_campus_cms",
    port: 3306
  });

  const connection = await pool.getConnection();

  try {
    // Find all pages to see what matches home/beranda
    const [pages] = await connection.query("SELECT id, slug, title FROM pages");
    console.log("Available pages:");
    pages.forEach(p => {
      console.log(`  ID=${p.id}, slug="${p.slug}", title="${p.title}"`);
    });

    // Find page with slug "beranda" or first page (usually home)
    let homePageId = null;
    const berandaPage = pages.find(p => p.slug === "beranda" || p.slug === "home");
    if (berandaPage) {
      homePageId = berandaPage.id;
      console.log(`\nFound home page: ID=${homePageId}, slug="${berandaPage.slug}"`);
    } else {
      // Use first page as home
      homePageId = pages[0].id;
      console.log(`\nUsing first page as home: ID=${homePageId}, slug="${pages[0].slug}"`);
    }

    // Update Beranda item
    const [result] = await connection.query(
      "UPDATE navbar_items SET page_id = ?, page_slug = ? WHERE id = 1",
      [homePageId, pages.find(p => p.id === homePageId).slug]
    );

    console.log(`\n✅ Updated Beranda item: page_id=${homePageId}, page_slug="${pages.find(p => p.id === homePageId).slug}"`);

    // Verify
    const [verify] = await connection.query("SELECT id, label, page_id, page_slug FROM navbar_items WHERE id = 1");
    console.log(`\nVerified: ${JSON.stringify(verify[0])}`);

  } catch (err) {
    console.error("ERROR:", err.message);
  } finally {
    await connection.release();
    await pool.end();
  }
}

fixBeranda();
