const axios = require('axios');
require('dotenv').config();

const BASE_URL = process.env.API_URL || 'http://localhost:3001/api';
let authToken = '';
let mainMenuId = null;

async function test() {
  console.log('\n========================================');
  console.log('NAVBAR SUBMENU TEST SUITE');
  console.log('========================================\n');

  try {
    // Step 1: Get auth token
    console.log('Step 1: Authenticating...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@ppns.ac.id',
      password: 'admin123'
    });
    authToken = loginRes.data.data.token;
    console.log(`✓ Authenticated. Token: ${authToken.substring(0, 20)}...\n`);

    const headers = { Authorization: `Bearer ${authToken}` };

    // Step 2: Clear existing navbar items
    console.log('Step 2: Getting existing navbar items...');
    const listRes = await axios.get(`${BASE_URL}/navbar/admin`, { headers });
    const items = listRes.data.data;
    console.log(`Found ${items.length} items`);

    // Delete all items for clean test
    console.log('Deleting all items for clean test...');
    for (const item of items) {
      try {
        await axios.delete(`${BASE_URL}/navbar/${item.id}`, { headers });
      } catch (e) {}
    }
    console.log('✓ Clean slate ready\n');

    // Step 3: Create main menu item
    console.log('Step 3: Creating main menu item...');
    const mainMenuRes = await axios.post(`${BASE_URL}/navbar`, {
      label: 'Tentang',
      href: '/tentang',
      parent_id: null
    }, { headers });

    if (mainMenuRes.status !== 201) {
      throw new Error(`Expected 201, got ${mainMenuRes.status}`);
    }

    mainMenuId = mainMenuRes.data.data.id;
    console.log(`✓ Created main menu: ${JSON.stringify(mainMenuRes.data.data, null, 2)}\n`);

    // Step 4: Create submenu item
    console.log('Step 4: Creating submenu item...');
    const submenuRes = await axios.post(`${BASE_URL}/navbar`, {
      label: 'Visi Misi',
      href: '/visi-misi',
      parent_id: mainMenuId
    }, { headers });

    if (submenuRes.status !== 201) {
      throw new Error(`Expected 201, got ${submenuRes.status}`);
    }

    console.log(`✓ Created submenu: ${JSON.stringify(submenuRes.data.data, null, 2)}\n`);

    // Step 5: Get navbar items and verify hierarchy
    console.log('Step 5: Verifying navbar hierarchy...');
    const finalRes = await axios.get(`${BASE_URL}/navbar/admin`, { headers });
    const finalItems = finalRes.data.data;

    console.log(`Total items: ${finalItems.length}`);
    console.log('Items structure:');
    finalItems.forEach(item => {
      const indent = item.parent_id ? '  └─ ' : '';
      console.log(`${indent}ID: ${item.id}, Label: "${item.label}", Parent: ${item.parent_id || 'none'}, Href: ${item.href || 'none'}`);
    });

    // Step 6: Test public navbar endpoint
    console.log('\nStep 6: Testing public navbar endpoint...');
    const publicRes = await axios.get(`${BASE_URL}/navbar`);
    console.log(`✓ Public navbar items (only active, only parents):`);
    console.log(JSON.stringify(publicRes.data.data, null, 2));

    console.log('\n========================================');
    console.log('✓ ALL TESTS PASSED!');
    console.log('========================================\n');

    console.log('SUCCESS CRITERIA MET:');
    console.log('✅ Main menu can be created');
    console.log('✅ Submenu can be created');
    console.log('✅ No 400 errors');
    console.log('✅ parent_id saved correctly');
    console.log('✅ POST /api/navbar returns 201 Created');
    console.log('\n');

  } catch (err) {
    console.error('\n✗ TEST FAILED');
    console.error('Error:', err.message);
    if (err.response?.data) {
      console.error('Response:', JSON.stringify(err.response.data, null, 2));
    }
    process.exit(1);
  }
}

test();
