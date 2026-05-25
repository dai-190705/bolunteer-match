'use client'

import { useState, useRef } from 'react'
import { Program } from '@/types'
import { createClient } from '@/utils/supabase/client'

type Props = {
  program?: Program
  action: (formData: FormData) => Promise<void>
  submitLabel: string
}

const CATEGORIES = ['1day', '中期', '長期'] as const

export default function ProgramForm({ program, action, submitLabel }: Props) {
  const [published, setPublished] = useState(program?.published ?? false)
  const [loading, setLoading] = useState(false)
  const [category, setCategory] = useState<string>(program?.category ?? '')

  const [bannerUrl, setBannerUrl] = useState<string>(program?.banner_image_url ?? '')
  const [bannerUploading, setBannerUploading] = useState(false)
  const [bannerError, setBannerError] = useState<string | null>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  async function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setBannerUploading(true)
    setBannerError(null)

    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop() ?? 'png'
      const filename = `banner-${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('banners')
        .upload(filename, file, { upsert: true })

      if (uploadError) {
        setBannerError(`アップロードに失敗しました: ${uploadError.message}`)
        return
      }

      const { data } = supabase.storage.from('banners').getPublicUrl(filename)
      setBannerUrl(data.publicUrl)
    } finally {
      setBannerUploading(false)
    }
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    formData.set('published', String(published))
    formData.set('banner_image_url', bannerUrl)
    formData.set('category', category)
    await action(formData)
    setLoading(false)
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* バナー画像（16:9） */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          バナー画像
        </label>
        <div className="relative w-full aspect-[16/9] bg-gray-100 rounded-lg border border-gray-200 overflow-hidden mb-3">
          {bannerUrl ? (
            <>
              <img
                src={bannerUrl}
                alt="バナープレビュー"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => { setBannerUrl(''); if (bannerInputRef.current) bannerInputRef.current.value = '' }}
                className="absolute top-2 right-2 bg-white rounded-full w-6 h-6 flex items-center justify-center text-gray-500 hover:text-red-500 shadow text-xs border border-gray-200"
              >
                ✕
              </button>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
              16:9 画像
            </div>
          )}
        </div>
        <input
          ref={bannerInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleBannerChange}
          disabled={bannerUploading}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50"
        />
        {bannerUploading && (
          <p className="text-xs text-indigo-500 mt-1">アップロード中...</p>
        )}
        {bannerError && (
          <p className="text-xs text-red-500 mt-1">{bannerError}</p>
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            定員
            <span className="ml-1 text-xs font-normal text-gray-400">（未入力で無制限）</span>
          </label>
          <input
            name="capacity"
            type="number"
            min={1}
            defaultValue={program?.capacity ?? ''}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            placeholder="例: 10"
          />
        </div>
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          キャンセルポリシー
          <span className="ml-1 text-xs font-normal text-gray-400">（応募確定画面に表示されます）</span>
        </label>
        <textarea
          name="cancel_policy"
          defaultValue={program?.cancel_policy ?? ''}
          rows={4}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-y"
          placeholder="例: 参加できなくなった場合は、3日前までにご連絡ください。"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          注意事項
          <span className="ml-1 text-xs font-normal text-gray-400">（応募確定画面に表示されます）</span>
        </label>
        <textarea
          name="notes"
          defaultValue={program?.notes ?? ''}
          rows={4}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-y"
          placeholder="例: 当日は動きやすい服装でお越しください。"
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
          disabled={loading || bannerUploading || !category}
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
