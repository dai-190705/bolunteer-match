import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import ProfileForm from './ProfileForm'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/caredent/login')

  const { data: profile } = await supabase
    .from('student_profiles')
    .select('last_name, first_name, last_name_kana, first_name_kana, school, user_handle, nickname')
    .eq('id', user.id)
    .maybeSingle()

  // student_profilesが未作成の場合はuser_metadataをフォールバックとして使用し、自動作成する
  const meta = user.user_metadata ?? {}
  let effectiveProfile = profile

  if (!profile && meta.role === 'student') {
    const fallback = {
      last_name: (meta.last_name as string) ?? '',
      first_name: (meta.first_name as string) ?? '',
      last_name_kana: (meta.last_name_kana as string) ?? '',
      first_name_kana: (meta.first_name_kana as string) ?? '',
      school: (meta.school as string) ?? '',
      user_handle: (meta.user_handle as string) ?? null,
      nickname: (meta.nickname as string) ?? null,
    }
    // DBに作成（応募者詳細等でも名前が表示されるように）
    await supabase.from('student_profiles').upsert({
      id: user.id,
      ...fallback,
      grade: (meta.grade as string) ?? null,
    })
    effectiveProfile = fallback
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <a
        href="/caredent/mypage"
        aria-label="マイページに戻る"
        className="inline-flex items-center justify-center w-11 h-11 mb-6 bg-white rounded-full shadow-md hover:shadow-lg active:scale-95 text-gray-700 hover:text-gray-900 transition-all"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </a>

      <div className="mb-8">
        <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide mb-1">アカウント設定</p>
        <h1 className="text-2xl font-bold text-gray-900">プロフィール編集</h1>
        <p className="text-sm text-gray-500 mt-1">{user.email}</p>
      </div>

      <ProfileForm initialProfile={effectiveProfile} />
    </div>
  )
}
