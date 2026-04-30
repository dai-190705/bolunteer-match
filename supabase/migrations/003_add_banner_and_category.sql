-- Add banner_image_url and category columns to programs table
-- NOTE: You need to manually create a Storage bucket called "banners" in
-- Supabase Dashboard → Storage → New bucket (name: banners, public: true)
alter table programs add column if not exists banner_image_url text;
alter table programs add column if not exists category text check (category in ('スキボラ', 'ちょボラ', 'ガチボラ'));
