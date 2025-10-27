// Storage Setup Script for Supabase
// Run this script to manually create the required storage buckets

const { createClient } = require('@supabase/supabase-js');

// Replace these with your actual Supabase URL and service role key
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_SERVICE_ROLE_KEY = 'YOUR_SERVICE_ROLE_KEY'; // Use service role key, not anon key

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function setupStorageBuckets() {
  console.log('Setting up storage buckets...');

  try {
    // List existing buckets
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }

    console.log('Existing buckets:', existingBuckets?.map(b => b.name));

    // Create resumes bucket
    const resumesBucketExists = existingBuckets?.some(bucket => bucket.name === 'resumes');
    if (!resumesBucketExists) {
      console.log('Creating resumes bucket...');
      const { data: resumesBucket, error: resumesError } = await supabase.storage.createBucket('resumes', {
        public: true,
        allowedMimeTypes: ['application/pdf'],
        fileSizeLimit: 5242880 // 5MB
      });

      if (resumesError) {
        console.error('Error creating resumes bucket:', resumesError);
      } else {
        console.log('✅ Resumes bucket created successfully:', resumesBucket);
      }
    } else {
      console.log('✅ Resumes bucket already exists');
    }

    // Create certificates bucket
    const certificatesBucketExists = existingBuckets?.some(bucket => bucket.name === 'certificates');
    if (!certificatesBucketExists) {
      console.log('Creating certificates bucket...');
      const { data: certBucket, error: certError } = await supabase.storage.createBucket('certificates', {
        public: true,
        allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
        fileSizeLimit: 5242880 // 5MB
      });

      if (certError) {
        console.error('Error creating certificates bucket:', certError);
      } else {
        console.log('✅ Certificates bucket created successfully:', certBucket);
      }
    } else {
      console.log('✅ Certificates bucket already exists');
    }

    console.log('\n🎉 Storage setup completed!');
    
    // Test upload to verify everything works
    console.log('\nTesting upload functionality...');
    const testFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resumes')
      .upload('test/test.pdf', testFile);

    if (uploadError) {
      console.error('❌ Test upload failed:', uploadError);
    } else {
      console.log('✅ Test upload successful:', uploadData);
      
      // Clean up test file
      await supabase.storage.from('resumes').remove(['test/test.pdf']);
      console.log('🧹 Test file cleaned up');
    }

  } catch (error) {
    console.error('Setup failed:', error);
  }
}

// Instructions for manual setup via Supabase Dashboard
console.log(`
📋 MANUAL SETUP INSTRUCTIONS:

If this script doesn't work, you can manually create the buckets in your Supabase Dashboard:

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Go to Storage > Buckets
4. Create a new bucket named "resumes":
   - Name: resumes
   - Public: Yes
   - File size limit: 5MB
   - Allowed MIME types: application/pdf

5. Create a new bucket named "certificates":
   - Name: certificates  
   - Public: Yes
   - File size limit: 5MB
   - Allowed MIME types: application/pdf, image/jpeg, image/png

6. Make sure RLS policies are set to allow authenticated users to:
   - INSERT into both buckets
   - SELECT from both buckets
   - UPDATE in both buckets
   - DELETE from both buckets

Example RLS policy for authenticated users:
- Target roles: authenticated
- Policy command: ALL
- Policy definition: (auth.uid() = (storage.foldername(name))[1]::uuid)

This allows users to only access files in folders named with their user ID.
`);

// Only run if this file is executed directly
if (require.main === module) {
  setupStorageBuckets();
}

module.exports = { setupStorageBuckets };