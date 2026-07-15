import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import AuthorAvatar from '../components/AuthorAvatar'
import PortfolioTabs, { type TimelineItem, type ArticleItem } from '../mypage/portfolio/PortfolioTabs'
import ShareButton from './ShareButton'

type PortfolioValue = { title: string }

type PublicProfile = {
  id: string
  nickname: string | null
  user_handle: string | null
  avatar_url: string | null
  school: string | null
  grade: string | null
  catchphrase: string | null
  catchphrase_description: string | null
  self_pr: string | null
  interest_tags: string[] | null
  portfolio_values: PortfolioValue[] | null
}

type ProgramLite = {
  title: string | null
  category: string | null
  tags: string[] | null
  description: string | null
  target: string | null
}

type ActivityRow = {
  id: string
  application_id: string | null
  title: string | null
  description: string | null
  activity_date: string | null
}

function pickProgram(p: unknown): ProgramLite | null {
  if (!p) return null
  const v = Array.isArray(p) ? p[0] : p
  return (v as ProgramLite) ?? null
}

function truncate(text: string | null | undefined, n: number) {
  if (!text) return ''
  const t = text.replace(/\s+/g, ' ').trim()
  return t.length > n ? t.slice(0, n) + '…' : t
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

async function getProfile(handle: string): Promise<PublicProfile | null> {
  const supabase = await createClient()
  const cols =
    'id, nickname, user_handle, avatar_url, school, grade, catchphrase, catchphrase_description, self_pr, interest_tags, portfolio_values'

  // まずユーザーハンドルで検索
  const { data: byHandle } = await supabase
    .from('author_public_profiles')
    .select(cols)
    .eq('user_handle', handle)
    .maybeSingle()
  if (byHandle) return byHandle as PublicProfile

  // 旧URL互換：UUIDならIDで検索
  if (UUID_RE.test(handle)) {
    const { data: byId } = await supabase
      .from('author_public_profiles')
      .select(cols)
      .eq('id', handle)
      .maybeSingle()
    if (byId) return byId as PublicProfile
  }

  return null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>
}): Promise<Metadata> {
  const { handle } = await params
  const profile = await getProfile(handle)
  if (!profile) return { title: 'ポートフォリオが見つかりません | Caredent' }
  const name = profile.nickname || (profile.user_handle ? `@${profile.user_handle}` : '学生')
  return {
    title: `${name}のポートフォリオ | Caredent`,
    description: profile.catchphrase || `${name}さんの活動ポートフォリオ`,
  }
}

