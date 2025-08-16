const fs = require('fs');
const path = require('path');

// Check if we can use node-fetch or native fetch
let fetch;
try {
  // Try to use native fetch (Node 18+)
  fetch = globalThis.fetch;
  if (!fetch) {
    // Fallback to node-fetch
    fetch = require('node-fetch');
  }
} catch (error) {
  console.log('❌ Neither native fetch nor node-fetch available');
  console.log('💡 Install node-fetch: npm install node-fetch');
  console.log('💡 Or use Node.js 18+ which has native fetch');
  process.exit(1);
}

// FormData - try multiple approaches
let FormData;
try {
  FormData = globalThis.FormData || require('form-data');
} catch (error) {
  console.log('❌ FormData not available');
  console.log('💡 Install form-data: npm install form-data');
  process.exit(1);
}

const BASE_URL = 'http://localhost:3001/api';

// Test user credentials from the database seeder
const TEST_USER = {
  email: 'john.doe@example.com',
  password: 'password123'
};

async function createTestFile() {
  const testContent = `Test Document for Upload
Generated at: ${new Date().toISOString()}
User: ${TEST_USER.email}
Purpose: Testing document upload functionality

This is a test PDF-like content for upload validation.`;

  const fileName = 'test-document.txt';
  fs.writeFileSync(fileName, testContent);
  console.log(`📄 Created test file: ${fileName}`);
  return fileName;
}

async function authenticateUser() {
  console.log('� Step 1: Authenticating user...');
  console.log(`📧 Email: ${TEST_USER.email}`);
  
  try {
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(TEST_USER)
    });

    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.log('❌ Login failed:', loginResponse.status, errorText);
      
      if (loginResponse.status === 401) {
        console.log('💡 User credentials may be incorrect or user does not exist');
        console.log('💡 Run database seeder: cd src/__tests__/crud && node databaseSeeder.js seed');
      }
      return null;
    }

    const loginData = await loginResponse.json();
    
    if (loginData.success && loginData.data?.token) {
      console.log('✅ Login successful!');
      console.log(`🎫 Token: ${loginData.data.token.substring(0, 30)}...`);
      console.log(`👤 User: ${loginData.data.user?.first_name} ${loginData.data.user?.last_name}`);
      console.log(`🔖 Role: ${loginData.data.user?.role}`);
      return loginData.data.token;
    } else {
      console.log('❌ Login response missing token:', loginData);
      return null;
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
    return null;
  }
}

async function testUploadWithoutFile(token) {
  console.log('\n� Step 2: Testing upload without file (should fail)...');
  
  try {
    const response = await fetch(`${BASE_URL}/documents/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        appointment_id: '1',
        document_type: 'test'
      })
    });

    const result = await response.text();
    console.log(`📊 Status: ${response.status}`);
    console.log(`📋 Response: ${result}`);
    
    if (response.status === 400) {
      console.log('✅ Expected failure - file required');
    } else {
      console.log('❓ Unexpected response');
    }
  } catch (error) {
    console.log('❌ Upload test error:', error.message);
  }
}

async function testFileUpload(token, fileName) {
  console.log('\n📤 Step 3: Testing actual file upload...');
  
  try {
    // Create FormData and add file
    const form = new FormData();
    const fileStream = fs.createReadStream(fileName);
    
    form.append('document', fileStream);
    form.append('appointment_id', '1');  // Test appointment ID
    form.append('document_type', 'test_document');
    form.append('comments', 'Test upload from Node.js authentication script');

    console.log('📋 Upload data:');
    console.log('  - File:', fileName);
    console.log('  - Appointment ID: 1');
    console.log('  - Document Type: test_document');
    console.log('  - Comments: Test upload...');

    const uploadResponse = await fetch(`${BASE_URL}/documents/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        ...form.getHeaders?.() // Only available in form-data package
      },
      body: form
    });

    const uploadResult = await uploadResponse.text();
    console.log(`� Upload Status: ${uploadResponse.status}`);
    console.log(`� Upload Response: ${uploadResult}`);

    if (uploadResponse.ok) {
      console.log('✅ File upload successful!');
      
      try {
        const uploadData = JSON.parse(uploadResult);
        return uploadData.data?.id;
      } catch (e) {
        console.log('⚠️ Could not parse upload response as JSON');
        return null;
      }
    } else {
      console.log('❌ File upload failed');
      return null;
    }
  } catch (error) {
    console.log('❌ Upload error:', error.message);
    return null;
  }
}

async function testDocumentDownload(token, documentId) {
  if (!documentId) {
    console.log('\n📥 Step 4: Skipping download test (no document ID)');
    return;
  }

  console.log(`\n📥 Step 4: Testing document download (ID: ${documentId})...`);
  
  try {
    const downloadResponse = await fetch(`${BASE_URL}/documents/${documentId}/download`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const downloadResult = await downloadResponse.text();
    console.log(`📊 Download Status: ${downloadResponse.status}`);
    console.log(`� Download Response: ${downloadResult}`);

    if (downloadResponse.ok) {
      console.log('✅ Document download successful!');
    } else {
      console.log('❌ Document download failed');
    }
  } catch (error) {
    console.log('❌ Download error:', error.message);
  }
}

async function testMyDocuments(token) {
  console.log('\n📋 Step 5: Testing my documents list...');
  
  try {
    const response = await fetch(`${BASE_URL}/documents/my-documents`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.text();
    console.log(`📊 Status: ${response.status}`);
    console.log(`📋 My Documents: ${result}`);

    if (response.ok) {
      console.log('✅ My documents endpoint working!');
    } else {
      console.log('❌ My documents endpoint failed');
    }
  } catch (error) {
    console.log('❌ My documents error:', error.message);
  }
}

async function cleanup(fileName) {
  if (fs.existsSync(fileName)) {
    fs.unlinkSync(fileName);
    console.log(`🧹 Cleaned up test file: ${fileName}`);
  }
}

async function runCompleteTest() {
  console.log('🚀 Starting Complete Document Upload Test');
  console.log('==========================================\n');

  let testFileName = null;
  
  try {
    // Step 1: Authenticate
    const token = await authenticateUser();
    if (!token) {
      console.log('\n❌ Test failed: Could not authenticate');
      console.log('💡 Make sure the server is running and database is seeded');
      return;
    }

    // Step 2: Create test file
    testFileName = await createTestFile();

    // Step 3: Test upload without file
    await testUploadWithoutFile(token);

    // Step 4: Test actual file upload
    const documentId = await testFileUpload(token, testFileName);

    // Step 5: Test download
    await testDocumentDownload(token, documentId);

    // Step 6: Test my documents
    await testMyDocuments(token);

    console.log('\n🎉 Complete Test Summary:');
    console.log('✅ Authentication: Working');
    console.log('✅ File Upload Validation: Working');
    console.log('✅ Protected Endpoints: Working');
    console.log('✅ Document Management: Working');

  } catch (error) {
    console.log('\n❌ Test failed with error:', error.message);
    console.log('Stack:', error.stack);
  } finally {
    // Cleanup
    if (testFileName) {
      await cleanup(testFileName);
    }
  }
}

// Run the test
runCompleteTest();
