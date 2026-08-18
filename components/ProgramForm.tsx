'use client'

import Link from 'next/link'
import { useState, useRef } from 'react'
import { Program, ApplicationQuestion } from '@/types'
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

// 応募フォームの質問プリセット
const QUESTION_PRESETS: { label: string; description: string }[] = [
  { label: '志望動機', description: 'このボランティアに応募した理由や、どんなことをしたいかを書いてみよう' },
  { label: '自己PR', description: '自分の強みや経験、アピールしたいことを自由に書いてみよう' },
  { label: '参加可能な日程', description: '参加できる日程や時間帯を教えてください' },
  { label: 'ボランティア経験', description: 'これまでのボランティア経験があれば教えてください' },
  { label: '意気込み', description: '活動に向けた意気込みを教えてください' },
]

function genQuestionId() {
  return 'q_' + Math.random().toString(36).slice(2, 10)
}

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

  // 応募フォームの質問
  const [questions, setQuestions] = useState<ApplicationQuestion[]>(
    program?.application_questions?.length ? program.application_questions : []
  )

  function addQuestion(preset?: { label: string; description: string }) {
    setQuestions((prev) => [
      ...prev,
      {
        id: genQuestionId(),
        label: preset?.label ?? '',
        description: preset?.description ?? '',
        required: false,
      },
    ])
  }
  function updateQuestion(i: number, patch: Partial<ApplicationQuestion>) {
    setQuestions((prev) => prev.map((q, idx) => (idx === i ? { ...q, ...patch } : q)))
  }
  function removeQuestion(i: number) {
    setQuestions((prev) => prev.filter((_, idx) => idx !== i))
  }
  function moveQuestion(i: number, dir: -1 | 1) {
    setQuestions((prev) => {
      const to = i + dir
      if (to < 0 || to >= prev.length) return prev
      const next = [...prev]
      ;[next[i], next[to]] = [next[to], next[i]]
      return next
    })
  }

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

  // バナー画像：16:9（PC用）と 4:5（スマホ用）の2枚
  const [bannerUrl, setBannerUrl] = useState<string>(program?.banner_image_url ?? '')
  const [bannerTallUrl, setBannerTallUrl] = useState<string>(program?.banner_image_tall_url ?? '')
  const [uploadingSlot, setUploadingSlot] = useState<'wide' | 'tall' | null>(null)
  const [bannerError, setBannerError] = useState<string | null>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)
  const bannerTallInputRef = useRef<HTMLInputElement>(null)

  const bannerUploading = uploadingSlot !== null

  async function uploadBanner(slot: 'wide' | 'tall', file: File) {
    setUploadingSlot(slot)
    setBannerError(null)

    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop() ?? 'png'
      const filename = `banner-${slot}-${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('banners')
        .upload(filename, file, { upsert: true })

      if (uploadError) {
        setBannerError(`アップロードに失敗しました: ${uploadError.message}`)
        return
      }

      const { data } = supabase.storage.from('banners').getPublicUrl(filename)
      if (slot === 'wide') setBannerUrl(data.publicUrl)
      else setBannerTallUrl(data.publicUrl)
    } finally {
      setUploadingSlot(null)
    }
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    formData.set('published', String(published))
    formData.set('banner_image_url', bannerUrl)
    formData.set('banner_image_tall_url', bannerTallUrl)
    // ラベル未入力の質問は除外して保存
    formData.set(
      'application_questions',
      JSON.stringify(
        questions
          .filter((q) => q.label.trim())
          .map((q) => ({ ...q, label: q.label.trim(), description: q.description.trim() }))
      )
    )
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
      {/* バナー画像（PC用16:9 / スマホ用4:5） */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          バナー画像
        </label>
        <p className="text-xs text-gray-400 mb-4">
          PCでは16:9、スマホでは4:5が表示されます。片方だけの登録でも、もう一方の端末にはその画像が表示されます。
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* 16:9（PC用） */}
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">
              16:9（PC用）
            </p>
            <div className="relative w-full aspect-[16/9] bg-gray-100 rounded-lg border border-gray-200 overflow-hidden mb-2">
              {bannerUrl ? (
                <>
                  <img src={bannerUrl} alt="16:9 バナープレビュー" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => { setBannerUrl(''); if (bannerInputRef.current) bannerInputRef.current.value = '' }}
                    className="absolute top-2 right-2 bg-white rounded-full w-6 h-6 flex items-center justify-center text-gray-500 hover:text-red-500 shadow text-xs border border-gray-200"
                  >
                    ✕
                  </button>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                  16:9 画像
                </div>
              )}
            </div>
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadBanner('wide', f) }}
              disabled={bannerUploading}
              className="block w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50"
            />
            {uploadingSlot === 'wide' && (
              <p className="text-xs text-indigo-500 mt-1">アップロード中...</p>
            )}
          </div>

          {/* 4:5（スマホ用） */}
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">
              4:5（スマホ用）
            </p>
            <div className="relative w-full max-w-[200px] aspect-[4/5] bg-gray-100 rounded-lg border border-gray-200 overflow-hidden mb-2">
              {bannerTallUrl ? (
                <>
                  <img src={bannerTallUrl} alt="4:5 バナープレビュー" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => { setBannerTallUrl(''); if (bannerTallInputRef.current) bannerTallInputRef.current.value = '' }}
                    className="absolute top-2 right-2 bg-white rounded-full w-6 h-6 flex items-center justify-center text-gray-500 hover:text-red-500 shadow text-xs border border-gray-200"
                  >
                    ✕
                  </button>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                  4:5 画像
                </div>
              )}
            </div>
            <input
              ref={bannerTallInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadBanner('tall', f) }}
              disabled={bannerUploading}
              className="block w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50"
            />
            {uploadingSlot === 'tall' && (
              <p className="text-xs text-indigo-500 mt-1">アップロード中...</p>
            )}
          </div>
        </div>

        {bannerError && <p className="text-xs text-red-500 mt-2">{bannerError}</p>}
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

      {/* 応募フォームの質問 */}
      <div className="border-t border-gray-200 pt-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          応募フォームの質問
        </label>
        <p className="text-xs text-gray-400 mb-4">
          応募者に入力してもらう項目を設定します。設定しない場合、応募者は質問なしで応募できます。
        </p>

        {questions.length > 0 && (
          <div className="space-y-3 mb-4">
            {questions.map((q, i) => (
              <div key={q.id} className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                <div className="flex items-start gap-2 mb-2">
                  <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold mt-1.5">
                    {i + 1}
                  </span>
                  <input
                    type="text"
                    value={q.label}
                    onChange={(e) => updateQuestion(i, { label: e.target.value })}
                    placeholder="質問（例: 志望動機）"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                  <div className="flex items-center gap-0.5 mt-1">
                    <button
                      type="button"
                      onClick={() => moveQuestion(i, -1)}
                      disabled={i === 0}
                      aria-label="上へ"
                      className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-200 disabled:opacity-30 text-xs"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveQuestion(i, 1)}
                      disabled={i === questions.length - 1}
                      aria-label="下へ"
                      className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-200 disabled:opacity-30 text-xs"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => removeQuestion(i)}
                      aria-label="削除"
                      className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-red-500 hover:bg-red-50 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={q.description}
                  onChange={(e) => updateQuestion(i, { description: e.target.value })}
                  placeholder="補足説明（任意）"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition mb-2"
                />
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={q.required}
                    onChange={(e) => updateQuestion(i, { required: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="text-xs text-gray-600">必須の質問にする</span>
                </label>
              </div>
            ))}
          </div>
        )}

        {/* プリセットから追加 */}
        <div className="flex flex-wrap gap-2 mb-2">
          {QUESTION_PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => addQuestion(p)}
              className="px-3 py-1.5 rounded-full border border-gray-300 text-xs font-medium text-gray-600 bg-white hover:border-indigo-400 hover:text-indigo-600 transition-colors"
            >
              ＋ {p.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => addQuestion()}
          className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-indigo-400 hover:text-indigo-500 transition-colors text-sm font-semibold"
        >
          ＋ 自由に質問を追加
        </button>
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
