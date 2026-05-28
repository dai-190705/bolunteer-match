import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { markAsCompleted } from '@/app/dashboard/actions'

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default async function ApplicantDetailPage({
  params,
}: {
  params: Promise<{ id: string; applicationId: string }>
}) {
  const { id, applicationId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 自分のプログラムか確認
  const { data: program } = await supabase
    .from('programs')
    .select('id, title')
    .eq('id', id)
    .eq('publisher_id', user.id)
    .single()

  if (!program) notFound()

  // 応募データ取得
  const { data: app } = await supabase
    .from('applications')
    .select('*')
    .eq('id', applicationId)
    .eq('program_id', id)
    .single()

  if (!app) notFound()

  // 学生プロフィール取得
  const { data: profile } = await supabase
    .from('student_profiles')
    .select('last_name, first_name, last_name_kana, first_name_kana, school, nickname, user_handle')
    .eq('id', app.student_id)
    .single()

  // メールアドレス取得
  let email = ''
  try {
    const adminClient = createAdminClient()
    const { data: { user: authUser } } = await adminClient.auth.admin.getUserById(app.student_id)
    email = authUser?.email ?? ''
  } catch {
    // ignore
  }

  const markAction = markAsCompleted.bind(null, app.id)

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link
        href={`/dashboard/programs/${id}/applicants`}
        className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 mb-6 transition-colors"
      >
        ← 応募者一覧に戻る
      </Link>

      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide mb-1">応募者詳細</p>
          <h1 className="text-2xl font-bold text-gray-900">
            {profile ? `${profile.last_name} ${profile.first_name}` : '（名前未登録）'}
          </h1>
          {profile && (
            <p className="text-sm text-gray-400 mt-0.5">
              {profile.last_name_kana} {profile.first_name_kana}
            </p>
          )}
        </div>
        <span className={`flex-shrink-0 mt-1 inline-flex items-center text-xs px-3 py-1.5 rounded-full font-medium ${
          app.status === 'completed'
            ? 'bg-gray-100 text-gray-600'
            : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {app.status === 'completed' ? '参加済み' : '応募中'}
        </span>
      </div>

      <div className="space-y-5">
        {/* 基本情報 */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">基本情報</h2>
          <dl className="space-y-3">
            <div className="flex gap-4">
              <dt className="text-sm text-gray-500 w-28 flex-shrink-0">所属学校</dt>
              <dd className="text-sm text-gray-900">{profile?.school || '—'}</dd>
            </div>
            <div className="flex gap-4">
              <dt className="text-sm text-gray-500 w-28 flex-shrink-0">メールアドレス</dt>
              <dd className="text-sm text-gray-900">{email || '—'}</dd>
            </div>
            {profile?.nickname && (
              <div className="flex gap-4">
                <dt className="text-sm text-gray-500 w-28 flex-shrink-0">ニックネーム</dt>
                <dd className="text-sm text-gray-900">{profile.nickname}</dd>
              </div>
            )}
            {profile?.user_handle && (
              <div className="flex gap-4">
                <dt className="text-sm text-gray-500 w-28 flex-shrink-0">ユーザーID</dt>
                <dd className="text-sm text-gray-900">@{profile.user_handle}</dd>
              </div>
            )}
            <div className="flex gap-4">
              <dt className="text-sm text-gray-500 w-28 flex-shrink-0">応募日時</dt>
              <dd className="text-sm text-gray-900">{formatDate(app.applied_at)}</dd>
            </div>
            {app.completed_at && (
              <div className="flex gap-4">
                <dt className="text-sm text-gray-500 w-28 flex-shrink-0">参加済み日時</dt>
                <dd className="text-sm text-gray-900">{formatDate(app.completed_at)}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* 志望動機 */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">💬 志望動機</h2>
          {app.motivation ? (
            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{app.motivation}</p>
          ) : (
            <p className="text-sm text-gray-400 italic">未記入</p>
          )}
        </div>

        {/* 自己PR */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">✨ 自己PR</h2>
          {app.self_pr ? (
            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{app.self_pr}</p>
          ) : (
            <p className="text-sm text-gray-400 italic">未記入</p>
          )}
        </div>

        {/* 操作 */}
        {app.status === 'applied' && (
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700">参加を承認する</p>
              <p className="text-xs text-gray-400 mt-0.5">承認するとステータスが「参加済み」に変わります</p>
            </div>
            <form action={markAction}>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
              >
                参加済みにする
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
