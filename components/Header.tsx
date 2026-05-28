import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/server'
import SignOutButton from './SignOutButton'

export default async function Header() {
  let user = null
  let isPublisher = false

  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    user = data.user

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('approved')
        .eq('id', user.id)
        .maybeSingle()
      isPublisher = !!profile
    }
  } catch {
    // Supabase接続エラーは無視してヘッダーを表示
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Image src="/logo.png" alt="Caredent" width={32} height={32} className="object-contain" />
          <span className="text-xl font-bold" style={{ color: '#4592c0' }}>Caredent</span>
        </Link>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {isPublisher ? (
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-gray-600 hover:text-[#4592c0] transition-colors"
                >
                  ダッシュボード
                </Link>
              ) : (
                <Link
                  href="/mypage"
                  className="text-sm font-medium text-gray-600 hover:text-[#4592c0] transition-colors"
                >
                  マイページ
                </Link>
              )}
              <SignOutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-gray-600 hover:text-[#4592c0] transition-colors"
              >
                ログイン
              </Link>
              <Link
                href="/signup"
                className="text-sm font-semibold text-white px-4 py-1.5 rounded-full transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#4592c0' }}
              >
                新規登録
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
