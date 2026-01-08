# Storage Bucket Setup - Quick Guide

## Problem:
Getting "row-level security policy" error even when logged in?

**Reason:** Storage bucket `listing-images` not created yet!

---

## Step-by-Step Fix:

### 1. Go to Supabase Dashboard
```
https://yhbfdplcwizmdvemanci.supabase.co
```

### 2. Storage Section
- Left sidebar → **Storage**
- Click **"New Bucket"** (green button)

### 3. Create Bucket
```
Name: listing-images
Public bucket: ✅ YES (IMPORTANT!)
File size limit: 50MB
```

**Click "Create bucket"**

---

### 4. Set Storage Policies (SQL Editor)

Go to **SQL Editor** and run:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'listing-images' AND
    auth.role() = 'authenticated'
  );

-- Allow anyone to view images
CREATE POLICY "Anyone can view listing images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'listing-images');

-- Allow users to update their own images
CREATE POLICY "Users can update their own images"
  ON storage.objects FOR UPDATE
  USING (auth.uid() = owner AND bucket_id = 'listing-images');

-- Allow users to delete their own images
CREATE POLICY "Users can delete their own images"
  ON storage.objects FOR DELETE
  USING (auth.uid() = owner AND bucket_id = 'listing-images');
```

---

## ✅ Then Test!

After bucket created:
1. Refresh your app
2. Try uploading again
3. Should work! 🎉

---

## Alternative: Quick Test Without Upload

If still issues, temporarily disable image upload in code and test with just text data.
