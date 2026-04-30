import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Program } from '@/types'
import DashboardActions from './DashboardActions'

function formatDeadline(deadline: string | null) {
  if (!deadline) return '—'
  const d = new Date(deadline)
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
}

const CATEGORY_COLORS: Record<string, string> = {
  スキボラ: 'bg-blue-100 text-blue-800',
  ちょボラ: 'bg-green-100 text-green-800',
  ガチボラ: 'bg-orange-100 text-orange-800',
}

export default async function DashboardPage() {
  let user = null
  let programList: Program[] = []

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
    const { data: programs } = await supabase
      .from('programs')
      .select('*')
      .eq('publisher_id', user.id)
      .order('created_at', { ascending: false })
    programList = (programs as Program[]) ?? []
  } catch {
    // ignore
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
          <p className="text-sm text-gray-500 mt-1">{user.email}</p>
        </div>
        <Link
          href="/dashboard/programs/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors text-sm shadow-sm"
        >
          + 新規作成
        </Link>
      </div>

      {programList.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <p className="text-gray-400 mb-4">ボランティアがまだありません</p>
          <Link
            href="/dashboard/programs/new"
            className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
          >
            最初のボランティアを作成する →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3">
                  タイトル
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 hidden sm:table-cell">
                  カテゴリ
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 hidden sm:table-cell">
                  締切
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
              {programList.map((program, i) => (
                <tr
                  key={program.id}
                  className={`${i < programList.length - 1 ? 'border-b border-gray-100' : ''} hover:bg-gray-50 transition-colors`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {program.banner_image_url && (
                        <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                          <img
                            src={program.banner_image_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900 text-sm">
                          {program.title}
                        </div>
                        {program.tags && program.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {program.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="text-xs bg-indigo-50 text-indigo-500 px-1.5 py-0.5 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden sm:table-cell">
                    {program.category ? (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[program.category] ?? ''}`}
                      >
                        {program.category}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500 hidden sm:table-cell">
                    {formatDeadline(program.deadline)}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full font-medium ${
                        program.published
                          ? 'bg-green-50 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {program.published ? '公開中' : '下書き'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <DashboardActions program={program} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
