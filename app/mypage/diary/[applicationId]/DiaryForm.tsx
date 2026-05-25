'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'

type DiaryEntry = {
  id: string
  application_id: string
  student_id: string
  image_urls: string[]
  learned: string | null
  next_challenge: string | null
}

type Props = {
  applicationId: string
  studentId: string
  initialDiary: DiaryEntry | null
}

export default function DiaryForm({ applicationId, studentId, initialDiary }: Props) {
  const [imageUrls, setImageUrls] = useState<string[]>(initialDiary?.image_urls ?? [])
  const [learned, setLearned] = useState(initialDiary?.learned ?? '')
  const [nextChallenge, setNextChallenge] = useState(initialDiary?.next_challenge ?? '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return

    setUploading(true)
    setError(null)

    try {
      const supabase = createClient()
      const uploaded: string[] = []

      for (const file of files) {
        const ext = file.name.split('.').pop() ?? 'jpg'
        const filename = `diary-${studentId}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('diary-images')
          .upload(filename, file, { upsert: false })

        if (uploadError) {
          setError('アップロードに失敗しました。もう一度お試しください。')
          return
        }

        const { data } = supabase.storage.from('diary-images').getPublicUrl(filename)
        uploaded.push(data.publicUrl)
      }

      setImageUrls((prev) => [...prev, ...uploaded])
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function removeImage(url: string) {
    setImageUrls((prev) => prev.filter((u) => u !== url))
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSavedMessage(null)

    try {
      const supabase = createClient()
      const payload = {
        application_id: applicationId,
        student_id: studentId,
        image_urls: imageUrls,
        learned,
        next_challenge: nextChallenge,
        updated_at: new Date().toISOString(),
      }

      if (initialDiary) {
        const { error } = await supabase
          .from('diary_entries')
          .update(payload)
          .eq('id', initialDiary.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('diary_entries')
          .insert(payload)
        if (error) throw error
      }

      setSavedMessage('保存しました！')
      setTimeout(() => setSavedMessage(null), 3000)
    } catch (e) {
      setError('保存に失敗しました。もう一度お試しください。')
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* 写真・画像 */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-1">📷 写真・記録画像</h2>
        <p className="text-xs text-gray-400 mb-4">ボランティア中の写真や記録になる画像を追加できます（複数可）</p>

        {/* 画像プレビュー */}
        {imageUrls.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            {imageUrls.map((url) => (
              <div key={url} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group">
                <img src={url} alt="日記画像" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-white rounded-full flex items-center justify-center text-gray-500 hover:text-red-500 shadow text-xs border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic"
          multiple
          onChange={handleImageUpload}
          disabled={uploading}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50"
        />
        {uploading && <p className="text-xs text-indigo-500 mt-2">アップロード中...</p>}
      </section>

      {/* 学んだこと */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-1">💡 このボランティアで学んだこと</h2>
        <p className="text-xs text-gray-400 mb-4">活動を通じて気づいたこと、感じたことを自由に書いてみよう</p>
        <textarea
          value={learned}
          onChange={(e) => setLearned(e.target.value)}
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-y"
          placeholder="例: 地域の方と話すことで、普段意識していなかった社会課題に気づきました..."
        />
      </section>

      {/* 次にやってみたいこと */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-1">🚀 次にやってみたいと感じたこと</h2>
        <p className="text-xs text-gray-400 mb-4">この経験から生まれた、次の挑戦やアイデアを書いてみよう</p>
        <textarea
          value={nextChallenge}
          onChange={(e) => setNextChallenge(e.target.value)}
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-y"
          placeholder="例: 環境問題に関わるボランティアにも参加してみたいと思いました..."
        />
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
          disabled={saving || uploading}
          className="px-8 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          {saving ? '保存中...' : '日記を保存する'}
        </button>
        {savedMessage && (
          <span className="text-sm text-green-600 font-medium">✓ {savedMessage}</span>
        )}
      </div>
    </div>
  )
}
