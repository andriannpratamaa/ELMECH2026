const mysql = require('mysql2/promise');

async function rollbackNavbarMigration() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 3306,
    database: 'green_campus_cms',
  });

  try {
    console.log('\n========================================');
    console.log('NAVBAR SCHEMA SYNC - ROLLBACK');
    console.log('========================================\n');

    console.log('Step 1: Checking for foreign key constraint...');
    const [constraints] = await conn.query(
      `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
       WHERE TABLE_NAME = 'navbar_items' AND COLUMN_NAME = 'page_id' 
       AND REFERENCED_TABLE_NAME = 'pages'`
    );

    if (constraints.length > 0) {
      console.log('  Found foreign key constraint, dropping...');
      await conn.query(
        `ALTER TABLE navbar_items DROP FOREIGN KEY ${constraints[0].CONSTRAINT_NAME}`
      );
      console.log(`  ✓ Dropped constraint: ${constraints[0].CONSTRAINT_NAME}\n`);
    } else {
      console.log('  No foreign key constraint found\n');
    }

    console.log('Step 2: Checking for page_id column...');
    const [columns1] = await conn.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_NAME = 'navbar_items' AND COLUMN_NAME = 'page_id'`
    );

    if (columns1.length > 0) {
      console.log('  page_id column exists, dropping...');
      await conn.query('ALTER TABLE navbar_items DROP COLUMN page_id');
      console.log('  ✓ Dropped page_id column\n');
    } else {
      console.log('  page_id column does not exist\n');
    }

    console.log('Step 3: Checking for page_slug column...');
    const [columns2] = await conn.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_NAME = 'navbar_items' AND COLUMN_NAME = 'page_slug'`
    );

    if (columns2.length > 0) {
      console.log('  page_slug column exists, dropping...');
      await conn.query('ALTER TABLE navbar_items DROP COLUMN page_slug');
      console.log('  ✓ Dropped page_slug column\n');
    } else {
      console.log('  page_slug column does not exist\n');
    }

    console.log('Step 4: Verifying final schema...');
    const [finalCols] = await conn.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_NAME = 'navbar_items' ORDER BY ORDINAL_POSITION`
    );

    console.log('\nFinal navbar_items schema:');
    console.log('─────────────────────────────────────────────────────');
    finalCols.forEach(col => {
      console.log(`  • ${col.COLUMN_NAME}`);
    });
    console.log('─────────────────────────────────────────────────────\n');

    console.log('========================================');
    console.log('✓ ROLLBACK COMPLETE');
    console.log('========================================\n');
    console.log('Schema reverted to original state');
    console.log('page_id and page_slug columns removed');
    console.log('Foreign key constraint removed\n');

  } catch (err) {
    console.error('\n✗ Rollback failed:', err.message);
    console.error('\nFull error:');
    console.error(err);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

rollbackNavbarMigration();
