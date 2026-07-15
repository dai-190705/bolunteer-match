'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import AuthorAvatar from '../../../components/AuthorAvatar'

type Comment = {
  id: string
  author_id: string
  body: string
  created_at: string
}

type ProfileMap = Record<string, { nickname: string | null; user_handle: string | null }>

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function CommentSection({
  applicationId,
  currentUserId,
}: {
  applicationId: string
  currentUserId: string | null
}) {
  const [comments, setComments] = useState<Comment[]>([])
  const [profiles, setProfiles] = useState<ProfileMap>({})
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('article_comments')
      .select('id, author_id, body, created_at')
      .eq('application_id', applicationId)
      .order('created_at', { ascending: true })
    const list = (data ?? []) as Comment[]
    setComments(list)

    const ids = [...new Set(list.map((c) => c.author_id))]
    if (ids.length > 0) {
      const { data: profs } = await supabase
        .from('author_public_profiles')
        .select('id, nickname, user_handle')
        .in('id', ids)
      const map: ProfileMap = {}
      for (const p of profs ?? []) map[p.id] = { nickname: p.nickname, user_handle: p.user_handle }
      setProfiles(map)
    }
    setLoading(false)
  }, [applicationId])

  useEffect(() => {
    // load() は fetch 完了後に setState するため同期更新ではない（誤検知を抑制）
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  async function postComment() {
    const text = body.trim()
    if (!text || posting || !currentUserId) return
    setPosting(true)
    setError(null)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('article_comments').insert({
        application_id: applicationId,
        author_id: currentUserId,
        body: text,
      })
      if (error) throw error
      setBody('')
      await load()
    } catch {
      setError('コメントの投稿に失敗しました。もう一度お試しください。')
    } finally {
      setPosting(false)
    }
  }

  function nameOf(authorId: string) {
    const p = profiles[authorId]
    return p?.nickname || (p?.user_handle ? `@${p.user_handle}` : 'ユーザー')
  }

  function profileHref(authorId: string) {
    return `/caredent/${profiles[authorId]?.user_handle || authorId}`
  }

  return (
    <section className="mt-10">
      <h2 className="text-base font-bold text-gray-800 mb-4">
        コメント <span className="text-sm font-normal text-gray-400">({comments.length})</span>
      </h2>

      {/* 投稿フォーム */}
      {currentUserId ? (
        <div className="mb-6">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            placeholder="この記事にコメントする..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4592c0] focus:border-transparent transition resize-y"
          />
          {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
          <div className="flex justify-end mt-2">
            <button
              type="button"
              onClick={postComment}
              disabled={posting || !body.trim()}
              className="px-6 py-2 rounded-full bg-[#4592c0] text-white text-sm font-bold hover:bg-[#3a7ea8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {posting ? '送信中...' : 'コメントする'}
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 rounded-xl bg-gray-50 border border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            コメントするには{' '}
            <Link
              href={`/caredent/login?next=/caredent/article/${applicationId}/view`}
              className="text-[#4592c0] font-semibold hover:underline"
            >
              ログイン
            </Link>
            {' '}してください
          </p>
        </div>
      )}

      {/* コメント一覧 */}
      {loading ? (
        <p className="text-sm text-gray-400">読み込み中...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-400">まだコメントはありません。最初のコメントを送ってみましょう。</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((c) => (
            <li key={c.id} className="flex items-start gap-3">
              <Link href={profileHref(c.author_id)} className="flex-shrink-0" aria-label="プロフィールを見る">
                <AuthorAvatar size={36} />
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link
                    href={profileHref(c.author_id)}
                    className="text-sm font-semibold text-gray-900 hover:underline"
                  >
                    {nameOf(c.author_id)}
                  </Link>
                  <span className="text-xs text-gray-400">{formatDateTime(c.created_at)}</span>
                </div>
                <p className="text-sm text-gray-800 mt-0.5 whitespace-pre-wrap break-words">{c.body}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
