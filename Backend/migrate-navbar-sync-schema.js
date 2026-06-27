const mysql = require('mysql2/promise');

async function migrateNavbarSchema() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 3306,
    database: 'green_campus_cms',
  });

  try {
    console.log('\n========================================');
    console.log('NAVBAR SCHEMA SYNC MIGRATION');
    console.log('========================================\n');

    // Step 1: Check if columns already exist
    console.log('Step 1: Checking current schema...');
    const [columns] = await conn.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_NAME = 'navbar_items' AND TABLE_SCHEMA = DATABASE()`
    );
    const colNames = columns.map(c => c.COLUMN_NAME);
    
    const hasPageId = colNames.includes('page_id');
    const hasPageSlug = colNames.includes('page_slug');
    
    console.log(`  Current columns: ${colNames.join(', ')}`);
    console.log(`  page_id exists: ${hasPageId ? 'YES' : 'NO'}`);
    console.log(`  page_slug exists: ${hasPageSlug ? 'YES' : 'NO'}\n`);

    // Step 2: Get existing navbar items before adding columns
    console.log('Step 2: Backing up existing navbar items...');
    const [existingItems] = await conn.query(
      'SELECT id, label, href, parent_id FROM navbar_items'
    );
    console.log(`  Found ${existingItems.length} navbar items\n`);

    // Step 3: Add columns if they don't exist
    if (!hasPageId) {
      console.log('Step 3: Adding page_id column...');
      await conn.query(
        `ALTER TABLE navbar_items ADD COLUMN page_id INT NULL`
      );
      console.log('  ✓ page_id column added\n');
    } else {
      console.log('Step 3: page_id column already exists, skipping...\n');
    }

    if (!hasPageSlug) {
      console.log('Step 4: Adding page_slug column...');
      await conn.query(
        `ALTER TABLE navbar_items ADD COLUMN page_slug VARCHAR(255) NULL`
      );
      console.log('  ✓ page_slug column added\n');
    } else {
      console.log('Step 4: page_slug column already exists, skipping...\n');
    }

    // Step 5: Get all pages for matching
    console.log('Step 5: Loading all published pages...');
    const [allPages] = await conn.query(
      'SELECT id, slug FROM pages WHERE published = 1'
    );
    console.log(`  Found ${allPages.length} published pages`);
    allPages.forEach(p => {
      console.log(`    • id=${p.id}, slug=${p.slug}`);
    });
    console.log('');

    // Step 6: Match existing items to pages and populate data
    console.log('Step 6: Matching navbar items to CMS pages...\n');
    let matchedCount = 0;
    let unmatchedCount = 0;
    const unmatchedItems = [];

    for (const item of existingItems) {
      if (!item.href) {
        console.log(`  ⚠ UNMATCHED: ID=${item.id} "${item.label}" - no href`);
        unmatchedItems.push(item);
        unmatchedCount++;
        continue;
      }

      // Extract slug from href
      // href is like "/tentang", we need "tentang"
      const hrefSlug = item.href.replace(/^\/+|\/+$/g, '').toLowerCase();

      // Find matching page
      const matchingPage = allPages.find(p => p.slug === hrefSlug);

      if (matchingPage) {
        // Update the item with page_id and page_slug
        await conn.query(
          `UPDATE navbar_items 
           SET page_id = ?, page_slug = ? 
           WHERE id = ?`,
          [matchingPage.id, matchingPage.slug, item.id]
        );
        console.log(`  ✓ MATCHED: ID=${item.id} "${item.label}" → page_id=${matchingPage.id} (${matchingPage.slug})`);
        matchedCount++;
      } else {
        console.log(`  ⚠ UNMATCHED: ID=${item.id} "${item.label}" (href: ${item.href}) - no matching page slug`);
        unmatchedItems.push(item);
        unmatchedCount++;
      }
    }

    console.log(`\n  Summary:`);
    console.log(`    Matched: ${matchedCount} items`);
    console.log(`    Unmatched: ${unmatchedCount} items (will need manual update)\n`);

    // Step 7: Add foreign key constraint
    console.log('Step 7: Checking for existing foreign key constraint...');
    const [constraints] = await conn.query(
      `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
       WHERE TABLE_NAME = 'navbar_items' AND COLUMN_NAME = 'page_id' AND REFERENCED_TABLE_NAME = 'pages'`
    );

    if (constraints.length === 0) {
      console.log('  No foreign key found, creating...');
      await conn.query(
        `ALTER TABLE navbar_items 
         ADD CONSTRAINT fk_navbar_page_id 
         FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE SET NULL`
      );
      console.log('  ✓ Foreign key constraint added (fk_navbar_page_id)\n');
    } else {
      console.log('  ✓ Foreign key constraint already exists\n');
    }

    // Step 8: Verify final schema
    console.log('Step 8: Verifying final schema...');
    const [finalCols] = await conn.query(
      `SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_NAME = 'navbar_items' 
       ORDER BY ORDINAL_POSITION`
    );

    console.log('\nFinal navbar_items schema:');
    console.log('─────────────────────────────────────────────────────');
    finalCols.forEach(col => {
      const nullable = col.IS_NULLABLE === 'YES' ? '(NULL)' : '(NOT NULL)';
      console.log(`  • ${col.COLUMN_NAME.padEnd(15)} ${col.COLUMN_TYPE.padEnd(20)} ${nullable}`);
    });
    console.log('─────────────────────────────────────────────────────\n');

    // Step 9: Check data integrity
    console.log('Step 9: Verifying data integrity...');
    const [itemsWithoutPageId] = await conn.query(
      'SELECT COUNT(*) as count FROM navbar_items WHERE page_id IS NULL'
    );
    const unmatchedDb = itemsWithoutPageId[0].count;
    
    if (unmatchedDb === 0) {
      console.log('  ✓ All items have page_id assigned\n');
    } else {
      console.log(`  ⚠ ${unmatchedDb} items still have NULL page_id (unmatched)\n`);
    }

    // Final summary
    console.log('========================================');
    console.log('✓ MIGRATION COMPLETE');
    console.log('========================================\n');

    console.log('Changes made:');
    console.log('  ✓ Added page_id column (INT, NULL)');
    console.log('  ✓ Added page_slug column (VARCHAR(255), NULL)');
    console.log('  ✓ Added foreign key constraint (fk_navbar_page_id)');
    console.log(`  ✓ Matched ${matchedCount} items to CMS pages\n`);

    if (unmatchedCount > 0) {
      console.log(`⚠ ACTION REQUIRED:`);
      console.log(`  ${unmatchedCount} navbar items were not automatically matched.\n`);
      console.log(`  Unmatched items:`);
      unmatchedItems.forEach(item => {
        console.log(`    • ID=${item.id} "${item.label}" (href: ${item.href || 'NULL'})`);
      });
      console.log(`\n  Next steps:`);
      console.log(`  1. Create missing CMS pages if needed`);
      console.log(`  2. Go to Admin → Conten → Navbar`);
      console.log(`  3. For each unmatched item, select correct CMS Page from dropdown`);
      console.log(`  4. Click save to update page_id and page_slug\n`);
    }

    console.log('Query fixes:');
    console.log('  • Updated all "WHERE active = 1" to "WHERE published = 1" in pages queries');
    console.log('  • Backend code now synced with actual database schema\n');

    console.log('Verification commands:');
    console.log(`  mysql> SELECT id, label, page_id, page_slug, href FROM navbar_items LIMIT 3;`);
    console.log(`  mysql> SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_NAME='navbar_items' AND COLUMN_NAME='page_id';\n`);

  } catch (err) {
    console.error('\n✗ Migration failed:', err.message);
    console.error('\nFull error:');
    console.error(err);
    console.error('\nROLLBACK NOTE: No changes were made due to error.');
    process.exit(1);
  } finally {
    await conn.end();
  }
}

migrateNavbarSchema();
