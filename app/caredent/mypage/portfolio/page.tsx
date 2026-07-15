import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import AuthorAvatar from '../../components/AuthorAvatar'
import PortfolioTabs, { type TimelineItem, type ArticleItem } from './PortfolioTabs'

type StudentProfile = {
  last_name: string | null
  first_name: string | null
  nickname: string | null
  user_handle: string | null
  school: string | null
  grade: string | null
  avatar_url: string | null
  school_public: boolean
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

export default async function PortfolioPage() {
  let user = null
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    user = authUser
  } catch {
    // ignore
  }

  if (!user) redirect('/caredent/login')

  const supabase = await createClient()

  // プロフィール
  const { data: profileData } = await supabase
    .from('student_profiles')
    .select('last_name, first_name, nickname, user_handle, school, grade, avatar_url, school_public')
    .eq('id', user.id)
    .maybeSingle()
  const profile = (profileData as StudentProfile | null) ?? null

  // 参加済みボランティア（Caredent経由の自動挿入分）
  const { data: appsData } = await supabase
    .from('applications')
    .select('id, applied_at, status, programs(title, category, tags, description, target)')
    .eq('student_id', user.id)
    .eq('status', 'completed')
    .order('applied_at', { ascending: false })

  // 活動履歴（概要の上書き＋任意イベント）
  const { data: actsData } = await supabase
    .from('portfolio_activities')
    .select('id, application_id, title, description, activity_date')
    .eq('student_id', user.id)
  const acts = (actsData ?? []) as ActivityRow[]
  const overrideMap = new Map(
    acts.filter((a) => a.application_id).map((a) => [a.application_id as string, a.description ?? ''])
  )
  const customActs = acts.filter((a) => !a.application_id)

  // 記事（記事一覧タブ＋活動→記事リンク判定用）
  const { data: diaryData } = await supabase
    .from('diary_entries')
    .select('application_id, title, updated_at, is_public, applications(programs(title))')
    .eq('student_id', user.id)
    .order('updated_at', { ascending: false })
  const articleIds = new Set((diaryData ?? []).map((d) => (d as { application_id: string }).application_id))

  // タイムライン（Caredentイベント＋任意イベントのみ。記事は載せない）
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

  // 記事一覧タブ用
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

  const meta = user.user_metadata ?? {}
  const displayName = profile?.nickname || (meta.nickname as string) || 'ゲスト'
  const visibleSchool = profile?.school_public ? profile?.school : null
  const subtitle = [visibleSchool, profile?.grade].filter(Boolean).join(' / ')

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <a
        href="/caredent/mypage"
        aria-label="マイページに戻る"
        className="inline-flex items-center justify-center w-11 h-11 mb-5 bg-white rounded-full shadow-md hover:shadow-lg active:scale-95 text-gray-700 hover:text-gray-900 transition-all"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </a>

      {/* ヘッダーカード */}
      <div className="rounded-t-3xl overflow-hidden bg-gradient-to-br from-[#dceff9] via-[#e8f4fc] to-[#f0f7fc] px-6 sm:px-8 pt-8 pb-7">
        <div className="flex items-center gap-5">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[#4592c0] mb-1">マイポートフォリオ</p>
            <h1 className="text-3xl font-bold text-gray-900 leading-tight truncate">{displayName}</h1>
            {subtitle && <p className="text-sm text-gray-600 mt-1.5">{subtitle}</p>}
            {profile?.user_handle && (
              <p className="text-xs text-gray-400 mt-0.5">@{profile.user_handle}</p>
            )}
          </div>
          <div className="flex-shrink-0 ring-4 ring-white/80 rounded-full shadow-lg">
            <AuthorAvatar size={104} imageUrl={profile?.avatar_url} />
          </div>
        </div>
      </div>

      {/* タブ＋パネル */}
      <PortfolioTabs
        timeline={timeline}
        articles={articles}
        profile={{
          name: displayName,
          handle: profile?.user_handle ?? null,
          school: visibleSchool ?? null,
          grade: profile?.grade ?? null,
          nickname: profile?.nickname ?? null,
        }}
      />
    </div>
  )
}
