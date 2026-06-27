const mysql = require('mysql2/promise');

async function migrate() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 3306,
    database: 'green_campus_cms',
  });

  try {
    console.log('Starting migration...');

    // Check if parent_id column exists
    const [columns] = await conn.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'navbar_items' AND COLUMN_NAME = 'parent_id'"
    );

    if (columns.length === 0) {
      console.log('Adding parent_id column...');
      
      // First, drop the UNIQUE constraint if it exists
      try {
        await conn.query('ALTER TABLE navbar_items DROP CONSTRAINT navbar_items_ibfk_1');
      } catch (e) {}
      
      try {
        await conn.query('ALTER TABLE navbar_items DROP INDEX href');
      } catch (e) {}
      
      // Add parent_id column
      await conn.query(
        'ALTER TABLE navbar_items ADD COLUMN parent_id INT DEFAULT NULL AFTER order_index'
      );
      
      // Add foreign key
      await conn.query(
        'ALTER TABLE navbar_items ADD FOREIGN KEY (parent_id) REFERENCES navbar_items(id) ON DELETE CASCADE'
      );
      
      // Modify href to be nullable and remove UNIQUE
      await conn.query('ALTER TABLE navbar_items MODIFY COLUMN href VARCHAR(255)');
      
      console.log('✓ Migration completed successfully!');
    } else {
      console.log('✓ Column parent_id already exists. No migration needed.');
    }

  } catch (err) {
    console.error('Migration error:', err.message);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

migrate();
