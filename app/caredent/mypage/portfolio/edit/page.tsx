import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import EditForm, { type AutoActivity, type CustomActivity } from './EditForm'

function pickTitle(p: unknown): string {
  if (!p) return ''
  const v = Array.isArray(p) ? p[0] : p
  return (v as { title?: string })?.title ?? ''
}

export default async function PortfolioEditPage() {
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

  // Caredent参加イベント
  const { data: appsData } = await supabase
    .from('applications')
    .select('id, applied_at, programs(title)')
    .eq('student_id', user.id)
    .eq('status', 'completed')
    .order('applied_at', { ascending: false })

  // 既存の活動履歴レコード
  const { data: actsData } = await supabase
    .from('portfolio_activities')
    .select('id, application_id, title, description, activity_date')
    .eq('student_id', user.id)

  const acts = actsData ?? []
  const overrideMap = new Map(
    acts.filter((a) => a.application_id).map((a) => [a.application_id as string, a.description ?? ''])
  )

  const autoActivities: AutoActivity[] = (appsData ?? []).map((app) => {
    const row = app as { id: string; applied_at: string; programs?: unknown }
    return {
      applicationId: row.id,
      title: pickTitle(row.programs) || 'ボランティア活動',
      date: row.applied_at,
      description: overrideMap.get(row.id) ?? '',
    }
  })

  const customActivities: CustomActivity[] = acts
    .filter((a) => !a.application_id)
    .map((a) => ({
      id: a.id as string,
      title: (a.title as string | null) ?? '',
      date: (a.activity_date as string | null) ?? '',
      description: (a.description as string | null) ?? '',
    }))

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link
        href="/caredent/mypage/portfolio"
        aria-label="ポートフォリオに戻る"
        className="inline-flex items-center justify-center w-11 h-11 mb-6 bg-white rounded-full shadow-md hover:shadow-lg active:scale-95 text-gray-700 hover:text-gray-900 transition-all"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </Link>

      <div className="mb-8">
        <p className="text-xs font-medium text-[#4592c0] tracking-wide mb-1">マイポートフォリオ</p>
        <h1 className="text-2xl font-bold text-gray-900">活動履歴を編集</h1>
        <p className="text-sm text-gray-500 mt-1">
          各活動の概要（300文字まで）を書いたり、Caredent以外の活動を追加できます
        </p>
      </div>

      <EditForm
        studentId={user.id}
        initialAuto={autoActivities}
        initialCustom={customActivities}
      />
    </div>
  )
}
