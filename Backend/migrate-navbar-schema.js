const mysql = require('mysql2/promise');

async function migratePi() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 3306,
    database: 'green_campus_cms',
  });

  try {
    console.log('\n========================================');
    console.log('NAVBAR MIGRATION: Adding submenu support');
    console.log('========================================\n');

    // Check if parent_id column exists
    const [columns] = await conn.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'navbar_items' AND COLUMN_NAME = 'parent_id'"
    );

    if (columns.length === 0) {
      console.log('Step 1: Dropping UNIQUE constraint on href...');
      try {
        await conn.query('ALTER TABLE navbar_items DROP INDEX href');
        console.log('✓ Dropped UNIQUE constraint\n');
      } catch (e) {
        console.log('⚠ UNIQUE constraint might not exist, continuing...\n');
      }

      console.log('Step 2: Modifying href column to be nullable...');
      await conn.query('ALTER TABLE navbar_items MODIFY COLUMN href VARCHAR(255)');
      console.log('✓ href column now nullable\n');

      console.log('Step 3: Adding parent_id column...');
      await conn.query(
        'ALTER TABLE navbar_items ADD COLUMN parent_id INT DEFAULT NULL AFTER active'
      );
      console.log('✓ parent_id column added\n');

      console.log('Step 4: Adding foreign key constraint...');
      await conn.query(
        'ALTER TABLE navbar_items ADD CONSTRAINT fk_navbar_parent FOREIGN KEY (parent_id) REFERENCES navbar_items(id) ON DELETE CASCADE'
      );
      console.log('✓ Foreign key added\n');

      console.log('✓ Migration completed successfully!');
      console.log('\n========================================\n');
    } else {
      console.log('✓ Column parent_id already exists. No migration needed.\n');
    }

    // Verify the schema
    console.log('Verifying schema...');
    const [newColumns] = await conn.query('SHOW COLUMNS FROM navbar_items');
    console.log('\nFinal Schema:');
    newColumns.forEach(col => {
      console.log(`  • ${col.Field}: ${col.Type} (${col.Null === 'NO' ? 'NOT NULL' : 'nullable'}) ${col.Key ? '(' + col.Key + ')' : ''}`);
    });
    console.log();

  } catch (err) {
    console.error('\n✗ Migration error:', err.message);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

migratePi();
