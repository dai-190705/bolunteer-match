import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import ProgramForm from '@/components/ProgramForm'
import { createProgram } from '@/app/dashboard/actions'

export default async function NewProgramPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 transition-colors mb-4"
        >
          ← ダッシュボードに戻る
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">新規ボランティア作成</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <ProgramForm action={createProgram} submitLabel="作成する" />
      </div>
    </div>
  )
}
