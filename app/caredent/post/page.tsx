import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'
import AuthorAvatar from '../components/AuthorAvatar'

export const metadata: Metadata = {
  title: 'みんなの記事 | Caredent',
  description: 'ボランティアに参加した学生たちの活動記事一覧',
}

type DiaryRow = {
  application_id: string
  student_id: string | null
  title: string | null
  updated_at: string | null
  applications?: { programs?: { title: string } | { title: string }[] | null } | null
}

function programTitleOf(row: DiaryRow): string {
  const programs = row.applications?.programs
  if (!programs) return ''
  if (Array.isArray(programs)) return programs[0]?.title ?? ''
  return programs.title ?? ''
}

function formatDate(iso: string | null) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

export default async function PostListPage() {
  const supabase = await createClient()

  const { data: rows } = await supabase
    .from('diary_entries')
    .select('application_id, student_id, title, updated_at, applications(programs(title))')
    .eq('is_public', true)
    .order('updated_at', { ascending: false })

  const articles = (rows ?? []) as unknown as DiaryRow[]

  // 執筆者名
  const authorIds = [...new Set(articles.map((a) => a.student_id).filter(Boolean) as string[])]
  const authorMap: Record<string, { nickname: string | null; user_handle: string | null }> = {}
  if (authorIds.length > 0) {
    const { data: authors } = await supabase
      .from('author_public_profiles')
      .select('id, nickname, user_handle')
      .in('id', authorIds)
    for (const a of authors ?? []) authorMap[a.id] = { nickname: a.nickname, user_handle: a.user_handle }
  }

  // いいね件数
  const likeMap: Record<string, number> = {}
  const appIds = articles.map((a) => a.application_id)
  if (appIds.length > 0) {
    const { data: likes } = await supabase
      .from('article_like_counts')
      .select('application_id, like_count')
      .in('application_id', appIds)
    for (const l of likes ?? []) likeMap[l.application_id] = Number(l.like_count)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダーバー */}
      <div className="bg-white border-b border-gray-100 px-4 py-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">みんなの記事</h1>
          <p className="text-sm text-gray-500 mt-1">ボランティアに参加した学生たちの活動レポート</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {articles.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <div className="text-5xl mb-4">📝</div>
            <p className="text-base font-medium">まだ公開された記事はありません</p>
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => {
              const program = programTitleOf(article)
              const author = article.student_id ? authorMap[article.student_id] : null
              const authorName = author?.nickname || (author?.user_handle ? `@${author.user_handle}` : '執筆者')
              const likes = likeMap[article.application_id] ?? 0
              return (
                <Link
                  key={article.application_id}
                  href={`/caredent/article/${article.application_id}/view`}
                  className="block bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-md active:scale-[0.99] transition-all"
                >
                  {program && <p className="text-xs text-[#4592c0] font-medium mb-1.5">🏢 {program}</p>}
                  <p className="text-lg font-bold text-gray-900 leading-snug mb-3">
                    {article.title || '無題の記事'}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <AuthorAvatar size={28} />
                      <span className="text-sm text-gray-600 truncate">{authorName}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 text-gray-400">
                      <span className="inline-flex items-center gap-1 text-xs">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        {likes}
                      </span>
                      <span className="text-xs">{formatDate(article.updated_at)}</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
