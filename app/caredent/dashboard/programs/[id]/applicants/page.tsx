import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { Application, Program } from '@/types'
import { markAsCompleted } from '@/app/dashboard/actions'
import CsvDownloadButton from './CsvDownloadButton'

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
  type ApplicationWithProfile = Application & {
    student_profiles: {
      last_name: string
      first_name: string
      last_name_kana: string
      first_name_kana: string
      school: string
    } | null
    email?: string
  }
  let applications: ApplicationWithProfile[] = []

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

    const { data: appData } = await supabase
      .from('applications')
      .select('*')
      .eq('program_id', id)
      .order('applied_at', { ascending: false })

    if (appData && appData.length > 0) {
      const studentIds = appData.map((a) => a.student_id)

      // プロフィール取得
      const { data: profileData } = await supabase
        .from('student_profiles')
        .select('id, last_name, first_name, last_name_kana, first_name_kana, school')
        .in('id', studentIds)

      const profileMap = Object.fromEntries(
        (profileData ?? []).map((p) => [p.id, p])
      )

      // メールアドレスをサービスロールで取得
      const adminClient = createAdminClient()
      const { data: { users } } = await adminClient.auth.admin.listUsers({ perPage: 1000 })
      const emailMap = Object.fromEntries(users.map((u) => [u.id, u.email ?? '']))

      applications = appData.map((a) => ({
        ...a,
        student_profiles: profileMap[a.student_id] ?? null,
        email: emailMap[a.student_id] ?? '',
      })) as ApplicationWithProfile[]
    }
  } catch {
    // ignore
  }

  // CSV用データ
  const csvData = applications.map((app) => ({
    姓: app.student_profiles?.last_name ?? '',
    名: app.student_profiles?.first_name ?? '',
    姓カナ: app.student_profiles?.last_name_kana ?? '',
    名カナ: app.student_profiles?.first_name_kana ?? '',
    所属学校: app.student_profiles?.school ?? '',
    メールアドレス: app.email ?? '',
    応募日時: formatDate(app.applied_at),
    ステータス: app.status === 'completed' ? '参加済み' : '応募中',
  }))

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 mb-6 transition-colors"
      >
        ← ダッシュボードに戻る
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">応募者一覧</h1>
          <p className="text-sm text-gray-500 mt-1">{program.title}</p>
        </div>
        {applications.length > 0 && (
          <CsvDownloadButton data={csvData} filename={`応募者_${program.title}`} />
        )}
      </div>

      {applications.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">
          まだ応募者はいません
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3 whitespace-nowrap">
                  氏名
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 whitespace-nowrap">
                  所属学校
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 whitespace-nowrap">
                  メールアドレス
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 whitespace-nowrap">
                  応募日時
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 whitespace-nowrap">
                  ステータス
                </th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3 whitespace-nowrap">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app, i) => {
                const markAction = markAsCompleted.bind(null, app.id)
                const profile = app.student_profiles
                return (
                  <tr
                    key={app.id}
                    className={`${i < applications.length - 1 ? 'border-b border-gray-100' : ''} hover:bg-gray-50 transition-colors`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {profile ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {profile.last_name} {profile.first_name}
                          </div>
                          <div className="text-xs text-gray-400">
                            {profile.last_name_kana} {profile.first_name_kana}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 font-mono">
                          {app.student_id.slice(0, 8)}...
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {profile?.school ?? '—'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {app.email || '—'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {formatDate(app.applied_at)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
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
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/programs/${id}/applicants/${app.id}`}
                          className="text-xs px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                          詳細を見る
                        </Link>
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
                      </div>
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
