-- ゲスト応募（未ログイン）対応

-- 1) student_id を NULL 許容にし、ゲスト情報カラムを追加
ALTER TABLE public.applications
  ALTER COLUMN student_id DROP NOT NULL;

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS guest_name text,
  ADD COLUMN IF NOT EXISTS guest_school text,
  ADD COLUMN IF NOT EXISTS guest_age integer,
  ADD COLUMN IF NOT EXISTS guest_email text;

-- 2) 未ログインでも公開プログラムに応募できる
DROP POLICY IF EXISTS "Anyone can apply as guest to published programs" ON public.applications;
CREATE POLICY "Anyone can apply as guest to published programs"
  ON public.applications FOR INSERT
  WITH CHECK (
    student_id IS NULL
    AND guest_name IS NOT NULL
    AND guest_email IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.programs
      WHERE programs.id = applications.program_id
        AND programs.published = true
    )
  );

-- 3) 同一メールでの重複応募を防ぐ（ゲストのみ）
CREATE UNIQUE INDEX IF NOT EXISTS applications_guest_unique
  ON public.applications (program_id, lower(guest_email))
  WHERE student_id IS NULL AND guest_email IS NOT NULL;
