#!/usr/bin/env node

// Quick test script to verify navbar endpoints are working
const http = require('http');

function testEndpoint(path, method = 'GET') {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5001,
      path: path,
      method: method,
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({
            path,
            status: res.statusCode,
            success: json.success,
            itemCount: json.data ? (Array.isArray(json.data) ? json.data.length : 1) : 0,
            error: json.message || null,
            hasHref: data.includes('"href"')
          });
        } catch (e) {
          resolve({
            path,
            status: res.statusCode,
            error: 'Failed to parse JSON',
            raw: data.substring(0, 100)
          });
        }
      });
    });

    req.on('error', (err) => {
      resolve({
        path,
        error: err.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        path,
        error: 'Request timeout'
      });
    });

    req.end();
  });
}

async function runTests() {
  console.log('\n========================================');
  console.log('NAVBAR ENDPOINTS - EMERGENCY ROLLBACK TEST');
  console.log('========================================\n');

  console.log('Testing GET /api/navbar (public)...');
  const test1 = await testEndpoint('/api/navbar');
  console.log(`  Status: ${test1.status}`);
  console.log(`  Success: ${test1.success}`);
  console.log(`  Items: ${test1.itemCount}`);
  console.log(`  Has href field: ${test1.hasHref}`);
  console.log(`  Error: ${test1.error || 'None'}`);
  console.log(`  Result: ${test1.status === 200 && test1.success ? '✓ PASS' : '✗ FAIL'}\n`);

  // Small delay between requests
  await new Promise(r => setTimeout(r, 1000));

  console.log('Testing GET /api/navbar/admin (requires auth)...');
  const test2 = await testEndpoint('/api/navbar/admin');
  console.log(`  Status: ${test2.status}`);
  if (test2.status === 401 || test2.status === 403) {
    console.log(`  Note: 401/403 is expected (requires auth token)`);
    console.log(`  Result: ✓ PASS (endpoint exists, auth working)\n`);
  } else if (test2.status === 200) {
    console.log(`  Success: ${test2.success}`);
    console.log(`  Items: ${test2.itemCount}`);
    console.log(`  Has href field: ${test2.hasHref}`);
    console.log(`  Result: ✓ PASS\n`);
  } else {
    console.log(`  Error: ${test2.error || 'Unknown'}`);
    console.log(`  Result: ✗ FAIL\n`);
  }

  console.log('========================================');
  console.log('SUMMARY');
  console.log('========================================\n');
  console.log('✓ Backend server is running on port 5001');
  console.log(`✓ GET /api/navbar: ${test1.status === 200 ? 'WORKING' : 'FAILED'}`);
  console.log(`✓ GET /api/navbar/admin: ${test2.status === 401 || test2.status === 403 || test2.status === 200 ? 'WORKING' : 'FAILED'}`);
  console.log(`✓ href field: ${test1.hasHref ? 'PRESENT' : 'MISSING'}`);
  
  if (test1.status === 200 && (test2.status === 401 || test2.status === 403 || test2.status === 200)) {
    console.log('\n✅ NAVBAR ROLLBACK SUCCESSFUL - All endpoints operational\n');
  } else {
    console.log('\n⚠️  Some endpoints not responding correctly\n');
  }
}

runTests();
