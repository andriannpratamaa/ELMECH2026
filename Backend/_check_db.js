const mysql = require('mysql2/promise');
async function run() {
  const conn = await mysql.createConnection({host:'localhost',user:'root',password:'',port:3306,database:'green_campus_cms'});

  const [blocks] = await conn.query(
    'SELECT pb.* FROM page_blocks pb JOIN pages p ON pb.page_id = p.id WHERE p.slug = ? ORDER BY pb.sort_order',
    ['']
  );
  console.log('Home page blocks:', blocks.length);
  for (const b of blocks) {
    console.log('  [' + b.sort_order + '] ' + b.type + ': ' + JSON.stringify(b.content).substring(0,150) + '...');
  }

  const [pages] = await conn.query('SELECT slug, template FROM pages ORDER BY slug');
  console.log('\nAll pages:');
  for (const p of pages) {
    const [b] = await conn.query('SELECT type, sort_order FROM page_blocks WHERE page_id IN (SELECT id FROM pages WHERE slug = ?) ORDER BY sort_order', [p.slug]);
    console.log('  /' + p.slug + ' (template: ' + p.template + ') blocks: ' + b.map(x => x.type).join(', '));
  }

  await conn.end();
}
run().catch(e => { console.error(e.message); process.exit(1); });
