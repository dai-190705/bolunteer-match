-- 記事機能（学生の活動記事・いいね・コメント）の削除
-- アプリ側からは既に参照していないため、DBオブジェクトも撤去する。

-- いいね関連（ビュー・関数 → テーブルの順に削除）
DROP VIEW IF EXISTS public.article_like_counts;
DROP FUNCTION IF EXISTS public.toggle_article_like(uuid, text);
DROP FUNCTION IF EXISTS public.get_article_like_state(uuid, text);
DROP TABLE IF EXISTS public.article_likes;

-- コメント
DROP TABLE IF EXISTS public.article_comments;

-- 記事本体
DROP TABLE IF EXISTS public.diary_entries;
