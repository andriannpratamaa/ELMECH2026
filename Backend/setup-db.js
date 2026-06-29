const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

async function setup() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    port: process.env.DB_PORT || 3306,
  });

  await conn.query("CREATE DATABASE IF NOT EXISTS green_campus_cms");
  await conn.query("USE green_campus_cms");

  await conn.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('admin') DEFAULT 'admin',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS pages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(100) NOT NULL UNIQUE,
      title VARCHAR(200) NOT NULL,
      content JSON NOT NULL,
      published BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS media (
      id INT AUTO_INCREMENT PRIMARY KEY,
      filename VARCHAR(255) NOT NULL,
      url VARCHAR(500) NOT NULL,
      mime_type VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS navbar_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      label VARCHAR(100) NOT NULL,
      href VARCHAR(255),
      order_index INT NOT NULL,
      active BOOLEAN DEFAULT true,
      parent_id INT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_id) REFERENCES navbar_items(id) ON DELETE CASCADE
    )
  `);

  const hash = await bcrypt.hash("admin123", 10);
  await conn.query(
    "INSERT IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
    ["Admin", "admin@ppns.ac.id", hash, "admin"],
  );

  const defaultContent = JSON.stringify([
    {
      type: "hero",
      data: {
        title: "Selamat Datang di Green Campus",
        subtitle: "Kampus Berwawasan Lingkungan",
        image: null,
      },
    },
    {
      type: "text",
      data: {
        body: "<p>Selamat datang di website resmi Green Campus. Kami berkomitmen untuk menciptakan lingkungan kampus yang hijau, bersih, dan berkelanjutan.</p>",
      },
    },
  ]);

  const pages = [
    { slug: "", title: "Beranda", content: defaultContent },
    {
      slug: "program",
      title: "Program",
      content: JSON.stringify([
        {
          type: "text",
          data: {
            body: "<h2>Program Kami</h2><p>Berbagai program lingkungan yang kami selenggarakan.</p>",
          },
        },
      ]),
    },
    {
      slug: "galeri",
      title: "Galeri",
      content: JSON.stringify([
        {
          type: "text",
          data: {
            body: "<h2>Galeri</h2><p>Dokumentasi kegiatan Green Campus.</p>",
          },
        },
      ]),
    },
    {
      slug: "berita",
      title: "Berita",
      content: JSON.stringify([
        {
          type: "text",
          data: {
            body: "<h2>Berita Terbaru</h2><p>Informasi dan berita terbaru seputar Green Campus.</p>",
          },
        },
      ]),
    },
    {
      slug: "tentang",
      title: "Tentang",
      content: JSON.stringify([
        {
          type: "text",
          data: {
            body: "<h2>Tentang Kami</h2><p>Informasi tentang Green Campus.</p>",
          },
        },
      ]),
    },
    {
      slug: "kontak",
      title: "Kontak",
      content: JSON.stringify([
        {
          type: "text",
          data: {
            body: "<h2>Hubungi Kami</h2><p>Silakan hubungi kami untuk informasi lebih lanjut.</p>",
          },
        },
      ]),
    },
    {
      slug: "laporan",
      title: "Laporan",
      content: JSON.stringify([
        {
          type: "text",
          data: {
            body: "<h2>Laporan</h2><p>Laporan kegiatan Green Campus.</p>",
          },
        },
      ]),
    },
  ];

  for (const p of pages) {
    await conn.query(
      "INSERT IGNORE INTO pages (slug, title, content) VALUES (?, ?, ?)",
      [p.slug, p.title, p.content],
    );
  }

  // Insert default navbar items
  const navbarItems = [
    { label: "Beranda", href: "/", order: 0 },
    { label: "Program", href: "/program", order: 1 },
    { label: "Galeri", href: "/galeri", order: 2 },
    { label: "Tentang", href: "/tentang", order: 3 },
    { label: "Berita", href: "/berita", order: 4 },
    { label: "Kontak", href: "/kontak", order: 5 },
  ];

  for (const item of navbarItems) {
    await conn.query(
      "INSERT IGNORE INTO navbar_items (label, href, order_index, active) VALUES (?, ?, ?, ?)",
      [item.label, item.href, item.order, true],
    );
  }

  console.log("✓ Database setup complete!");
  console.log("  User: admin@ppns.ac.id / admin123");
  await conn.end();
}

setup().catch((err) => {
  console.error("Setup failed:", err.message);
  process.exit(1);
});
