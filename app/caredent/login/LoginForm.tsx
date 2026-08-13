'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        setError('メールアドレスまたはパスワードが正しくありません')
        setLoading(false)
        return
      }

      // Check if user has a profiles row (publisher) or not (student)
      const { data: profile } = await supabase
        .from('profiles')
        .select('approved')
        .single()

      if (profile) {
        // Publisher flow
        if (!profile.approved) {
          await supabase.auth.signOut()
          setError('現在審査中です。承認をお待ちください。')
          setLoading(false)
          return
        }
        router.push('/caredent/dashboard')
      } else {
        // Student flow — no profiles row
        router.push('/caredent/mypage')
      }

      router.refresh()
    } catch {
      setError('エラーが発生しました。もう一度お試しください。')
      setLoading(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            placeholder="example@email.com"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              パスワード
            </label>
            <Link href="/caredent/forgot-password" className="text-xs text-indigo-600 hover:text-indigo-800">
              パスワードを忘れた方
            </Link>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          {loading ? 'ログイン中...' : 'ログイン'}
        </button>
      </form>

      {/* 新規登録（ログインと同格で目立たせる） */}
      <div className="mt-6">
        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-xs text-gray-400">アカウントをお持ちでない方</span>
          </div>
        </div>

        <Link
          href="/caredent/signup"
          className="block w-full py-2.5 border-2 border-indigo-600 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-colors text-sm text-center"
        >
          学生の方は新規登録
        </Link>

        <p className="mt-4 text-center text-sm text-gray-500">
          ボランティアを掲載したい方は{' '}
          <Link href="/caredent/publisher-signup" className="text-indigo-600 hover:text-indigo-800 font-medium">
            パブリッシャー申請
          </Link>
        </p>
      </div>
    </>
  )
}
