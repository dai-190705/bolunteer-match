'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import PrivacyConsent from '../components/PrivacyConsent'

export default function SignUpPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [lastName, setLastName] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastNameKana, setLastNameKana] = useState('')
  const [firstNameKana, setFirstNameKana] = useState('')
  const [school, setSchool] = useState('')
  const [userHandle, setUserHandle] = useState('')
  const [nickname, setNickname] = useState('')
  const [grade, setGrade] = useState('')
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

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

    try {
      const supabase = createClient()
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/caredent/auth/callback`,
          data: {
            role: 'student',
            last_name: lastName,
            first_name: firstName,
            last_name_kana: lastNameKana,
            first_name_kana: firstNameKana,
            school,
            user_handle: userHandle,
            nickname,
            grade,
          },
        },
      })

      if (signUpError) {
        setError('登録に失敗しました。入力内容を確認してもう一度お試しください。')
        setLoading(false)
        return
      }

      setDone(true)
    } catch {
      setError('エラーが発生しました。もう一度お試しください。')
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-[calc(100vh-65px)] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10">
            <div className="text-4xl mb-4">📬</div>
            <h1 className="text-xl font-bold text-gray-900 mb-3">確認メールを送信しました</h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              登録したメールアドレスに確認メールを送りました。<br />
              メール内のリンクをクリックしてアカウントを有効化してください。
            </p>
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
            <h1 className="text-2xl font-bold text-gray-900">学生アカウント登録</h1>
            <p className="mt-2 text-sm text-gray-500">
              ボランティアに応募するにはアカウント登録が必要です
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                氏名 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="性（例: 山田）"
                />
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="名（例: 太郎）"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                ふりがな <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={lastNameKana}
                  onChange={(e) => setLastNameKana(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="せい（例: やまだ）"
                />
                <input
                  type="text"
                  value={firstNameKana}
                  onChange={(e) => setFirstNameKana(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="めい（例: たろう）"
                />
              </div>
            </div>

            <div>
              <label htmlFor="school" className="block text-sm font-medium text-gray-700 mb-1.5">
                所属学校 <span className="text-red-500">*</span>
              </label>
              <input
                id="school"
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="例: ○○高等学校"
              />
            </div>

            <div>
              <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1.5">
                学年 <span className="text-red-500">*</span>
              </label>
              <select
                id="grade"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
              >
                <option value="">選択してください</option>
                <optgroup label="高校生">
                  <option value="高校1年生">高校1年生</option>
                  <option value="高校2年生">高校2年生</option>
                  <option value="高校3年生">高校3年生</option>
                </optgroup>
                <optgroup label="大学生">
                  <option value="大学1年生">大学1年生</option>
                  <option value="大学2年生">大学2年生</option>
                  <option value="大学3年生">大学3年生</option>
                  <option value="大学4年生">大学4年生</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label htmlFor="userHandle" className="block text-sm font-medium text-gray-700 mb-1.5">
                ユーザーID <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2.5 bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg text-sm text-gray-500">@</span>
                <input
                  id="userHandle"
                  type="text"
                  value={userHandle}
                  onChange={(e) => setUserHandle(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                  required
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-r-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="例: taro_yamada"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">半角英数字・アンダースコアのみ使用可</p>
            </div>

            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1.5">
                ニックネーム <span className="text-red-500">*</span>
              </label>
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="例: たろう"
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
                placeholder="student@example.com"
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
                placeholder="••••••••"
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

            <PrivacyConsent agreed={agreedToPrivacy} onAgreedChange={setAgreedToPrivacy} />

            <button
              type="submit"
              disabled={loading || !agreedToPrivacy}
              className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {loading ? '登録中...' : 'アカウント登録'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            すでにアカウントをお持ちの方は{' '}
            <Link href="/caredent/login" className="text-indigo-600 hover:text-indigo-800 font-medium">
              ログインはこちら
            </Link>
          </p>

          <div className="mt-4 pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400 mb-2">ボランティアを掲載したい団体・企業の方</p>
            <Link
              href="/caredent/publisher-signup"
              className="inline-block text-sm text-gray-500 hover:text-indigo-600 font-medium border border-gray-200 hover:border-indigo-300 rounded-lg px-4 py-2 transition-colors"
            >
              掲載者（パブリッシャー）の申請はこちら →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
