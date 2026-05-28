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
        href="/caredent/mypage"
        className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 mb-6 transition-colors"
      >
        ← マイページに戻る
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
