'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

type Profile = {
  last_name: string
  first_name: string
  last_name_kana: string
  first_name_kana: string
  school: string
  user_handle: string | null
  nickname: string | null
}

export default function ProfileForm({ initialProfile }: { initialProfile: Profile | null }) {
  const [userHandle, setUserHandle] = useState(initialProfile?.user_handle ?? '')
  const [nickname, setNickname] = useState(initialProfile?.nickname ?? '')
  const [school, setSchool] = useState(initialProfile?.school ?? '')
  const [saving, setSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSavedMessage(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const meta = user.user_metadata ?? {}
      const { error } = await supabase
        .from('student_profiles')
        .upsert({
          id: user.id,
          last_name: meta.last_name ?? initialProfile?.last_name ?? '',
          first_name: meta.first_name ?? initialProfile?.first_name ?? '',
          last_name_kana: meta.last_name_kana ?? initialProfile?.last_name_kana ?? '',
          first_name_kana: meta.first_name_kana ?? initialProfile?.first_name_kana ?? '',
          user_handle: userHandle || null,
          nickname: nickname || null,
          school,
        })

      if (error) {
        if (error.code === '23505') {
          setError('このユーザーIDはすでに使われています。別のIDを入力してください。')
        } else {
          throw error
        }
        return
      }

      setSavedMessage('プロフィールを更新しました！')
      setTimeout(() => setSavedMessage(null), 3000)
    } catch {
      setError('保存に失敗しました。もう一度お試しください。')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* 氏名（変更不可） */}
      <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-base font-semibold text-gray-700">氏名・ふりがな</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-500 font-medium">変更不可</span>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">氏名</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600">
                {initialProfile?.last_name ?? '—'}
              </div>
              <div className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600">
                {initialProfile?.first_name ?? '—'}
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">ふりがな</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600">
                {initialProfile?.last_name_kana ?? '—'}
              </div>
              <div className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600">
                {initialProfile?.first_name_kana ?? '—'}
              </div>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">※ 氏名・ふりがなは登録後に変更できません</p>
      </div>

      {/* ユーザーID（変更可能） */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">ユーザーID</h2>
        <div className="flex items-center">
          <span className="px-3 py-2.5 bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg text-sm text-gray-500">@</span>
          <input
            type="text"
            value={userHandle}
            onChange={(e) => setUserHandle(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-r-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            placeholder="例: taro_yamada"
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">半角英数字・アンダースコアのみ使用可</p>
      </div>

      {/* ニックネーム（変更可能） */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">ニックネーム</h2>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          placeholder="例: たろう"
        />
      </div>

      {/* 所属学校（変更可能） */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">所属学校</h2>
        <input
          type="text"
          value={school}
          onChange={(e) => setSchool(e.target.value)}
          required
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          placeholder="例: ○○高等学校"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="px-8 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          {saving ? '保存中...' : '変更を保存する'}
        </button>
        {savedMessage && (
          <span className="text-sm text-green-600 font-medium">✓ {savedMessage}</span>
        )}
      </div>
    </form>
  )
}
