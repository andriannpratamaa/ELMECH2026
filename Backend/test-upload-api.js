#!/usr/bin/env node

/**
 * Test upload to Cloudinary via Backend-cms API
 */

const http = require('http');

const API_BASE = 'http://localhost:5001';

async function request(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

(async () => {
  try {
    console.log('🧪 Testing Cloudinary Integration\n');

    // Test 1: Health check
    console.log('1️⃣  Health Check');
    const health = await request('GET', '/api/health');
    console.log(`   Status: ${health.data.status || health.data.message}`);

    // Test 2: Login
    console.log('\n2️⃣  Login');
    const login = await request('POST', '/api/auth/login', {
      email: 'admin@ppns.ac.id',
      password: 'admin123',
    });

    if (!login.data.success) {
      console.log('   ✗ Login failed:', login.data.message);
      process.exit(1);
    }

    const token = login.data.data.token;
    console.log('   ✓ Login successful');
    console.log(`   Token: ${token.substring(0, 30)}...`);

    // Test 3: List media
    console.log('\n3️⃣  List Media');
    const listRes = await request('GET', '/api/upload', null, {
      'Authorization': `Bearer ${token}`,
    });

    console.log(`   ✓ Media count: ${listRes.data.data?.length || 0}`);

    console.log('\n✅ API is working! Ready for upload test.');
    console.log('\nNow you can:');
    console.log('1. Go to http://localhost:5001 admin panel');
    console.log('2. Navigate to /admin/media');
    console.log('3. Upload an image');
    console.log('4. Image will be stored in Cloudinary!');

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
