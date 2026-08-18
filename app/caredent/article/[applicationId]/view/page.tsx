import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'
import { parseContent, Block } from '../blocks'
import AuthorAvatar from '../../../components/AuthorAvatar'
import LikeButton from './LikeButton'
import CommentSection from './CommentSection'

async function getArticle(applicationId: string) {
  const supabase = await createClient()

  // 公開記事のみ取得（RLS: is_public = true は誰でも閲覧可）
  const { data: diary } = await supabase
    .from('diary_entries')
    .select('title, content, is_public, application_id, student_id, updated_at')
    .eq('application_id', applicationId)
    .eq('is_public', true)
    .maybeSingle()

  if (!diary) return null

  // 参加したボランティア名を取得（公開プログラムのみ閲覧可）
  let programTitle = ''
  const { data: application } = await supabase
    .from('applications')
    .select('programs(title)')
    .eq('id', applicationId)
    .maybeSingle()
  const programs = application?.programs as unknown as { title: string } | { title: string }[] | null
  if (Array.isArray(programs)) programTitle = programs[0]?.title ?? ''
  else programTitle = programs?.title ?? ''

  // 執筆者の公開プロフィール（ニックネーム・ハンドルのみ）
  let author: { id: string; nickname: string | null; user_handle: string | null; avatar_url: string | null } | null = null
  if (diary.student_id) {
    const { data: authorData } = await supabase
      .from('author_public_profiles')
      .select('id, nickname, user_handle, avatar_url')
      .eq('id', diary.student_id)
      .maybeSingle()
    author = authorData ?? null
  }

  return { diary, programTitle, author }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ applicationId: string }>
}): Promise<Metadata> {
  const { applicationId } = await params
  const article = await getArticle(applicationId)
  if (!article) return { title: '記事が見つかりません | Caredent' }
  const title = article.diary.title || article.programTitle || '活動記事'
  return {
    title: `${title} | Caredent`,
    description: `${article.programTitle}に参加した学生の活動記事`,
  }
}

function formatDate(iso: string | null) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

function RenderBlock({ block }: { block: Block }) {
  switch (block.type) {
    case 'heading':
      return <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-3">{block.text}</h2>
    case 'paragraph':
      return <p className="text-base leading-relaxed text-gray-800 mb-4 whitespace-pre-wrap">{block.text}</p>
    case 'image':
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={block.url} alt="記事画像" className="max-w-full rounded-xl my-6" />
    case 'bullet':
      return (
        <ul className="list-disc pl-6 mb-4 space-y-1">
          {block.items.map((it, i) => (
            <li key={i} className="text-base leading-relaxed text-gray-800">{it}</li>
          ))}
        </ul>
      )
    case 'numbered':
      return (
        <ol className="list-decimal pl-6 mb-4 space-y-1">
          {block.items.map((it, i) => (
            <li key={i} className="text-base leading-relaxed text-gray-800">{it}</li>
          ))}
        </ol>
      )
    default:
      return null
  }
}

export default async function PublicArticlePage({
  params,
}: {
  params: Promise<{ applicationId: string }>
}) {
  const { applicationId } = await params
  const article = await getArticle(applicationId)

  if (!article) notFound()

  const { diary, programTitle, author } = article
  const blocks = diary.content ? parseContent(diary.content) : []
  const authorName = author?.nickname || (author?.user_handle ? `@${author.user_handle}` : '執筆者')

  // 現在のユーザーといいね初期件数を取得
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: likeRow } = await supabase
    .from('article_like_counts')
    .select('like_count')
    .eq('application_id', applicationId)
    .maybeSingle()
  const initialLikeCount = Number(likeRow?.like_count ?? 0)

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <article>
        {/* ヘッダー */}
        <header className="mb-8 pb-6 border-b border-gray-200">
          {programTitle && (
            <p className="text-xs font-medium text-[#4592c0] tracking-wide mb-2">
              🏢 {programTitle}
            </p>
          )}
          <h1 className="text-3xl font-bold text-gray-900 leading-snug">
            {diary.title || '無題の記事'}
          </h1>
          {diary.updated_at && (
            <p className="text-sm text-gray-400 mt-3">{formatDate(diary.updated_at)}</p>
          )}

          {/* 執筆者 */}
          {author && (
            <Link
              href={`/caredent/${author.user_handle || author.id}`}
              className="mt-4 inline-flex items-center gap-3 rounded-full pr-4 hover:bg-gray-50 transition-colors -ml-0.5"
            >
              <AuthorAvatar size={40} imageUrl={author.avatar_url} />
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-gray-900 leading-tight">{authorName}</span>
                {author.user_handle && (
                  <span className="block text-xs text-gray-400 leading-tight">@{author.user_handle}</span>
                )}
              </span>
            </Link>
          )}

          {/* いいね */}
          <div className="mt-5">
            <LikeButton applicationId={applicationId} userId={user?.id ?? null} initialCount={initialLikeCount} />
          </div>
        </header>

        {/* 本文 */}
        <div>
          {blocks.length === 0 ? (
            <p className="text-gray-400">まだ内容がありません。</p>
          ) : (
            blocks.map((block) => <RenderBlock key={block.id} block={block} />)
          )}
        </div>
      </article>

      {/* コメント */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <CommentSection applicationId={applicationId} currentUserId={user?.id ?? null} />
      </div>

      {/* フッター導線 */}
      <div className="mt-12 pt-8 border-t border-gray-200 text-center">
        <p className="text-sm text-gray-500 mb-3">この記事は Caredent の活動記録です</p>
        <Link
          href="/caredent"
          className="inline-block px-6 py-3 rounded-full bg-[#4592c0] hover:bg-[#3a7ea8] text-white text-sm font-bold shadow transition-colors"
        >
          Caredent でボランティアを探す
        </Link>
      </div>
    </div>
  )
}
