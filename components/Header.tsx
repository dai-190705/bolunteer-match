import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import SignOutButton from './SignOutButton'

export default async function Header() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="text-xl font-bold text-indigo-700 hover:text-indigo-900 transition-colors"
        >
          ボランティア
        </Link>
        {user ? (
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm text-gray-600 hover:text-indigo-700 transition-colors font-medium"
            >
              ダッシュボード
            </Link>
            <SignOutButton />
          </div>
        ) : null}
      </div>
    </header>
  )
}
