import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'
import AuthorAvatar from '../../components/AuthorAvatar'

type Author = { id: string; nickname: string | null; user_handle: string | null }

type ArticleRow = {
  application_id: string
  title: string | null
  updated_at: string | null
  programs?: { title: string } | { title: string }[] | null
}

async function getProfile(id: string) {
  const supabase = await createClient()

  const { data: author } = await supabase
    .from('author_public_profiles')
    .select('id, nickname, user_handle')
    .eq('id', id)
    .maybeSingle()

  if (!author) return null

  // 公開記事のみ（RLS: is_public = true は誰でも閲覧可）
  const { data: articles } = await supabase
    .from('diary_entries')
    .select('application_id, title, updated_at, applications(programs(title))')
    .eq('student_id', id)
    .eq('is_public', true)
    .order('updated_at', { ascending: false })

  return { author: author as Author, articles: (articles ?? []) as unknown as (ArticleRow & { applications?: { programs?: { title: string } | { title: string }[] | null } | null })[] }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const profile = await getProfile(id)
  if (!profile) return { title: 'プロフィールが見つかりません | Caredent' }
  const name = profile.author.nickname || profile.author.user_handle || '執筆者'
  return { title: `${name} | Caredent`, description: `${name}さんの活動記事一覧` }
}

function formatDate(iso: string | null) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

function programTitleOf(row: { applications?: { programs?: { title: string } | { title: string }[] | null } | null }): string {
  const programs = row.applications?.programs
  if (!programs) return ''
  if (Array.isArray(programs)) return programs[0]?.title ?? ''
  return programs.title ?? ''
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const profile = await getProfile(id)

  if (!profile) notFound()

  const { author, articles } = profile
  const displayName = author.nickname || (author.user_handle ? `@${author.user_handle}` : '執筆者')

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* プロフィールヘッダー */}
      <div className="flex flex-col items-center text-center">
        <div className="ring-4 ring-white rounded-full shadow-md">
          <AuthorAvatar size={96} />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">{displayName}</h1>
        {author.user_handle && <p className="text-sm text-gray-400 mt-0.5">@{author.user_handle}</p>}
      </div>

      {/* 記事一覧 */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          執筆した記事
          <span className="text-sm font-normal text-gray-400 ml-2">({articles.length}件)</span>
        </h2>

        {articles.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">
            まだ公開された記事はありません
          </div>
        ) : (
          <div className="space-y-3">
            {articles.map((article) => {
              const program = programTitleOf(article)
              return (
                <Link
                  key={article.application_id}
                  href={`/caredent/article/${article.application_id}/view`}
                  className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md active:scale-[0.99] transition-all"
                >
                  {program && (
                    <p className="text-xs text-[#4592c0] font-medium mb-1">🏢 {program}</p>
                  )}
                  <p className="font-bold text-gray-900 leading-snug">
                    {article.title || '無題の記事'}
                  </p>
                  {article.updated_at && (
                    <p className="text-xs text-gray-400 mt-1">{formatDate(article.updated_at)}</p>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* フッター導線 */}
      <div className="mt-12 pt-8 border-t border-gray-200 text-center">
        <a
          href="/caredent"
          className="inline-block px-6 py-3 rounded-full bg-[#4592c0] hover:bg-[#3a7ea8] text-white text-sm font-bold shadow transition-colors"
        >
          Caredent でボランティアを探す
        </a>
      </div>
    </div>
  )
}
