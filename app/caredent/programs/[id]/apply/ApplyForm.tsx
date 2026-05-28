'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

type Props = {
  programId: string
  programTitle: string
  cancelPolicy: string | null
  notes: string | null
}

export default function ApplyForm({ programId, programTitle, cancelPolicy, notes }: Props) {
  const router = useRouter()
  const [motivation, setMotivation] = useState('')
  const [selfPr, setSelfPr] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hasPolicy = cancelPolicy || notes

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (hasPolicy && !agreed) return

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push(`/caredent/login?next=/caredent/programs/${programId}/apply`)
        return
      }

      const { error } = await supabase.from('applications').insert({
        program_id: programId,
        student_id: user.id,
        motivation: motivation || null,
        self_pr: selfPr || null,
      })

      if (error) {
        if (error.code === '23505') {
          setError('すでにこのボランティアに応募済みです。')
        } else {
          throw error
        }
        return
      }

      router.push(`/caredent/programs/${programId}?applied=1`)
    } catch {
      setError('応募に失敗しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* 志望動機 */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-1">
          💬 志望動機
          <span className="ml-2 text-xs font-normal text-gray-400">任意</span>
        </h2>
        <p className="text-xs text-gray-400 mb-4">このボランティアに応募した理由や、どんなことをしたいかを書いてみよう</p>
        <textarea
          value={motivation}
          onChange={(e) => setMotivation(e.target.value)}
          rows={5}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-y"
          placeholder="例: 地域の子どもたちと関わる仕事に興味があり、このボランティアを通じて経験を積みたいと思いました。"
        />
      </div>

      {/* 自己PR */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-1">
          ✨ 自己PR
          <span className="ml-2 text-xs font-normal text-gray-400">任意</span>
        </h2>
        <p className="text-xs text-gray-400 mb-4">自分の強みや経験、アピールしたいことを自由に書いてみよう</p>
        <textarea
          value={selfPr}
          onChange={(e) => setSelfPr(e.target.value)}
          rows={5}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-y"
          placeholder="例: 小学校からサッカーを続けており、チームワークを大切にすることが得意です。"
        />
      </div>

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
        disabled={loading || (hasPolicy ? !agreed : false)}
        className="w-full py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base shadow-sm"
      >
        {loading ? '応募中...' : '応募を確定する →'}
      </button>
    </form>
  )
}