export default async function PublicPortfolioPage({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params

  const profile = await getProfile(handle)
  if (!profile) notFound()

  // UUIDでアクセスされたがハンドルがある場合は、ハンドルURLへ正規化
  if (handle !== profile.user_handle && profile.user_handle) {
    redirect(`/caredent/${profile.user_handle}`)
  }

  const studentId = profile.id
  const urlKey = profile.user_handle || profile.id

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = user?.id === studentId

  // 参加済みボランティア
  const { data: appsData } = await supabase
    .from('applications')
    .select('id, applied_at, status, programs(title, category, tags, description, target)')
    .eq('student_id', studentId)
    .eq('status', 'completed')
    .order('applied_at', { ascending: false })

  // 活動履歴（概要上書き＋任意イベント）
  const { data: actsData } = await supabase
    .from('portfolio_activities')
    .select('id, application_id, title, description, activity_date')
    .eq('student_id', studentId)
  const acts = (actsData ?? []) as ActivityRow[]
  const overrideMap = new Map(
    acts.filter((a) => a.application_id).map((a) => [a.application_id as string, a.description ?? ''])
  )
  const customActs = acts.filter((a) => !a.application_id)

  // 記事（本人なら全件・他者は公開のみ = RLSで自動制御）
  const { data: diaryData } = await supabase
    .from('diary_entries')
    .select('application_id, title, updated_at, is_public, applications(programs(title))')
    .eq('student_id', studentId)
    .order('updated_at', { ascending: false })
  const articleIds = new Set((diaryData ?? []).map((d) => (d as { application_id: string }).application_id))

  // タイムライン
  const timeline: TimelineItem[] = []
  for (const app of appsData ?? []) {
    const row = app as { id: string; applied_at: string; programs?: unknown }
    const program = pickProgram(row.programs)
    const override = overrideMap.get(row.id)
    timeline.push({
      kind: 'volunteer',
      date: row.applied_at,
      title: program?.title ?? 'ボランティア活動',
      description: override || truncate(program?.description ?? program?.target, 100),
      tags: (program?.tags ?? []).slice(0, 3),
      applicationId: row.id,
      hasArticle: articleIds.has(row.id),
    })
  }
  for (const act of customActs) {
    timeline.push({
      kind: 'custom',
      date: act.activity_date ?? '',
      title: act.title ?? '活動',
      description: act.description ?? '',
      tags: [],
      hasArticle: false,
    })
  }
  timeline.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())

  // 記事一覧
  const articles: ArticleItem[] = (diaryData ?? []).map((d) => {
    const row = d as {
      application_id: string
      title: string | null
      updated_at: string | null
      is_public: boolean | null
      applications?: { programs?: unknown } | null
    }
    return {
      applicationId: row.application_id,
      title: row.title || pickProgram(row.applications?.programs)?.title || '無題の記事',
      program: pickProgram(row.applications?.programs)?.title ?? '',
      date: row.updated_at ?? '',
      isPublic: !!row.is_public,
    }
  })

  const displayName = profile.nickname || (profile.user_handle ? `@${profile.user_handle}` : '学生')
  const subtitle = [profile.school, profile.grade].filter(Boolean).join(' / ')

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* 上部バー（所有者はマイページ導線／全員シェア可） */}
      <div className="flex items-center justify-between mb-5">
        {isOwner ? (
          <Link
            href="/caredent/mypage"
            aria-label="マイページに戻る"
            className="inline-flex items-center justify-center w-11 h-11 bg-white rounded-full shadow-md hover:shadow-lg active:scale-95 text-gray-700 hover:text-gray-900 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
        ) : (
          <Link
            href="/caredent"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Caredent
          </Link>
        )}
        <ShareButton path={`/caredent/${urlKey}`} />
      </div>

      {/* ヘッダーカード */}
      <div className="rounded-t-3xl overflow-hidden bg-gradient-to-br from-[#dceff9] via-[#e8f4fc] to-[#f0f7fc] px-6 sm:px-8 pt-8 pb-7">
        <div className="flex items-center gap-5">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[#4592c0] mb-1">
              {isOwner ? 'マイポートフォリオ' : 'ポートフォリオ'}
            </p>
            <h1 className="text-3xl font-bold text-gray-900 leading-tight truncate">{displayName}</h1>
            {subtitle && <p className="text-sm text-gray-600 mt-1.5">{subtitle}</p>}
            {profile.user_handle && (
              <p className="text-xs text-gray-400 mt-0.5">@{profile.user_handle}</p>
            )}
          </div>
          <div className="flex-shrink-0 ring-4 ring-white/80 rounded-full shadow-lg">
            <AuthorAvatar size={104} imageUrl={profile.avatar_url} />
          </div>
        </div>
      </div>

      <PortfolioTabs
        timeline={timeline}
        articles={articles}
        editable={isOwner}
        profile={{
          name: displayName,
          handle: profile.user_handle ?? null,
          school: profile.school ?? null,
          grade: profile.grade ?? null,
          nickname: profile.nickname ?? null,
          catchphrase: profile.catchphrase ?? null,
          catchphraseDescription: profile.catchphrase_description ?? null,
          selfPr: profile.self_pr ?? null,
          interestTags: profile.interest_tags ?? [],
          values: profile.portfolio_values ?? [],
        }}
      />
    </div>
  )
}
