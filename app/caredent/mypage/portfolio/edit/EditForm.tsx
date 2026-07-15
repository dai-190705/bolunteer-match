'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export type AutoActivity = {
  applicationId: string
  title: string
  date: string
  description: string
}

export type CustomActivity = {
  id: string | null // null = 新規追加（未保存）
  title: string
  date: string
  description: string
}

const MAX_DESC = 300

function dateLabel(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getFullYear()}年${d.getMonth() + 1}月`
}

function DescriptionTextarea({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, MAX_DESC))}
        rows={3}
        maxLength={MAX_DESC}
        placeholder="活動の概要を入力（例: 受付対応やコース案内を担当しました）"
        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4592c0] focus:border-transparent transition resize-y"
      />
      <p className={`text-xs mt-1 text-right ${value.length >= MAX_DESC ? 'text-red-500' : 'text-gray-400'}`}>
        {value.length} / {MAX_DESC}
      </p>
    </div>
  )
}

export default function EditForm({
  studentId,
  initialAuto,
  initialCustom,
}: {
  studentId: string
  initialAuto: AutoActivity[]
  initialCustom: CustomActivity[]
}) {
  const router = useRouter()
  const [auto, setAuto] = useState<AutoActivity[]>(initialAuto)
  const [custom, setCustom] = useState<CustomActivity[]>(initialCustom)
  const [deletedIds, setDeletedIds] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function updateAuto(applicationId: string, description: string) {
    setAuto((prev) => prev.map((a) => (a.applicationId === applicationId ? { ...a, description } : a)))
  }

  function updateCustom(index: number, patch: Partial<CustomActivity>) {
    setCustom((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)))
  }

  function addCustom() {
    setCustom((prev) => [...prev, { id: null, title: '', date: '', description: '' }])
  }

  function removeCustom(index: number) {
    const target = custom[index]
    if (target.id) setDeletedIds((prev) => [...prev, target.id as string])
    setCustom((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSave() {
    // 任意イベントのバリデーション
    for (const c of custom) {
      if (!c.title.trim()) {
        setError('追加した活動には活動名を入力してください')
        return
      }
      if (!c.date) {
        setError('追加した活動には日付を入力してください')
        return
      }
    }

    setSaving(true)
    setError(null)
    setSavedMessage(null)

    try {
      const supabase = createClient()

      // Caredentイベントの概要（upsert）
      const autoRows = auto.map((a) => ({
        student_id: studentId,
        application_id: a.applicationId,
        description: a.description.trim() || null,
      }))
      if (autoRows.length > 0) {
        const { error } = await supabase
          .from('portfolio_activities')
          .upsert(autoRows, { onConflict: 'student_id,application_id' })
        if (error) throw error
      }

      // 削除された任意イベント
      if (deletedIds.length > 0) {
        const { error } = await supabase
          .from('portfolio_activities')
          .delete()
          .in('id', deletedIds)
        if (error) throw error
        setDeletedIds([])
      }

      // 任意イベント（更新と新規）
      for (const c of custom) {
        const row = {
          student_id: studentId,
          application_id: null,
          title: c.title.trim(),
          description: c.description.trim() || null,
          activity_date: c.date,
        }
        if (c.id) {
          const { error } = await supabase.from('portfolio_activities').update(row).eq('id', c.id)
          if (error) throw error
        } else {
          const { error } = await supabase.from('portfolio_activities').insert(row)
          if (error) throw error
        }
      }

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
    <div className="space-y-10">
      {/* Caredentで参加した活動 */}
      <section>
        <h2 className="text-base font-bold text-gray-800 mb-1 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
          Caredentで参加した活動
        </h2>
        <p className="text-xs text-gray-400 mb-4">参加記録から自動で追加されています。概要だけ編集できます。</p>

        {auto.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-400 text-sm">
            まだCaredentで参加した活動はありません
          </div>
        ) : (
          <div className="space-y-4">
            {auto.map((a) => (
              <div key={a.applicationId} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <p className="text-xs text-gray-400 mb-0.5">{dateLabel(a.date)}</p>
                <p className="font-bold text-gray-900 text-sm leading-snug mb-3">{a.title}</p>
                <DescriptionTextarea
                  value={a.description}
                  onChange={(v) => updateAuto(a.applicationId, v)}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 自分で追加した活動 */}
      <section>
        <h2 className="text-base font-bold text-gray-800 mb-1 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#4592c0]"></span>
          自分で追加した活動
        </h2>
        <p className="text-xs text-gray-400 mb-4">Caredent以外で参加したイベントや活動を自由に追加できます。</p>

        <div className="space-y-4">
          {custom.map((c, i) => (
            <div key={c.id ?? `new-${i}`} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 relative">
              <button
                type="button"
                onClick={() => removeCustom(i)}
                aria-label="この活動を削除"
                className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors text-sm"
              >
                ✕
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 mb-3 pr-8">
                <input
                  type="text"
                  value={c.title}
                  onChange={(e) => updateCustom(i, { title: e.target.value })}
                  placeholder="活動名（例: ◯◯プロジェクト参加）"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#4592c0] focus:border-transparent transition"
                />
                <input
                  type="date"
                  value={c.date}
                  onChange={(e) => updateCustom(i, { date: e.target.value })}
                  className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4592c0] focus:border-transparent transition"
                />
              </div>
              <DescriptionTextarea
                value={c.description}
                onChange={(v) => updateCustom(i, { description: v })}
              />
            </div>
          ))}

          <button
            type="button"
            onClick={addCustom}
            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-400 hover:border-[#4592c0] hover:text-[#4592c0] transition-colors text-sm font-semibold"
          >
            ＋ 活動を追加する
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
