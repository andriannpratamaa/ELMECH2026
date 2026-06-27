#!/usr/bin/env node

// Database migration script - Add page_id and page_slug columns
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'green_campus_cms',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function checkSchema() {
  const connection = await pool.getConnection();
  
  try {
    console.log('\n========================================');
    console.log('STEP 1: Check Current Schema');
    console.log('========================================\n');

    const [columns] = await connection.query('SHOW COLUMNS FROM navbar_items');
    console.log('Current navbar_items columns:');
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });

    const hasPageId = columns.some(col => col.Field === 'page_id');
    const hasPageSlug = columns.some(col => col.Field === 'page_slug');

    console.log(`\n  page_id exists: ${hasPageId ? '✅ YES' : '❌ NO'}`);
    console.log(`  page_slug exists: ${hasPageSlug ? '✅ YES' : '❌ NO'}`);

    if (!hasPageId || !hasPageSlug) {
      console.log('\n========================================');
      console.log('STEP 2: Add Missing Columns');
      console.log('========================================\n');

      const sql = `
ALTER TABLE navbar_items
ADD COLUMN page_id INT NULL AFTER label,
ADD COLUMN page_slug VARCHAR(255) NULL AFTER page_id
`;

      console.log('Executing SQL:');
      console.log(sql);
      console.log('');

      await connection.query(sql);
      console.log('✅ Columns added successfully\n');

      // Verify columns were added
      const [newColumns] = await connection.query('SHOW COLUMNS FROM navbar_items');
      console.log('Updated navbar_items columns:');
      newColumns.forEach(col => {
        console.log(`  - ${col.Field} (${col.Type})`);
      });
    } else {
      console.log('\n✅ Columns already exist, skipping ALTER TABLE\n');
    }

    console.log('\n========================================');
    console.log('STEP 3: Migrate Existing Data');
    console.log('========================================\n');

    // Get all navbar items
    const [items] = await connection.query('SELECT id, label, href FROM navbar_items WHERE href IS NOT NULL');
    
    if (items.length === 0) {
      console.log('✅ No navbar items to migrate\n');
      return;
    }

    console.log(`Found ${items.length} navbar items to migrate\n`);

    // Get all pages for matching
    const [pages] = await connection.query('SELECT id, slug FROM pages');
    console.log(`Found ${pages.length} pages\n`);

    let migrated = 0;
    let skipped = 0;

    // Process each navbar item
    for (const item of items) {
      const href = item.href || '';
      
      // Extract slug from href (e.g., '/tentang' -> 'tentang')
      const slugFromHref = href.replace(/^\//, '').split('/')[0];
      
      if (!slugFromHref) {
        console.log(`  ⊘ Item ${item.id} "${item.label}": No slug to extract from href="${href}"`);
        skipped++;
        continue;
      }

      // Find matching page by slug
      const matchingPage = pages.find(p => p.slug === slugFromHref);

      if (matchingPage) {
        console.log(`  ✓ Item ${item.id} "${item.label}": href="${href}" → page_id=${matchingPage.id}, page_slug="${matchingPage.slug}"`);
        
        // Update the item
        await connection.query(
          'UPDATE navbar_items SET page_id = ?, page_slug = ? WHERE id = ?',
          [matchingPage.id, matchingPage.slug, item.id]
        );
        migrated++;
      } else {
        console.log(`  ✗ Item ${item.id} "${item.label}": No matching page for slug="${slugFromHref}" (href="${href}")`);
        skipped++;
      }
    }

    console.log(`\n  Migrated: ${migrated}`);
    console.log(`  Skipped/Unmatched: ${skipped}`);

    console.log('\n========================================');
    console.log('STEP 4: Verify Migration');
    console.log('========================================\n');

    const [result] = await connection.query(
      'SELECT id, label, page_id, page_slug, href FROM navbar_items ORDER BY id'
    );

    console.log('Migrated navbar items:');
    result.forEach(item => {
      const status = item.page_id ? '✓' : '⊘';
      console.log(`  ${status} ID=${item.id}, Label="${item.label}", page_id=${item.page_id}, page_slug="${item.page_slug}", href="${item.href}"`);
    });

    console.log('\n========================================');
    console.log('✅ MIGRATION COMPLETE');
    console.log('========================================\n');

    // Show summary
    const withPageId = result.filter(r => r.page_id !== null).length;
    const totalItems = result.length;
    
    console.log(`Total items: ${totalItems}`);
    console.log(`With page_id: ${withPageId}`);
    console.log(`Without page_id: ${totalItems - withPageId}`);
    console.log('');

  } catch (err) {
    console.error('\n❌ ERROR:', err.message);
    console.error('\nSQL Error Details:');
    console.error(`  Code: ${err.code}`);
    console.error(`  SQL: ${err.sql}`);
    process.exit(1);
  } finally {
    await connection.release();
    await pool.end();
  }
}

checkSchema();
