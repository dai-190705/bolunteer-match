import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Application } from '@/types'

type StudentProfile = {
  last_name: string | null
  first_name: string | null
  nickname: string | null
  user_handle: string | null
}

export default async function MyPage() {
  let user = null
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    user = authUser
  } catch {
    // ignore
  }

  if (!user) redirect('/caredent/login')

  // プロフィール取得
  let profile: StudentProfile | null = null
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('student_profiles')
      .select('last_name, first_name, nickname, user_handle')
      .eq('id', user.id)
      .maybeSingle()
    profile = data as StudentProfile | null
  } catch {
    // ignore
  }

  // 応募・参加状況を取得
  let applications: Application[] = []
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('applications')
      .select('id, status')
      .eq('student_id', user.id)
    applications = (data as Application[]) ?? []
  } catch {
    // ignore
  }

  const completed = applications.filter((a) => a.status === 'completed')
  const totalCount = applications.length

  // 記事未執筆の参加済みボランティア件数を算出
  let unwrittenCount = 0
  try {
    const supabase = await createClient()
    const completedIds = completed.map((a) => a.id)
    if (completedIds.length > 0) {
      const { data: diaries } = await supabase
        .from('diary_entries')
        .select('application_id')
        .in('application_id', completedIds)
      const writtenIds = new Set((diaries ?? []).map((d) => d.application_id))
      unwrittenCount = completedIds.filter((id) => !writtenIds.has(id)).length
    }
  } catch {
    // ignore
  }

  const meta = user.user_metadata ?? {}
  const displayName =
    profile?.nickname ||
    [profile?.last_name, profile?.first_name].filter(Boolean).join(' ') ||
    (meta.nickname as string) ||
    [meta.last_name, meta.first_name].filter(Boolean).join(' ') ||
    'ゲスト'
  const handle = profile?.user_handle || (meta.user_handle as string) || null

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 pb-20">
      {/* プロフィールヘッダー */}
      <div className="flex flex-col items-center text-center">
        {/* アバター（初期アイコン） */}
        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#4592c0] to-[#6db3d8] flex items-center justify-center shadow-md ring-4 ring-white">
          <svg className="w-14 h-14 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.7 0 4.9-2.2 4.9-4.9S14.7 2.2 12 2.2 7.1 4.4 7.1 7.1 9.3 12 12 12zm0 2.4c-3.3 0-9.8 1.6-9.8 4.9v2.5h19.6v-2.5c0-3.3-6.5-4.9-9.8-4.9z" />
          </svg>
        </div>

        {/* 氏名・ハンドル */}
        <h1 className="mt-4 text-xl font-bold text-gray-900">{displayName}</h1>
        {handle && <p className="text-sm text-gray-400 mt-0.5">@{handle}</p>}

        {/* プロフィール編集ボタン */}
        <Link
          href="/caredent/mypage/profile"
          className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-gray-200 shadow-sm text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:shadow transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          プロフィールを編集
        </Link>
      </div>

      {/* 記事執筆を促すバナー（未執筆がある場合のみ） */}
      {unwrittenCount > 0 && (
        <Link
          href="/caredent/log"
          className="mt-8 block rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 p-5 hover:shadow-md active:scale-[0.99] transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900">
                未執筆の記事が{unwrittenCount}件あります
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                参加したボランティアの記事を書いて、活動を記録しましょう
              </p>
            </div>
            <svg className="w-5 h-5 text-orange-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      )}

      {/* メニュー */}
      <div className="mt-8 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <Link
          href="/caredent/log"
          className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#e8f4fc] flex items-center justify-center">
            <svg className="w-5 h-5 text-[#4592c0]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <span className="flex-1 font-semibold text-gray-900 text-sm">応募・参加したボランティア</span>
          <span className="text-sm text-gray-400">{totalCount}</span>
          <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* ボランティアを探す */}
      <div className="mt-8">
        <Link
          href="/caredent"
          className="block w-full py-4 rounded-full bg-[#4592c0] hover:bg-[#3a7ea8] active:scale-[0.98] text-white text-base font-bold text-center shadow-lg transition-all"
        >
          ボランティアを探す
        </Link>
      </div>
    </div>
  )
}
