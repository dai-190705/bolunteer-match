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
    .single()

  if (!profile) redirect('/caredent/mypage')

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <a
        href="/caredent/mypage"
        className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 mb-6 transition-colors"
      >
        ← マイページに戻る
      </a>

      <div className="mb-8">
        <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide mb-1">アカウント設定</p>
        <h1 className="text-2xl font-bold text-gray-900">プロフィール編集</h1>
        <p className="text-sm text-gray-500 mt-1">{user.email}</p>
      </div>

      <ProfileForm initialProfile={profile} />
    </div>
  )
}
