// Test script to upload a document for user ID 20 and appointment ID 50
// Run with: node test-document-upload.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import FormData from 'form-data';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:3001/api';

// Function to create a simple PDF file for testing
async function createTestPDF() {
  const filePath = path.join(__dirname, 'test-document.pdf');
  
  // Create a very simple PDF-like content
  // Note: This isn't a valid PDF, just a text file with PDF extension for testing
  // In a real application, you would use a library like PDFKit to generate a real PDF
  const content = '%PDF-1.7\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 55 >>\nstream\nBT /F1 12 Tf 72 720 Td (Test Document for OneDesk Application) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000010 00000 n\n0000000059 00000 n\n0000000118 00000 n\n0000000217 00000 n\ntrailer << /Size 5 /Root 1 0 R >>\nstartxref\n321\n%%EOF';
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ Created test PDF at: ${filePath}`);
  return filePath;
}

// Function to upload the document
async function uploadDocument() {
  try {
    console.log('🚀 Document Upload Test');
    console.log('========================');
    
    // Step 1: Login as a citizen (assuming we need a citizen token)
    console.log('🔐 Authenticating as citizen...');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'john.doe@example.com',
        password: 'citizen123'
      })
    });

    if (!loginResponse.ok) {
      const error = await loginResponse.text();
      console.log('❌ Authentication failed:', error);
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.data.token;
    console.log('✅ Authentication successful');

    // Step 2: Create a test PDF file
    console.log('📄 Creating test PDF document...');
    const pdfPath = await createTestPDF();

    // Step 3: Upload document
    console.log('📤 Uploading document...');
    
    // Create form data with file and metadata
    const form = new FormData();
    form.append('document', fs.createReadStream(pdfPath));
    form.append('appointment_id', '15');  // As requested in the prompt
    form.append('document_type', 'application_form');
    form.append('comments', 'Test document upload via API');

    // Send the upload request
    const uploadResponse = await fetch(`${BASE_URL}/documents/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: form
    });

    // Check the response
    if (uploadResponse.ok) {
      const uploadData = await uploadResponse.json();
      console.log('✅ Document upload successful!');
      console.log('📋 Document details:');
      console.log(JSON.stringify(uploadData.data, null, 2));
    } else {
      const errorText = await uploadResponse.text();
      try {
        const errorData = JSON.parse(errorText);
        console.log('❌ Upload failed:', errorData);
      } catch {
        console.log('❌ Upload failed:', errorText);
      }
    }

  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

// Run the test
uploadDocument();
