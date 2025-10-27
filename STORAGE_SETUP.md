# Storage Setup Instructions

## Issue: "new row violates row-level security policy" Error

This error occurs when trying to upload files to Supabase Storage because the required storage buckets don't exist or the storage policies aren't configured properly.

## Solution: Manual Storage Bucket Setup

### Step 1: Access Your Supabase Dashboard

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Sign in to your account
3. Select your project: `yduiaxjgolkiaydilfux` (or find it by the URL: https://yduiaxjgolkiaydilfux.supabase.co)

### Step 2: Create Storage Buckets

1. In your Supabase dashboard, navigate to **Storage** → **Buckets**
2. Click **"New bucket"**

#### Create "resumes" bucket:
- **Name**: `resumes`
- **Public bucket**: ✅ **Yes** (enable this)
- **File size limit**: `5MB`
- **Allowed MIME types**: `application/pdf`
- Click **"Create bucket"**

#### Create "certificates" bucket:
- **Name**: `certificates`
- **Public bucket**: ✅ **Yes** (enable this)
- **File size limit**: `5MB`
- **Allowed MIME types**: `application/pdf, image/jpeg, image/png`
- Click **"Create bucket"**

### Step 3: Configure Storage Policies (RLS)

For each bucket (`resumes` and `certificates`):

1. Click on the bucket name
2. Go to **Policies** tab
3. Click **"New policy"**
4. Select **"For full customization"**

#### Policy for authenticated users:
```sql
-- Policy name: "Authenticated users can manage their own files"
-- Target roles: authenticated
-- Policy command: ALL
-- Policy definition:
(auth.uid() = (storage.foldername(name))[1]::uuid)
```

This policy allows authenticated users to upload, view, update, and delete files in folders named with their user ID.

### Step 4: Alternative Simple Policy (if the above doesn't work)

If the folder-based policy is too complex, you can use a simpler policy:

```sql
-- Policy name: "Allow authenticated users full access"
-- Target roles: authenticated  
-- Policy command: ALL
-- Policy definition:
auth.role() = 'authenticated'
```

⚠️ **Note**: This gives all authenticated users access to all files in the bucket. Use with caution.

### Step 5: Test the Setup

1. Go back to your application
2. Navigate to the Profile Completion page
3. Click the **"Test Storage Connection"** button
4. Try uploading a resume

### Step 6: Remove Debug Tools (Optional)

Once everything is working, you can remove the debug section from the ProfileCompletion component by deleting this code:

```jsx
{/* Debug section - remove this in production */}
<div className="bg-gray-50 p-3 rounded-lg mt-4 max-w-md mx-auto">
  <p className="text-xs text-gray-500 mb-2">Troubleshooting Tools:</p>
  <Button
    type="button"
    variant="outline"
    size="sm"
    onClick={testStorageConnection}
    className="text-xs"
  >
    Test Storage Connection
  </Button>
</div>
```

## Common Issues and Solutions

### Issue: "Bucket not found"
- **Solution**: Make sure you created the buckets with the exact names `resumes` and `certificates`

### Issue: "Permission denied" or "Unauthorized"
- **Solution**: Check that the RLS policies are configured correctly and that the user is authenticated

### Issue: "Invalid MIME type"
- **Solution**: Ensure the bucket allows `application/pdf` MIME type

### Issue: Still getting RLS errors
- **Solution**: Try the simpler policy mentioned in Step 4, or temporarily disable RLS on the buckets for testing

## Verification

After setup, you should see:
- ✅ Two buckets: `resumes` and `certificates`
- ✅ Both buckets are public
- ✅ Both buckets have proper RLS policies
- ✅ File uploads work without errors
- ✅ Users can view their uploaded files

## Need Help?

If you're still experiencing issues:
1. Check the browser console for detailed error messages
2. Verify your Supabase project URL and API keys
3. Ensure you're using the correct bucket names
4. Try the "Test Storage Connection" button in the app