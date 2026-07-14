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
}

type ProgramLite = {
  title: string | null
  category: string | null
  tags: string[] | null
  description: string | null
  target: string | null
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
    .select('last_name, first_name, nickname, user_handle, school, grade')
    .eq('id', user.id)
    .maybeSingle()
  const profile = (profileData as StudentProfile | null) ?? null

  // 参加済みボランティア
  const { data: appsData } = await supabase
    .from('applications')
    .select('id, applied_at, status, programs(title, category, tags, description, target)')
    .eq('student_id', user.id)
    .eq('status', 'completed')
    .order('applied_at', { ascending: false })

  // 記事
  const { data: diaryData } = await supabase
    .from('diary_entries')
    .select('application_id, title, content, updated_at, is_public, applications(programs(title, tags))')
    .eq('student_id', user.id)
    .order('updated_at', { ascending: false })

  // タイムライン（ボランティア＋記事）を統合
  const timeline: TimelineItem[] = []

  for (const app of appsData ?? []) {
    const program = pickProgram((app as { programs?: unknown }).programs)
    timeline.push({
      kind: 'volunteer',
      date: (app as { applied_at: string }).applied_at,
      title: program?.title ?? 'ボランティア活動',
      description: truncate(program?.description ?? program?.target, 90),
      tags: program?.tags ?? [],
    })
  }

  for (const d of diaryData ?? []) {
    const row = d as {
      application_id: string
      title: string | null
      content: string | null
      updated_at: string | null
      is_public: boolean | null
      applications?: { programs?: unknown } | null
    }
    const program = pickProgram(row.applications?.programs)
    timeline.push({
      kind: 'article',
      date: row.updated_at ?? new Date().toISOString(),
      title: row.title || program?.title || '無題の記事',
      description: truncate(row.content, 90),
      tags: ['記事', ...(pickProgram(row.applications?.programs)?.tags ?? [])].slice(0, 3),
      applicationId: row.application_id,
      isPublic: !!row.is_public,
    })
  }

  timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

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

  const fullName = [profile?.last_name, profile?.first_name].filter(Boolean).join(' ')
  const displayName = fullName || profile?.nickname || 'ゲスト'
  const subtitle = [profile?.school, profile?.grade].filter(Boolean).join(' / ')

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
            <AuthorAvatar size={104} />
          </div>
        </div>
      </div>

      {/* タブ＋パネル（下部の角丸カードは client 側で継続） */}
      <PortfolioTabs
        timeline={timeline}
        articles={articles}
        profile={{
          name: displayName,
          handle: profile?.user_handle ?? null,
          school: profile?.school ?? null,
          grade: profile?.grade ?? null,
          nickname: profile?.nickname ?? null,
        }}
      />
    </div>
  )
}
