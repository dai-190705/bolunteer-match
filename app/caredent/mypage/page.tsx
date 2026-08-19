import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Application } from '@/types'
import AuthorAvatar from '../components/AuthorAvatar'

type StudentProfile = {
  last_name: string | null
  first_name: string | null
  nickname: string | null
  user_handle: string | null
  avatar_url: string | null
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
      .select('last_name, first_name, nickname, user_handle, avatar_url')
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

  const totalCount = applications.length

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
        <div className="rounded-full shadow-md ring-4 ring-white">
          <AuthorAvatar size={112} imageUrl={profile?.avatar_url} />
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

        <Link
          href={`/caredent/${profile?.user_handle || user.id}`}
          className="flex items-center gap-4 px-5 py-4 border-t border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#e8f4fc] flex items-center justify-center">
            <svg className="w-5 h-5 text-[#4592c0]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="flex-1 font-semibold text-gray-900 text-sm">マイポートフォリオを表示</span>
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
