'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

export default function ApplyPage() {
  const [name, setName] = useState('')
  const [organization, setOrganization] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== passwordConfirm) {
      setError('パスワードが一致しません')
      return
    }

    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください')
      return
    }

    setLoading(true)

    const supabase = createClient()

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError) {
      setError('アカウント作成に失敗しました: ' + signUpError.message)
      setLoading(false)
      return
    }

    const userId = data.user?.id
    if (!userId) {
      setError('アカウント作成に失敗しました')
      setLoading(false)
      return
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: userId,
      name,
      organization: organization || null,
    })

    if (profileError) {
      setError('プロフィール登録に失敗しました: ' + profileError.message)
      setLoading(false)
      return
    }

    // Sign out immediately since they need approval
    await supabase.auth.signOut()

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-[calc(100vh-65px)] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">申請完了</h1>
            <p className="text-gray-600 text-sm leading-relaxed">
              申請を受け付けました。承認後にログインできるようになります。
            </p>
            <Link
              href="/caredent/login"
              className="mt-6 inline-block text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              ログインページへ戻る
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-65px)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">アカウント申請</h1>
            <p className="mt-2 text-sm text-gray-500">
              パブリッシャーアカウントの開設を申請します
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                名前 <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="山田 太郎"
              />
            </div>

            <div>
              <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-1.5">
                所属団体 <span className="text-gray-400 font-normal">（任意）</span>
              </label>
              <input
                id="organization"
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="○○大学・○○NPO など"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="publisher@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                パスワード <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="6文字以上"
              />
            </div>

            <div>
              <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700 mb-1.5">
                パスワード確認 <span className="text-red-500">*</span>
              </label>
              <input
                id="passwordConfirm"
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                autoComplete="new-password"
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
              {loading ? '申請中...' : '申請する'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            すでにアカウントをお持ちの方は{' '}
            <Link href="/caredent/login" className="text-indigo-600 hover:text-indigo-800 font-medium">
              ログイン
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
