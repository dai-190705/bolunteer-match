import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { Program, ApplicationQuestion } from '@/types'
import ApplyForm from './ApplyForm'

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // ログインは任意（未ログインでもゲストとして応募可能）
  const { data: { user } } = await supabase.auth.getUser()

  // プログラム取得
  const { data: program } = await supabase
    .from('programs')
    .select('id, title, category, cancel_policy, notes, capacity, application_questions')
    .eq('id', id)
    .eq('published', true)
    .single()

  if (!program) notFound()

  // ログイン済みで、すでに応募済みなら詳細ページへ
  if (user) {
    const { data: existing } = await supabase
      .from('applications')
      .select('id')
      .eq('program_id', id)
      .eq('student_id', user.id)
      .maybeSingle()

    if (existing) redirect(`/caredent/programs/${id}`)
  }

  // 定員チェック
  if (program.capacity != null) {
    const { data: countData } = await supabase.rpc('get_applicant_count', { p_program_id: id })
    if (Number(countData ?? 0) >= program.capacity) redirect(`/caredent/programs/${id}`)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link
        href={`/caredent/programs/${id}`}
        aria-label="ボランティア詳細に戻る"
        className="inline-flex items-center justify-center w-11 h-11 mb-6 bg-white rounded-full shadow-md hover:shadow-lg active:scale-95 text-gray-700 hover:text-gray-900 transition-all"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </Link>

      <div className="mb-8">
        <p className="text-xs font-medium text-green-600 uppercase tracking-wide mb-1">応募確定</p>
        <h1 className="text-2xl font-bold text-gray-900">{program.title}</h1>
        <p className="text-sm text-gray-500 mt-1">応募内容を入力して、応募を確定してください</p>
      </div>

      <ApplyForm
        programId={id}
        programTitle={program.title}
        cancelPolicy={program.cancel_policy ?? null}
        notes={program.notes ?? null}
        questions={(program.application_questions as ApplicationQuestion[] | null) ?? []}
        isLoggedIn={!!user}
      />
    </div>
  )
}
