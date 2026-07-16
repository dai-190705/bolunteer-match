'use client'

import Link from 'next/link'
import { useState, useRef } from 'react'
import { Program } from '@/types'
import { createClient } from '@/utils/supabase/client'

type Props = {
  program?: Program
  action: (formData: FormData) => Promise<void>
  submitLabel: string
}

const CATEGORIES = ['1day', '中期', '長期'] as const
const AUDIENCES = ['小学生', '中学生', '高校生', '大学生', '社会人'] as const

// 定員の選択肢（無制限 + 1〜30 + 40,50,100）
const CAPACITY_OPTIONS = [
  ...Array.from({ length: 30 }, (_, i) => i + 1),
  40, 50, 100,
]

function parseAudiences(target: string | null | undefined): string[] {
  if (!target) return []
  return target
    .split(/[・、,]/)
    .map((s) => s.trim())
    .filter((s) => (AUDIENCES as readonly string[]).includes(s))
}

export default function ProgramForm({ program, action, submitLabel }: Props) {
  const [published, setPublished] = useState(program?.published ?? false)
  const [loading, setLoading] = useState(false)
  const [category, setCategory] = useState<string>(program?.category ?? '')

  const [audiences, setAudiences] = useState<string[]>(parseAudiences(program?.target))
  const [capacity, setCapacity] = useState<string>(
    program?.capacity != null ? String(program.capacity) : ''
  )
  const [locationType, setLocationType] = useState<string>(program?.location_type ?? 'venue')

  // 開催日程（単日 / 期間 / 複数日程 / 随時募集）
  const [scheduleType, setScheduleType] = useState<string>(program?.schedule_type ?? 'single')
  const [singleDate, setSingleDate] = useState<string>(
    !program?.schedule_type || program.schedule_type === 'single'
      ? program?.event_date ?? ''
      : ''
  )
  const [rangeStart, setRangeStart] = useState<string>(
    program?.schedule_type === 'range' ? program?.event_date ?? '' : ''
  )
  const [rangeEnd, setRangeEnd] = useState<string>(program?.event_end_date ?? '')
  const [multiDates, setMultiDates] = useState<string[]>(
    program?.schedule_type === 'multiple' && program?.event_dates?.length
      ? program.event_dates
      : ['']
  )

  function toggleAudience(a: string) {
    setAudiences((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]))
  }

  function updateMultiDate(i: number, v: string) {
    setMultiDates((prev) => prev.map((d, idx) => (idx === i ? v : d)))
  }
  function addMultiDate() {
    setMultiDates((prev) => [...prev, ''])
  }
  function removeMultiDate(i: number) {
    setMultiDates((prev) => {
      const next = prev.filter((_, idx) => idx !== i)
      return next.length ? next : ['']
    })
  }

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
    formData.set('target', audiences.join('・'))
    formData.set('capacity', capacity)
    formData.set('location_type', locationType)
    if (locationType !== 'venue') formData.set('location', '')
    formData.set('schedule_type', scheduleType)
    // 日程タイプに応じて値をセット
    if (scheduleType === 'single') {
      formData.set('event_date', singleDate)
      formData.set('event_end_date', '')
      formData.set('event_dates', '')
    } else if (scheduleType === 'range') {
      formData.set('event_date', rangeStart)
      formData.set('event_end_date', rangeEnd)
      formData.set('event_dates', '')
    } else if (scheduleType === 'multiple') {
      formData.set('event_date', '')
      formData.set('event_end_date', '')
      formData.set('event_dates', multiDates.filter((d) => d).join(','))
    } else {
      // anytime
      formData.set('event_date', '')
      formData.set('event_end_date', '')
      formData.set('event_dates', '')
    }
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

      {/* 対象者（複数選択） */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          対象者
          <span className="ml-1 text-xs font-normal text-gray-400">（複数選択可）</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {AUDIENCES.map((a) => {
            const active = audiences.includes(a)
            return (
              <button
                key={a}
                type="button"
                onClick={() => toggleAudience(a)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  active
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'bg-white border-gray-300 text-gray-600 hover:border-indigo-400'
                }`}
              >
                {a}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* 応募締切 */}
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

        {/* 定員（選択制） */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            定員
          </label>
          <select
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          >
            <option value="">無制限</option>
            {CAPACITY_OPTIONS.map((n) => (
              <option key={n} value={n}>{n} 名</option>
            ))}
          </select>
        </div>
      </div>

      {/* 開催場所 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          開催場所
        </label>
        <div className="flex flex-wrap gap-3 mb-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="location_type_radio"
              value="venue"
              checked={locationType === 'venue'}
              onChange={() => setLocationType('venue')}
              className="text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">住所や場所を入力</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="location_type_radio"
              value="online"
              checked={locationType === 'online'}
              onChange={() => setLocationType('online')}
              className="text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">オンライン</span>
          </label>
        </div>
        {locationType === 'venue' && (
          <input
            name="location"
            type="text"
            defaultValue={program?.location ?? ''}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            placeholder="例: 大阪府堺市北区○○ / ○○会館"
          />
        )}
      </div>

      {/* 開催日程 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          開催日程
        </label>
        <div className="flex flex-wrap gap-x-4 gap-y-2 mb-3">
          {[
            { v: 'single', label: '単日' },
            { v: 'range', label: '期間（何日〜何日）' },
            { v: 'multiple', label: '複数日程' },
            { v: 'anytime', label: '随時募集' },
          ].map((opt) => (
            <label key={opt.v} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="schedule_type_radio"
                value={opt.v}
                checked={scheduleType === opt.v}
                onChange={() => setScheduleType(opt.v)}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">{opt.label}</span>
            </label>
          ))}
        </div>

        {/* 単日 */}
        {scheduleType === 'single' && (
          <input
            type="date"
            value={singleDate}
            onChange={(e) => setSingleDate(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        )}

        {/* 期間 */}
        {scheduleType === 'range' && (
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="date"
              value={rangeStart}
              onChange={(e) => setRangeStart(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
            <span className="text-sm text-gray-500">〜</span>
            <input
              type="date"
              value={rangeEnd}
              min={rangeStart || undefined}
              onChange={(e) => setRangeEnd(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>
        )}

        {/* 複数日程 */}
        {scheduleType === 'multiple' && (
          <div className="space-y-2">
            {multiDates.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="date"
                  value={d}
                  onChange={(e) => updateMultiDate(i, e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => removeMultiDate(i)}
                  aria-label="削除"
                  className="w-9 h-9 flex items-center justify-center rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors text-sm"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addMultiDate}
              className="inline-flex items-center gap-1 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-indigo-400 hover:text-indigo-500 transition-colors text-sm font-semibold"
            >
              ＋ 日程を追加
            </button>
          </div>
        )}
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
        <Link
          href="/caredent/dashboard"
          className="flex-1 sm:flex-none px-8 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors text-sm text-center"
        >
          キャンセル
        </Link>
      </div>
    </form>
  )
}
