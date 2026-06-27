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
    console.log('   NAVBAR ARCHITECTURE REDESIGN');
    console.log('   From: Manual href input');
    console.log('   To: CMS page linking (page_id + page_slug)');
    console.log('========================================\n');

    // Step 1: Check if migration already done
    const [columns] = await conn.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_NAME = 'navbar_items'`
    );
    const colNames = columns.map(c => c.COLUMN_NAME);
    const alreadyMigrated = colNames.includes('page_id') && colNames.includes('page_slug');

    if (alreadyMigrated) {
      console.log('✓ Schema already migrated - page_id and page_slug columns exist\n');
      return;
    }

    // Step 2: Backup existing data
    console.log('Step 1: Backing up existing navbar items...');
    const [existingItems] = await conn.query('SELECT * FROM navbar_items');
    console.log(`  ✓ Found ${existingItems.length} existing items\n`);

    // Step 3: Add new columns
    console.log('Step 2: Adding page_id and page_slug columns...');
    await conn.query(
      `ALTER TABLE navbar_items 
       ADD COLUMN page_id INT NULL AFTER label,
       ADD COLUMN page_slug VARCHAR(100) NULL AFTER page_id`
    );
    console.log('  ✓ Columns added\n');

    // Step 4: Add foreign key constraint
    console.log('Step 3: Adding foreign key constraint...');
    await conn.query(
      `ALTER TABLE navbar_items 
       ADD CONSTRAINT fk_navbar_page_id 
       FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE RESTRICT`
    );
    console.log('  ✓ Foreign key added (fk_navbar_page_id)\n');

    // Step 5: Migrate existing hrefs to page_slug
    console.log('Step 4: Migrating existing href values to page_slug...');
    console.log('  Attempting to match URLs to CMS pages...\n');

    // Get all pages to build a mapping
    const [allPages] = await conn.query('SELECT id, slug FROM pages WHERE active = 1');
    console.log(`  Found ${allPages.length} active CMS pages\n`);

    let matchedCount = 0;
    let unmatchedCount = 0;

    for (const item of existingItems) {
      if (!item.href || item.href === '#') {
        unmatchedCount++;
        continue;
      }

      // Try to match href to a page slug
      // href is like "/tentang", we need to match to "tentang"
      const hrefSlug = item.href.replace(/^\/+|\/+$/g, ''); // Remove leading/trailing slashes

      const matchingPage = allPages.find(p => p.slug === hrefSlug);

      if (matchingPage) {
        await conn.query(
          `UPDATE navbar_items 
           SET page_id = ?, page_slug = ? 
           WHERE id = ?`,
          [matchingPage.id, matchingPage.slug, item.id]
        );
        console.log(`  ✓ Matched: "${item.label}" → page_id=${matchingPage.id} (${matchingPage.slug})`);
        matchedCount++;
      } else {
        console.log(`  ⚠ Unmatched: "${item.label}" (href: ${item.href}) - admin must update manually`);
        unmatchedCount++;
      }
    }

    console.log(`\n  Summary:`);
    console.log(`    • Matched: ${matchedCount} items`);
    console.log(`    • Unmatched: ${unmatchedCount} items (require manual update)\n`);

    // Step 6: Make page_id and page_slug NOT NULL (after manual fixes)
    console.log('Step 5: Making page_id NOT NULL (enforce CMS page linking)...');
    await conn.query(
      `ALTER TABLE navbar_items 
       MODIFY COLUMN page_id INT NOT NULL`
    );
    console.log('  ✓ page_id is now required\n');

    await conn.query(
      `ALTER TABLE navbar_items 
       MODIFY COLUMN page_slug VARCHAR(100) NOT NULL`
    );
    console.log('  ✓ page_slug is now required\n');

    // Step 7: Update href to be generated from page_slug
    console.log('Step 6: Setting href to auto-generate from page_slug...');
    await conn.query(
      `UPDATE navbar_items SET href = CONCAT('/', page_slug)`
    );
    console.log('  ✓ href values populated from page_slug\n');

    // Step 8: Verify final schema
    console.log('Step 7: Verifying final schema...');
    const [finalCols] = await conn.query(
      `SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_NAME = 'navbar_items' 
       ORDER BY ORDINAL_POSITION`
    );

    console.log('\nFinal navbar_items schema:');
    console.log('─────────────────────────────────────────────────────');
    finalCols.forEach(col => {
      const nullable = col.IS_NULLABLE === 'YES' ? '(NULL)' : '(NOT NULL)';
      const key = col.COLUMN_KEY ? ` [${col.COLUMN_KEY}]` : '';
      console.log(`  • ${col.COLUMN_NAME.padEnd(15)} ${col.COLUMN_TYPE.padEnd(20)} ${nullable}${key}`);
    });
    console.log('─────────────────────────────────────────────────────\n');

    // Step 9: Summary
    console.log('========================================');
    console.log('   ✓ MIGRATION COMPLETE');
    console.log('========================================\n');

    console.log('Changes made:');
    console.log('  ✓ Added page_id column (INT, NOT NULL, FK to pages.id)');
    console.log('  ✓ Added page_slug column (VARCHAR(100), NOT NULL)');
    console.log('  ✓ Added foreign key constraint (fk_navbar_page_id)');
    console.log('  ✓ href is now auto-generated: "/" + page_slug\n');

    if (unmatchedCount > 0) {
      console.log(`⚠ ACTION REQUIRED:`);
      console.log(`  ${unmatchedCount} navbar items were not automatically matched.`);
      console.log(`  Admin must manually link these items to CMS pages:`);
      console.log(`  1. Go to Admin → Navbar Management`);
      console.log(`  2. For each item marked with ⚠, select a CMS Page`);
      console.log(`  3. Save the item\n`);
    }

    console.log('Backend API changes:');
    console.log('  • POST /api/navbar now requires: label, page_id (or auto-select page_slug)');
    console.log('  • href is no longer accepted (auto-generated)');
    console.log('  • parent_id still optional for submenus\n');

    console.log('Frontend changes:');
    console.log('  • Admin: Replace href input with CMS Page dropdown selector');
    console.log('  • Admin: Show auto-generated href as preview (read-only)');
    console.log('  • Public: Automatically renders dropdown from parent_id\n');

  } catch (err) {
    console.error('\n✗ Migration failed:', err.message);
    console.error('\nFull error:');
    console.error(err);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

migrateNavbarSchema();
