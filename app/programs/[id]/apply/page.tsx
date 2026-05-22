import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { Program } from '@/types'
import ApplyForm from './ApplyForm'

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // ログインチェック
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/programs/${id}/apply`)

  // プログラム取得
  const { data: program } = await supabase
    .from('programs')
    .select('id, title, category, cancel_policy, notes')
    .eq('id', id)
    .eq('published', true)
    .single()

  if (!program) notFound()

  // すでに応募済みなら詳細ページへ
  const { data: existing } = await supabase
    .from('applications')
    .select('id')
    .eq('program_id', id)
    .eq('student_id', user.id)
    .maybeSingle()

  if (existing) redirect(`/programs/${id}`)

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link
        href={`/programs/${id}`}
        className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 mb-6 transition-colors"
      >
        ← ボランティア詳細に戻る
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
      />
    </div>
  )
}
