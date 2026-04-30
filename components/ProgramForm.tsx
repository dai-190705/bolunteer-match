'use client'

import { useState, useRef } from 'react'
import { Program } from '@/types'
import { createClient } from '@/utils/supabase/client'

type Props = {
  program?: Program
  action: (formData: FormData) => Promise<void>
  submitLabel: string
}

const CATEGORIES = ['スキボラ', 'ちょボラ', 'ガチボラ'] as const

export default function ProgramForm({ program, action, submitLabel }: Props) {
  const [published, setPublished] = useState(program?.published ?? false)
  const [loading, setLoading] = useState(false)
  const [category, setCategory] = useState<string>(program?.category ?? '')

  const [wideUrl, setWideUrl] = useState<string>(program?.banner_image_wide_url ?? '')
  const [wideUploading, setWideUploading] = useState(false)
  const [wideError, setWideError] = useState<string | null>(null)
  const wideInputRef = useRef<HTMLInputElement>(null)

  const [tallUrl, setTallUrl] = useState<string>(program?.banner_image_tall_url ?? '')
  const [tallUploading, setTallUploading] = useState(false)
  const [tallError, setTallError] = useState<string | null>(null)
  const tallInputRef = useRef<HTMLInputElement>(null)

  async function handleWideChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setWideUploading(true)
    setWideError(null)

    try {
      const supabase = createClient()
      const filename = `wide-${Date.now()}-${file.name}`

      const { error: uploadError } = await supabase.storage
        .from('banners')
        .upload(filename, file, { upsert: true })

      if (uploadError) {
        setWideError(`アップロードに失敗しました: ${uploadError.message}`)
        return
      }

      const { data } = supabase.storage.from('banners').getPublicUrl(filename)
      setWideUrl(data.publicUrl)
    } finally {
      setWideUploading(false)
    }
  }

  async function handleTallChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setTallUploading(true)
    setTallError(null)

    try {
      const supabase = createClient()
      const filename = `tall-${Date.now()}-${file.name}`

      const { error: uploadError } = await supabase.storage
        .from('banners')
        .upload(filename, file, { upsert: true })

      if (uploadError) {
        setTallError(`アップロードに失敗しました: ${uploadError.message}`)
        return
      }

      const { data } = supabase.storage.from('banners').getPublicUrl(filename)
      setTallUrl(data.publicUrl)
    } finally {
      setTallUploading(false)
    }
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    formData.set('published', String(published))
    formData.set('banner_image_wide_url', wideUrl)
    formData.set('banner_image_tall_url', tallUrl)
    formData.set('category', category)
    await action(formData)
    setLoading(false)
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* 一覧用バナー（横長 8:5） */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          一覧用バナー（横長 8:5）
        </label>
        <div className="relative w-full aspect-[8/5] bg-gray-100 rounded-lg border border-gray-200 overflow-hidden mb-3">
          {wideUrl ? (
            <>
              <img
                src={wideUrl}
                alt="一覧用バナープレビュー"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => { setWideUrl(''); if (wideInputRef.current) wideInputRef.current.value = '' }}
                className="absolute top-2 right-2 bg-white rounded-full w-6 h-6 flex items-center justify-center text-gray-500 hover:text-red-500 shadow text-xs border border-gray-200"
              >
                ✕
              </button>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
              横長画像（8:5）
            </div>
          )}
        </div>
        <input
          ref={wideInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleWideChange}
          disabled={wideUploading}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50"
        />
        {wideUploading && (
          <p className="text-xs text-indigo-500 mt-1">アップロード中...</p>
        )}
        {wideError && (
          <p className="text-xs text-red-500 mt-1">{wideError}</p>
        )}
      </div>

      {/* 詳細用バナー（縦長 2:3） */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          詳細用バナー（縦長 2:3）
        </label>
        <div className="relative w-48 aspect-[2/3] bg-gray-100 rounded-lg border border-gray-200 overflow-hidden mb-3">
          {tallUrl ? (
            <>
              <img
                src={tallUrl}
                alt="詳細用バナープレビュー"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => { setTallUrl(''); if (tallInputRef.current) tallInputRef.current.value = '' }}
                className="absolute top-2 right-2 bg-white rounded-full w-6 h-6 flex items-center justify-center text-gray-500 hover:text-red-500 shadow text-xs border border-gray-200"
              >
                ✕
              </button>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm text-center px-2">
              縦長画像（2:3）
            </div>
          )}
        </div>
        <input
          ref={tallInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleTallChange}
          disabled={tallUploading}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50"
        />
        {tallUploading && (
          <p className="text-xs text-indigo-500 mt-1">アップロード中...</p>
        )}
        {tallError && (
          <p className="text-xs text-red-500 mt-1">{tallError}</p>
        )}
      </div>

      {/* カテゴリ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          カテゴリ <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-3 flex-wrap">
          {CATEGORIES.map((cat) => (
            <label key={cat} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="category_radio"
                value={cat}
                checked={category === cat}
                onChange={() => setCategory(cat)}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">{cat}</span>
            </label>
          ))}
        </div>
        {!category && (
          <p className="text-xs text-gray-400 mt-1">カテゴリを選択してください</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          タイトル <span className="text-red-500">*</span>
        </label>
        <input
          name="title"
          type="text"
          defaultValue={program?.title ?? ''}
          required
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          placeholder="ボランティア名を入力"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          説明 <span className="text-red-500">*</span>
        </label>
        <textarea
          name="description"
          defaultValue={program?.description ?? ''}
          required
          rows={6}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-y"
          placeholder="ボランティアの詳細説明を入力"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            対象者
          </label>
          <input
            name="target"
            type="text"
            defaultValue={program?.target ?? ''}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            placeholder="例: 中学生・高校生"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            応募締切
          </label>
          <input
            name="deadline"
            type="date"
            defaultValue={program?.deadline ?? ''}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          応募先URL
        </label>
        <input
          name="apply_url"
          type="url"
          defaultValue={program?.apply_url ?? ''}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          placeholder="https://example.com/apply"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          タグ
          <span className="ml-1 text-xs font-normal text-gray-400">
            (カンマ区切りで複数入力)
          </span>
        </label>
        <input
          name="tags"
          type="text"
          defaultValue={program?.tags?.join(', ') ?? ''}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          placeholder="例: 科学, 環境, テクノロジー"
        />
      </div>

      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
        <button
          type="button"
          onClick={() => setPublished(!published)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${
            published ? 'bg-indigo-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${
              published ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <span className="text-sm font-medium text-gray-700">
          {published ? '公開する' : '下書きとして保存'}
        </span>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading || wideUploading || tallUploading || !category}
          className="flex-1 sm:flex-none px-8 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          {loading ? '保存中...' : submitLabel}
        </button>
        <a
          href="/dashboard"
          className="flex-1 sm:flex-none px-8 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors text-sm text-center"
        >
          キャンセル
        </a>
      </div>
    </form>
  )
}
