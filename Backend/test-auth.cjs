require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

(async () => {
  // Check DB
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ppns_lab_inspection',
  });
  const [users] = await conn.query('SELECT id, name, email, role, password FROM users WHERE email = ?', ['admin@ppns.ac.id']);
  if (users.length === 0) {
    console.log('Admin user NOT FOUND in DB');
    const hash = bcrypt.hashSync('admin123', 10);
    await conn.query("INSERT INTO users (name, nip, email, password, role) VALUES (?, ?, ?, ?, ?)",
      ['Admin PPNS', '', 'admin@ppns.ac.id', hash, 'admin']);
    console.log('Admin user CREATED');
  } else {
    const u = users[0];
    const valid = await bcrypt.compare('admin123', u.password);
    console.log('Admin FOUND: id=' + u.id + ' email=' + u.email + ' role=' + u.role);
    console.log('bcrypt(admin123) match: ' + valid);
    if (!valid) {
      const hash = bcrypt.hashSync('admin123', 10);
      await conn.query("UPDATE users SET password = ? WHERE id = ?", [hash, u.id]);
      console.log('Password RE-HASHED');
    }
  }

  // Test via HTTP
  const http = require('http');
  const data = JSON.stringify({ email: 'admin@ppns.ac.id', password: 'admin123' });
  const req = http.request({
    hostname: 'localhost', port: 5000, path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
  }, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log('HTTP Status:', res.statusCode);
      try { console.log('Response:', JSON.parse(body)); } catch { console.log('Raw:', body); }
      process.exit();
    });
  });
  req.on('error', (e) => { console.log('HTTP ERROR:', e.message); process.exit(); });
  req.write(data);
  req.end();
})();
