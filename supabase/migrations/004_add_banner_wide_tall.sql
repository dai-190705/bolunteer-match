-- Rename existing banner_image_url to banner_image_wide_url
alter table programs rename column banner_image_url to banner_image_wide_url;
-- Add tall banner column
alter table programs add column if not exists banner_image_tall_url text;
