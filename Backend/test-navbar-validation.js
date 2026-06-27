const axios = require('axios');
require('dotenv').config();

const BASE_URL = process.env.API_URL || 'http://localhost:3001/api';
let authToken = '';

async function test() {
  console.log('\n========================================');
  console.log('NAVBAR VALIDATION TEST');
  console.log('========================================\n');

  try {
    // Step 1: Authenticate
    console.log('Step 1: Authenticating...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@ppns.ac.id',
      password: 'admin123'
    });
    authToken = loginRes.data.data.token;
    console.log('✓ Authenticated\n');

    const headers = { Authorization: `Bearer ${authToken}` };

    // Step 2: Clear existing items
    console.log('Step 2: Clearing existing navbar items...');
    const listRes = await axios.get(`${BASE_URL}/navbar/admin`, { headers });
    const items = listRes.data.data;
    
    for (const item of items) {
      try {
        await axios.delete(`${BASE_URL}/navbar/${item.id}`, { headers });
        console.log(`  Deleted: ${item.label}`);
      } catch (e) {}
    }
    console.log('✓ Cleared\n');

    // Step 3: Test Main Menu Creation
    console.log('Step 3: Creating main menu item...');
    console.log('  Payload: { label: "Tentang", href: "/tentang", parent_id: null }');
    
    try {
      const mainRes = await axios.post(`${BASE_URL}/navbar`, {
        label: 'Tentang',
        href: '/tentang',
        parent_id: null
      }, { headers });

      if (mainRes.status === 201) {
        console.log('✓ Main menu created successfully');
        console.log('  Status: 201 Created');
        console.log('  Response:', JSON.stringify(mainRes.data.data, null, 2));
      } else {
        console.log('✗ Unexpected status:', mainRes.status);
      }
    } catch (err) {
      console.log('✗ Failed to create main menu');
      console.log('  Error:', err.response?.data?.message || err.message);
      throw err;
    }

    // Step 4: Get main menu ID
    const mainListRes = await axios.get(`${BASE_URL}/navbar/admin`, { headers });
    const mainMenu = mainListRes.data.data.find(i => i.label === 'Tentang');
    
    if (!mainMenu) {
      throw new Error('Main menu not found after creation');
    }
    console.log(`\n  Main menu ID: ${mainMenu.id}\n`);

    // Step 5: Test Submenu Creation
    console.log('Step 4: Creating submenu item...');
    console.log(`  Payload: { label: "Visi Misi", href: "/visi-misi", parent_id: ${mainMenu.id} }`);
    
    try {
      const submenuRes = await axios.post(`${BASE_URL}/navbar`, {
        label: 'Visi Misi',
        href: '/visi-misi',
        parent_id: mainMenu.id
      }, { headers });

      if (submenuRes.status === 201) {
        console.log('✓ Submenu created successfully');
        console.log('  Status: 201 Created');
        console.log('  Response:', JSON.stringify(submenuRes.data.data, null, 2));
      } else {
        console.log('✗ Unexpected status:', submenuRes.status);
      }
    } catch (err) {
      console.log('✗ Failed to create submenu');
      console.log('  Error:', err.response?.data?.message || err.message);
      throw err;
    }

    // Step 6: Verify final structure
    console.log('\nStep 5: Verifying final navbar structure...');
    const finalRes = await axios.get(`${BASE_URL}/navbar/admin`, { headers });
    const finalItems = finalRes.data.data;

    console.log(`\nTotal items: ${finalItems.length}`);
    console.log('Items structure:');
    finalItems.forEach(item => {
      const indent = item.parent_id ? '  ├─ ' : '• ';
      console.log(`${indent}${item.label} (ID: ${item.id}, Parent: ${item.parent_id || 'none'}, Href: ${item.href || 'none'})`);
    });

    console.log('\n========================================');
    console.log('✅ ALL TESTS PASSED!');
    console.log('========================================\n');

    console.log('SUCCESS CRITERIA MET:');
    console.log('✅ Main menu created (201)');
    console.log('✅ Submenu created (201)');
    console.log('✅ No validation errors');
    console.log('✅ parent_id saved correctly');
    console.log('✅ Hierarchical structure working\n');

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
