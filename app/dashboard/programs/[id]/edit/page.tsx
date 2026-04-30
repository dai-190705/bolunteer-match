import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import ProgramForm from '@/components/ProgramForm'
import { updateProgram } from '@/app/dashboard/actions'
import { Program } from '@/types'

export default async function EditProgramPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  let user = null
  let program: Program | null = null

  try {
    const supabase = await createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()
    user = authUser
  } catch {
    // ignore
  }

  if (!user) redirect('/login')

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('programs')
      .select('*')
      .eq('id', id)
      .eq('publisher_id', user.id)
      .single()
    program = data as Program | null
  } catch {
    // ignore
  }

  if (!program) notFound()

  async function handleUpdate(formData: FormData) {
    'use server'
    await updateProgram(id, formData)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 transition-colors mb-4"
        >
          ← ダッシュボードに戻る
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">ボランティアを編集</h1>
        <p className="text-sm text-gray-500 mt-1">{program.title}</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <ProgramForm
          program={program}
          action={handleUpdate}
          submitLabel="保存する"
        />
      </div>
    </div>
  )
}
