'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { ApplicationQuestion } from '@/types'

type Props = {
  programId: string
  programTitle: string
  cancelPolicy: string | null
  notes: string | null
  questions: ApplicationQuestion[]
  isLoggedIn: boolean
}

export default function ApplyForm({ programId, programTitle, cancelPolicy, notes, questions, isLoggedIn }: Props) {
  const router = useRouter()
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ゲスト応募用（未ログイン時のみ使用）
  const [guestName, setGuestName] = useState('')
  const [guestSchool, setGuestSchool] = useState('')
  const [guestAge, setGuestAge] = useState('')
  const [guestEmail, setGuestEmail] = useState('')

  const hasPolicy = cancelPolicy || notes
  const missingRequired = questions.some((q) => q.required && !answers[q.id]?.trim())
  const missingGuestInfo =
    !isLoggedIn && (!guestName.trim() || !guestSchool.trim() || !guestAge.trim() || !guestEmail.trim())

  function setAnswer(id: string, value: string) {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (hasPolicy && !agreed) return
    if (missingGuestInfo) {
      setError('応募者情報をすべて入力してください。')
      return
    }
    if (missingRequired) {
      setError('必須の質問に回答してください。')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      const cleaned: Record<string, string> = {}
      for (const q of questions) {
        const v = answers[q.id]?.trim()
        if (v) cleaned[q.id] = v
      }

      // ログイン済みはアカウントに紐づけ、未ログインはゲスト情報で応募
      const payload = user
        ? {
            program_id: programId,
            student_id: user.id,
            answers: cleaned,
            motivation: null,
            self_pr: null,
          }
        : {
            program_id: programId,
            student_id: null,
            answers: cleaned,
            motivation: null,
            self_pr: null,
            guest_name: guestName.trim(),
            guest_school: guestSchool.trim(),
            guest_age: guestAge ? parseInt(guestAge, 10) : null,
            guest_email: guestEmail.trim(),
          }

      const { error } = await supabase.from('applications').insert(payload)

      if (error) {
        if (error.code === '23505') {
          setError('すでにこのボランティアに応募済みです。')
        } else {
          console.error('application insert failed:', error)
          throw error
        }
        return
      }

      router.push(`/caredent/programs/${programId}?applied=1`)
    } catch (e) {
      console.error('application error:', e)
      setError('応募に失敗しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* 未ログイン時：ログイン推奨バナー＋応募者情報 */}
      {!isLoggedIn && (
        <>
          <div className="bg-indigo-50 rounded-2xl border border-indigo-200 p-5">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-indigo-900">アカウントをお持ちの方はログインがおすすめ</p>
                <p className="text-xs text-indigo-700 mt-1 leading-relaxed">
                  ログインすると入力を省略でき、応募状況の確認や活動記事の作成ができます。
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Link
                    href={`/caredent/login?next=/caredent/programs/${programId}/apply`}
                    className="px-5 py-2 rounded-full bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors"
                  >
                    ログイン
                  </Link>
                  <Link
                    href="/caredent/signup"
                    className="px-5 py-2 rounded-full bg-white border border-indigo-300 text-indigo-600 text-sm font-bold hover:bg-indigo-50 transition-colors"
                  >
                    新規登録
                  </Link>
                </div>
                <p className="text-xs text-indigo-500 mt-3">
                  アカウントなしでも、下記の情報を入力すれば応募できます。
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-1">
              応募者情報
              <span className="ml-2 text-xs font-normal text-red-500">必須</span>
            </h2>
            <p className="text-xs text-gray-400 mb-4">ご連絡のため、正確な情報をご入力ください</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">氏名</label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="例: 山田 太郎"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">所属学校</label>
                <input
                  type="text"
                  value={guestSchool}
                  onChange={(e) => setGuestSchool(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="例: ○○高等学校"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">年齢</label>
                <input
                  type="number"
                  min={0}
                  max={120}
                  value={guestAge}
                  onChange={(e) => setGuestAge(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="例: 17"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">メールアドレス</label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="例: student@example.com"
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* パブリッシャーが設定した質問 */}
      {questions.map((q) => (
        <div key={q.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-1">
            {q.label}
            <span
              className={`ml-2 text-xs font-normal ${q.required ? 'text-red-500' : 'text-gray-400'}`}
            >
              {q.required ? '必須' : '任意'}
            </span>
          </h2>
          {q.description && <p className="text-xs text-gray-400 mb-4">{q.description}</p>}
          <textarea
            value={answers[q.id] ?? ''}
            onChange={(e) => setAnswer(q.id, e.target.value)}
            rows={5}
            required={q.required}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-y"
            placeholder="回答を入力してください"
          />
        </div>
      ))}

      {/* キャンセルポリシー・注意事項 */}
      {hasPolicy && (
        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 space-y-4">
          <h2 className="text-base font-semibold text-amber-900 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            応募前に必ずご確認ください
          </h2>

          {cancelPolicy && (
            <div>
              <p className="text-sm font-semibold text-amber-800 mb-1">キャンセルポリシー</p>
              <p className="text-sm text-amber-700 whitespace-pre-wrap leading-relaxed">{cancelPolicy}</p>
            </div>
          )}

          {notes && (
            <div>
              <p className="text-sm font-semibold text-amber-800 mb-1">注意事項</p>
              <p className="text-sm text-amber-700 whitespace-pre-wrap leading-relaxed">{notes}</p>
            </div>
          )}

          <label className="flex items-start gap-3 cursor-pointer mt-4 pt-4 border-t border-amber-200">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 flex-shrink-0"
            />
            <span className="text-sm font-medium text-amber-900">
              上記のキャンセルポリシー・注意事項を読み、内容に同意します
            </span>
          </label>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || missingRequired || missingGuestInfo || (hasPolicy ? !agreed : false)}
        className="w-full py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base shadow-sm"
      >
        {loading ? '応募中...' : '応募を確定する →'}
      </button>
    </form>
  )
}
