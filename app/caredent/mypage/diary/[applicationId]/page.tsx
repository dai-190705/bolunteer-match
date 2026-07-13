import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import DiaryForm from './DiaryForm'

export default async function DiaryPage({
  params,
}: {
  params: Promise<{ applicationId: string }>
}) {
  const { applicationId } = await params

  let user = null
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    user = authUser
  } catch { /* ignore */ }

  if (!user) redirect('/caredent/login')

  const supabase = await createClient()

  // 応募データ（参加済みかつ本人のもの）を取得
  const { data: application } = await supabase
    .from('applications')
    .select('*, programs(title)')
    .eq('id', applicationId)
    .eq('student_id', user.id)
    .eq('status', 'completed')
    .single()

  if (!application) notFound()

  // 既存の日記があれば取得
  const { data: diary } = await supabase
    .from('diary_entries')
    .select('*')
    .eq('application_id', applicationId)
    .maybeSingle()

  const programTitle = (application.programs as { title: string } | null)?.title ?? ''

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <a
        href="/caredent/log"
        aria-label="一覧に戻る"
        className="inline-flex items-center justify-center w-11 h-11 mb-6 bg-white rounded-full shadow-md hover:shadow-lg active:scale-95 text-gray-700 hover:text-gray-900 transition-all"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </a>

      <div className="mb-8">
        <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide mb-1">体験日記</p>
        <h1 className="text-2xl font-bold text-gray-900">{programTitle}</h1>
      </div>

      <DiaryForm
        applicationId={applicationId}
        studentId={user.id}
        initialDiary={diary ?? null}
      />
    </div>
  )
}
