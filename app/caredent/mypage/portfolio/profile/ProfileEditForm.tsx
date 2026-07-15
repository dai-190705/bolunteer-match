'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export type PortfolioValue = { title: string }

type Initial = {
  catchphrase: string
  catchphraseDescription: string
  selfPr: string
  interestTags: string[]
  values: PortfolioValue[]
}

const MAX_CATCH = 40
const MAX_DESC = 400
const MAX_PR = 600
const MAX_VALUE_TITLE = 30
const MAX_TAGS = 10

export default function ProfileEditForm({
  studentId,
  initial,
}: {
  studentId: string
  initial: Initial
}) {
  const router = useRouter()
  const [catchphrase, setCatchphrase] = useState(initial.catchphrase)
  const [catchDesc, setCatchDesc] = useState(initial.catchphraseDescription)
  const [selfPr, setSelfPr] = useState(initial.selfPr)
  const [values, setValues] = useState<PortfolioValue[]>(initial.values)
  const [tags, setTags] = useState<string[]>(initial.interestTags)
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function updateValue(i: number, patch: Partial<PortfolioValue>) {
    setValues((prev) => prev.map((v, idx) => (idx === i ? { ...v, ...patch } : v)))
  }
  function addValue() {
    setValues((prev) => [...prev, { title: '' }])
  }
  function removeValue(i: number) {
    setValues((prev) => prev.filter((_, idx) => idx !== i))
  }

  function addTag() {
    const t = tagInput.trim()
    if (!t) return
    if (tags.includes(t)) { setTagInput(''); return }
    if (tags.length >= MAX_TAGS) return
    setTags((prev) => [...prev, t])
    setTagInput('')
  }
  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSavedMessage(null)
    try {
      const supabase = createClient()
      // 空の「大切にしていること」は除外
      const cleanValues = values
        .map((v) => ({ title: v.title.trim() }))
        .filter((v) => v.title)

      const { error } = await supabase
        .from('student_profiles')
        .update({
          catchphrase: catchphrase.trim() || null,
          catchphrase_description: catchDesc.trim() || null,
          self_pr: selfPr.trim() || null,
          interest_tags: tags,
          portfolio_values: cleanValues,
        })
        .eq('id', studentId)

      if (error) throw error

      setSavedMessage('保存しました！')
      setTimeout(() => setSavedMessage(null), 3000)
      router.refresh()
    } catch (e) {
      setError('保存に失敗しました。もう一度お試しください。')
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* キャッチコピー */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-base font-bold text-gray-900 mb-1">キャッチコピー</h2>
        <p className="text-xs text-gray-400 mb-4">あなたを一言で表すフレーズと、その説明を書きましょう。</p>
        <input
          type="text"
          value={catchphrase}
          onChange={(e) => setCatchphrase(e.target.value.slice(0, MAX_CATCH))}
          maxLength={MAX_CATCH}
          placeholder="例: 地方に誇りを持てる日本をつくる"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#4592c0] focus:border-transparent transition"
        />
        <p className="text-xs text-gray-400 text-right mt-1">{catchphrase.length} / {MAX_CATCH}</p>
        <textarea
          value={catchDesc}
          onChange={(e) => setCatchDesc(e.target.value.slice(0, MAX_DESC))}
          maxLength={MAX_DESC}
          rows={4}
          placeholder="キャッチコピーの背景にある想いや活動を説明しましょう。"
          className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4592c0] focus:border-transparent transition resize-y"
        />
        <p className={`text-xs text-right mt-1 ${catchDesc.length >= MAX_DESC ? 'text-red-500' : 'text-gray-400'}`}>
          {catchDesc.length} / {MAX_DESC}
        </p>
      </section>

      {/* 自己PR */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-base font-bold text-gray-900 mb-1">自己PR</h2>
        <p className="text-xs text-gray-400 mb-4">これまでの経験や強み、意気込みを自由に書きましょう。</p>
        <textarea
          value={selfPr}
          onChange={(e) => setSelfPr(e.target.value.slice(0, MAX_PR))}
          maxLength={MAX_PR}
          rows={6}
          placeholder="例: 高校時代から地域活動に参加し、企画・運営を担ってきました..."
          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4592c0] focus:border-transparent transition resize-y"
        />
        <p className={`text-xs text-right mt-1 ${selfPr.length >= MAX_PR ? 'text-red-500' : 'text-gray-400'}`}>
          {selfPr.length} / {MAX_PR}
        </p>
      </section>

      {/* 大切にしていること */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-base font-bold text-gray-900 mb-1">大切にしていること</h2>
        <p className="text-xs text-gray-400 mb-4">価値観や信念をタイトルだけで追加できます。</p>
        <div className="space-y-2">
          {values.map((v, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                value={v.title}
                onChange={(e) => updateValue(i, { title: e.target.value.slice(0, MAX_VALUE_TITLE) })}
                placeholder="例: 地域への誇り"
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#4592c0] focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={() => removeValue(i)}
                aria-label="削除"
                className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors text-sm"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addValue}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 hover:border-[#4592c0] hover:text-[#4592c0] transition-colors text-sm font-semibold"
          >
            ＋ 項目を追加する
          </button>
        </div>
      </section>

      {/* 興味タグ */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-base font-bold text-gray-900 mb-1">興味タグ</h2>
        <p className="text-xs text-gray-400 mb-4">関心のある分野をタグで追加できます（最大{MAX_TAGS}個）。</p>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full font-medium bg-[#eaf4fa] text-[#4592c0]">
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  aria-label={`${tag}を削除`}
                  className="text-[#4592c0]/60 hover:text-red-500"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addTag()
              }
            }}
            placeholder="例: 地方創生"
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4592c0] focus:border-transparent transition"
          />
          <button
            type="button"
            onClick={addTag}
            disabled={!tagInput.trim() || tags.length >= MAX_TAGS}
            className="flex-shrink-0 px-5 py-2.5 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            追加
          </button>
        </div>
      </section>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 bg-[#4592c0] text-white font-bold rounded-full hover:bg-[#3a7ea8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm shadow"
        >
          {saving ? '保存中...' : '変更を保存する'}
        </button>
        {savedMessage && (
          <span className="text-sm text-green-600 font-medium">✓ {savedMessage}</span>
        )}
      </div>
    </div>
  )
}
