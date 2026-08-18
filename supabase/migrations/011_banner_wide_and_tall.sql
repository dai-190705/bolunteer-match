-- バナー画像を 16:9（PC用）と 4:5（スマホ用）の両方持てるようにする
-- banner_image_url = 16:9、banner_image_tall_url = 4:5
ALTER TABLE public.programs
  ADD COLUMN IF NOT EXISTS banner_image_tall_url text;

-- 既存で 4:5 として登録されていた画像は縦長カラムへ移す
UPDATE public.programs
SET banner_image_tall_url = banner_image_url,
    banner_image_url = NULL
WHERE banner_aspect_ratio = '4:5'
  AND banner_image_url IS NOT NULL
  AND banner_image_tall_url IS NULL;
