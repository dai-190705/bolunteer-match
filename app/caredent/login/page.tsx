import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import LoginForm from './LoginForm'

export default async function LoginPage() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) redirect('/caredent/dashboard')
  } catch {
    // エラー時はログインフォームをそのまま表示
  }

  return (
    <div className="min-h-[calc(100vh-65px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">ログイン</h1>
            <p className="mt-2 text-sm text-gray-500">
              アカウントでログイン
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
