-- banner_image_wide_urlをbanner_image_urlに戻す
alter table programs rename column banner_image_wide_url to banner_image_url;
-- 縦長バナーカラムを削除
alter table programs drop column if exists banner_image_tall_url;
