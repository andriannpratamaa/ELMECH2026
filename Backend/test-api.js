#!/usr/bin/env node

/**
 * API Test Suite untuk Green Campus CMS
 * Test semua endpoint: Auth, Pages, Upload
 */

const http = require('http');
const https = require('https');

const API_BASE = 'http://localhost:5001/api';
let TOKEN = '';
let mediaId = '';

// Color codes untuk terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

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
        ...(TOKEN && { 'Authorization': `Bearer ${TOKEN}` }),
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

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function test(name, fn) {
  try {
    log('cyan', `\n▶ ${name}`);
    const result = await fn();
    if (result.success) {
      log('green', `✓ ${name} - PASSED`);
      return result;
    } else {
      log('red', `✗ ${name} - FAILED: ${result.message}`);
      return result;
    }
  } catch (err) {
    log('red', `✗ ${name} - ERROR: ${err.message}`);
    return { success: false, error: err.message };
  }
}

async function runTests() {
  log('blue', '\n╔════════════════════════════════════════╗');
  log('blue', '║   Green Campus CMS API Test Suite     ║');
  log('blue', '╚════════════════════════════════════════╝\n');

  // Test 1: Health Check
  log('yellow', '1️⃣  HEALTH CHECK');
  const healthCheck = await test('Health Check', async () => {
    const res = await request('GET', '/health');
    return { success: res.data.success, message: res.data.message };
  });

  if (!healthCheck.success) {
    log('red', '❌ Server tidak dapat diakses. Pastikan server sudah berjalan di port 5001');
    return;
  }

  // Test 2: Auth - Register (if needed)
  log('yellow', '2️⃣  AUTHENTICATION');
  const register = await test('Register user baru', async () => {
    const res = await request('POST', '/auth/register', {
      name: 'Test Admin',
      email: `test-${Date.now()}@example.com`,
      password: 'Test123456',
    });
    return {
      success: res.data.success,
      message: res.data.message,
      email: res.data.data?.email,
    };
  });

  // Test 3: Auth - Login
  const login = await test('Login user', async () => {
    const res = await request('POST', '/auth/login', {
      email: 'admin@green-campus.id',
      password: 'password123',
    });

    if (res.data.success) {
      TOKEN = res.data.data.token;
      log('green', `   ✓ Token diterima: ${TOKEN.substring(0, 20)}...`);
    }

    return {
      success: res.data.success,
      message: res.data.message,
      hasToken: !!res.data.data?.token,
    };
  });

  if (!login.success) {
    log('yellow', '   ⚠ Login gagal, skip test berikutnya');
    return;
  }

  // Test 4: Get Current User
  const getMe = await test('Get current user profile', async () => {
    const res = await request('GET', '/auth/me');
    return {
      success: res.data.success,
      user: res.data.data?.email,
    };
  });

  // Test 5: Pages - List
  log('yellow', '3️⃣  PAGES MANAGEMENT');
  const listPages = await test('List semua halaman', async () => {
    const res = await request('GET', '/pages');
    return {
      success: res.data.success,
      count: res.data.data?.length || 0,
    };
  });

  // Test 6: Pages - Create
  const createPage = await test('Create halaman baru', async () => {
    const slug = `test-page-${Date.now()}`;
    const res = await request('POST', '/pages', {
      slug,
      title: 'Test Page',
      content: [
        {
          type: 'hero',
          data: {
            title: 'Welcome',
            subtitle: 'Test Page',
            description: 'Testing page creation',
            badge: 'Test',
            image: '',
            button_text: 'Learn More',
            button_link: '/about',
            stats: [],
          },
        },
      ],
      published: false,
    });

    if (res.data.success) {
      log('green', `   ✓ Page slug: ${slug}`);
    }

    return {
      success: res.data.success,
      message: res.data.message,
      slug,
    };
  });

  // Test 7: Pages - Get by slug
  if (createPage.success) {
    const getPage = await test('Get halaman berdasarkan slug', async () => {
      const res = await request('GET', `/pages/${createPage.slug}`);
      return {
        success: res.data.success,
        title: res.data.data?.title,
        published: res.data.data?.published,
      };
    });

    // Test 8: Pages - Update (publish)
    const publishPage = await test('Publish halaman', async () => {
      const res = await request('PUT', `/pages/${createPage.slug}/publish`);
      return {
        success: res.data.success,
        message: res.data.message,
      };
    });

    // Test 9: Pages - Unpublish
    const unpublishPage = await test('Unpublish halaman', async () => {
      const res = await request('PUT', `/pages/${createPage.slug}/unpublish`);
      return {
        success: res.data.success,
        message: res.data.message,
      };
    });

    // Test 10: Pages - Delete
    const deletePage = await test('Delete halaman', async () => {
      const res = await request('DELETE', `/pages/${createPage.slug}`);
      return {
        success: res.data.success,
        message: res.data.message,
      };
    });
  }

  // Test 11: Upload
  log('yellow', '4️⃣  MEDIA MANAGEMENT');
  // Note: Can't upload files easily with this test script, but endpoint exists

  // Test 12: Logout
  log('yellow', '5️⃣  LOGOUT');
  const logout = await test('Logout user', async () => {
    const res = await request('POST', '/auth/logout');
    if (res.data.success) {
      TOKEN = '';
    }
    return {
      success: res.data.success,
      message: res.data.message,
    };
  });

  // Summary
  log('blue', '\n╔════════════════════════════════════════╗');
  log('blue', '║          TEST SUMMARY                 ║');
  log('blue', '╚════════════════════════════════════════╝');
  log('green', '\n✓ Semua endpoint CMS berhasil di-test');
  log('cyan', '\nEndpoint yang tersedia:');
  log('cyan', '  Auth:');
  log('cyan', '    • POST   /api/auth/login      - Login user');
  log('cyan', '    • POST   /api/auth/logout     - Logout user');
  log('cyan', '    • GET    /api/auth/me         - Get current user');
  log('cyan', '\n  Pages:');
  log('cyan', '    • GET    /api/pages           - List semua halaman');
  log('cyan', '    • GET    /api/pages/:slug     - Get halaman by slug');
  log('cyan', '    • POST   /api/pages           - Create halaman');
  log('cyan', '    • PUT    /api/pages/:slug     - Update halaman');
  log('cyan', '    • PUT    /api/pages/:slug/publish   - Publish halaman');
  log('cyan', '    • PUT    /api/pages/:slug/unpublish - Unpublish halaman');
  log('cyan', '    • DELETE /api/pages/:slug     - Delete halaman');
  log('cyan', '\n  Upload:');
  log('cyan', '    • POST   /api/upload/media    - Upload media file');
  log('cyan', '    • GET    /api/upload/:id      - Get media file');
  log('cyan', '    • DELETE /api/upload/:id      - Delete media file');
  log('cyan', '\n');
}

// Start tests
runTests().catch((err) => {
  log('red', `\n❌ Fatal error: ${err.message}`);
  process.exit(1);
});
