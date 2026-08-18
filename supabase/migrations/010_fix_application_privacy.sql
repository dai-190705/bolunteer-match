-- 応募データの個人情報流出を防ぐ
-- 旧ポリシー "Anyone can count applications for published programs" は
-- 公開プログラムの応募行を「全カラム」誰にでも読ませてしまうため撤去し、
-- 件数だけを返す SECURITY DEFINER 関数に置き換える。

-- 1) 件数取得用の関数（行の中身は返さない）
CREATE OR REPLACE FUNCTION public.get_applicant_count(p_program_id uuid)
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*)
  FROM applications a
  JOIN programs p ON p.id = a.program_id
  WHERE a.program_id = p_program_id
    AND p.published = true;
$$;

GRANT EXECUTE ON FUNCTION public.get_applicant_count(uuid) TO anon, authenticated;

-- 2) 全行を読めてしまうポリシーを削除
DROP POLICY IF EXISTS "Anyone can count applications for published programs" ON public.applications;
