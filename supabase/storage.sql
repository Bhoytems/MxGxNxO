-- Storage setup for product images.
-- Run AFTER schema.sql, and AFTER creating a bucket named "products":
--   Supabase Dashboard -> Storage -> New bucket -> name it "products" -> Public bucket: ON
-- Then run this to lock down who can upload/delete inside it.

-- Anyone can view images (public storefront needs this).
create policy "public can view product images"
  on storage.objects for select
  using (bucket_id = 'products');

-- Only the admin can upload.
create policy "admin can upload product images"
  on storage.objects for insert
  with check (bucket_id = 'products' and is_admin());

-- Only the admin can delete.
create policy "admin can delete product images"
  on storage.objects for delete
  using (bucket_id = 'products' and is_admin());
