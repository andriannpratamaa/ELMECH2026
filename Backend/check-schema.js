const mysql = require('mysql2/promise');

async function checkSchema() {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306,
      database: 'green_campus_cms'
    });

    console.log('\n=== NAVBAR_ITEMS TABLE SCHEMA ===\n');
    
    const [cols] = await conn.query(
      `SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_NAME = 'navbar_items' 
       ORDER BY ORDINAL_POSITION`
    );

    cols.forEach(c => {
      const key = c.COLUMN_KEY ? '(' + c.COLUMN_KEY + ')' : '';
      console.log(`  ${c.COLUMN_NAME.padEnd(15)} | ${c.COLUMN_TYPE.padEnd(15)} | ${c.IS_NULLABLE.padEnd(3)} | ${key}`);
    });

    console.log('\n=== CHECKING FOR parent_id ===\n');
    const hasParentId = cols.some(c => c.COLUMN_NAME === 'parent_id');
    if (hasParentId) {
      console.log('✅ parent_id column EXISTS');
      const parentCol = cols.find(c => c.COLUMN_NAME === 'parent_id');
      console.log(`   Type: ${parentCol.COLUMN_TYPE}`);
      console.log(`   Nullable: ${parentCol.IS_NULLABLE}`);
      console.log(`   Key: ${parentCol.COLUMN_KEY || 'none'}`);
    } else {
      console.log('❌ parent_id column MISSING - Migration needed!');
    }

    console.log('\n=== CHECKING FOR FOREIGN KEY ===\n');
    const [fkInfo] = await conn.query(
      `SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
       FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
       WHERE TABLE_NAME = 'navbar_items' AND COLUMN_NAME = 'parent_id'`
    );

    if (fkInfo.length > 0) {
      console.log('✅ Foreign key EXISTS');
      fkInfo.forEach(fk => {
        console.log(`   Constraint: ${fk.CONSTRAINT_NAME}`);
        console.log(`   Column: ${fk.COLUMN_NAME}`);
        console.log(`   References: ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
      });
    } else {
      console.log('⚠️  No foreign key found for parent_id');
    }

    await conn.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkSchema();
