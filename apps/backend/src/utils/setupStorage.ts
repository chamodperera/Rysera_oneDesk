/**
 * Script to set up Supabase storage bucket and policies for document uploads
 * Run this once to initialize the storage bucket
 */

import { supabaseAdmin } from '../config/supabase.js';

async function setupStorageBucket() {
  try {
    const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'documents';
    
    console.log('🔧 Setting up Supabase storage bucket...');
    
    // Check if bucket already exists
    const { data: existingBuckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      return;
    }
    
    const bucketExists = existingBuckets?.some(bucket => bucket.name === bucketName);
    
    if (bucketExists) {
      console.log(`✅ Bucket '${bucketName}' already exists`);
    } else {
      // Create the bucket
      const { data, error } = await supabaseAdmin.storage.createBucket(bucketName, {
        public: false,
        allowedMimeTypes: ['application/pdf', 'image/png', 'image/jpeg'],
        fileSizeLimit: 5242880 // 5MB
      });
      
      if (error) {
        console.error('❌ Error creating bucket:', error);
        return;
      }
      
      console.log(`✅ Successfully created bucket '${bucketName}'`);
    }
    
    // Test bucket access
    const { data: testList, error: testError } = await supabaseAdmin.storage
      .from(bucketName)
      .list();
    
    if (testError) {
      console.error('❌ Error accessing bucket:', testError);
    } else {
      console.log(`✅ Bucket '${bucketName}' is accessible`);
      console.log(`📁 Current files in bucket: ${testList?.length || 0}`);
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

// Run setup if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupStorageBucket();
}

export { setupStorageBucket };
