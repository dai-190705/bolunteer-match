import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Application, Program } from '@/types'
import { markAsCompleted } from '@/app/dashboard/actions'

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default async function ApplicantsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  let program: Program | null = null
  let applications: Application[] = []

  let user = null
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    user = authUser
  } catch {
    // ignore
  }

  if (!user) redirect('/login')

  try {
    const supabase = await createClient()
    // Verify this program belongs to the logged-in publisher
    const { data: prog } = await supabase
      .from('programs')
      .select('*')
      .eq('id', id)
      .eq('publisher_id', user.id)
      .single()
    program = prog as Program | null
  } catch {
    // ignore
  }

  if (!program) notFound()

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('applications')
      .select('*')
      .eq('program_id', id)
      .order('applied_at', { ascending: false })
    applications = (data as Application[]) ?? []
  } catch {
    // ignore
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 mb-6 transition-colors"
      >
        ← ダッシュボードに戻る
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">応募者一覧</h1>
        <p className="text-sm text-gray-500 mt-1">{program.title}</p>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">
          まだ応募者はいません
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3">
                  応募者ID
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">
                  応募日時
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">
                  ステータス
                </th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app, i) => {
                const markAction = markAsCompleted.bind(null, app.id)
                return (
                  <tr
                    key={app.id}
                    className={`${i < applications.length - 1 ? 'border-b border-gray-100' : ''} hover:bg-gray-50 transition-colors`}
                  >
                    <td className="px-6 py-4 text-xs text-gray-500 font-mono">
                      {app.student_id.slice(0, 8)}...
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {formatDate(app.applied_at)}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full font-medium ${
                          app.status === 'completed'
                            ? 'bg-gray-100 text-gray-600'
                            : 'bg-green-50 text-green-700'
                        }`}
                      >
                        {app.status === 'completed' ? '参加済み' : '応募中'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {app.status === 'applied' && (
                        <form action={markAction}>
                          <button
                            type="submit"
                            className="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                          >
                            参加済み承認
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
