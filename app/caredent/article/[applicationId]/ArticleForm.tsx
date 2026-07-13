'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Block, genId, serializeBlocks, parseContent, blocksFromLegacy } from './blocks'

type DiaryEntry = {
  id: string
  application_id: string
  student_id: string
  image_urls: string[]
  learned: string | null
  next_challenge: string | null
  content: string | null
  title: string | null
  is_public: boolean | null
}

type Props = {
  applicationId: string
  studentId: string
  initialDiary: DiaryEntry | null
}

function initialBlocks(diary: DiaryEntry | null): Block[] {
  if (diary?.content?.trim()) return parseContent(diary.content)
  if (diary) {
    const legacy = blocksFromLegacy(diary)
    if (legacy.length) return legacy
  }
  return [{ id: genId(), type: 'paragraph', text: '' }]
}

// 自動リサイズ textarea
function AutoTextarea({
  value,
  onChange,
  placeholder,
  className,
  autoFocus,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  className: string
  autoFocus?: boolean
}) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    const el = ref.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
    }
  }, [value])
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoFocus={autoFocus}
      rows={1}
      className={`w-full resize-none overflow-hidden bg-transparent focus:outline-none ${className}`}
    />
  )
}

const BLOCK_MENU: { type: Block['type']; label: string; icon: string; desc: string }[] = [
  { type: 'heading', label: '見出し', icon: 'T', desc: '大きな文字の見出し' },
  { type: 'paragraph', label: '本文', icon: '¶', desc: 'ふつうの文章' },
  { type: 'image', label: '写真', icon: '📷', desc: '画像をアップロード' },
  { type: 'bullet', label: '箇条書き', icon: '・', desc: '「・」で始まるリスト' },
  { type: 'numbered', label: '番号付きリスト', icon: '1.', desc: '「1. 2. 3.」の順番リスト' },
]

export default function ArticleForm({ applicationId, studentId, initialDiary }: Props) {
  const [title, setTitle] = useState(initialDiary?.title ?? '')
  const [blocks, setBlocks] = useState<Block[]>(() => initialBlocks(initialDiary))
  const [isPublic, setIsPublic] = useState<boolean>(initialDiary?.is_public ?? false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [focusId, setFocusId] = useState<string | null>(null)
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [saving, setSaving] = useState<'private' | 'public' | null>(null)
  const [savedMessage, setSavedMessage] = useState<string | null>(null)
  const [publicUrl, setPublicUrl] = useState<string | null>(
    initialDiary?.is_public ? `/caredent/article/${applicationId}/view` : null
  )
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function addBlock(type: Block['type']) {
    const id = genId()
    const block: Block =
      type === 'image'
        ? { id, type: 'image', url: '' }
        : type === 'bullet' || type === 'numbered'
          ? { id, type, items: [''] }
          : { id, type, text: '' }
    setBlocks((prev) => {
      const last = prev[prev.length - 1]
      if (last && last.type === 'paragraph' && !last.text.trim() && type !== 'paragraph') {
        return [...prev.slice(0, -1), block]
      }
      return [...prev, block]
    })
    setFocusId(id)
    setMenuOpen(false)
  }

  function updateBlock(id: string, patch: Partial<Block>) {
    setBlocks((prev) => prev.map((b) => (b.id === id ? ({ ...b, ...patch } as Block) : b)))
  }

  function removeBlock(id: string) {
    setBlocks((prev) => {
      const next = prev.filter((b) => b.id !== id)
      return next.length ? next : [{ id: genId(), type: 'paragraph', text: '' }]
    })
  }

  function moveBlock(id: string, dir: -1 | 1) {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id)
      const to = idx + dir
      if (idx < 0 || to < 0 || to >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[to]] = [next[to], next[idx]]
      return next
    })
  }

  async function uploadImage(blockId: string, file: File) {
    setUploadingId(blockId)
    setError(null)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop() ?? 'jpg'
      const filename = `diary-${studentId}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('diary-images')
        .upload(filename, file, { upsert: false })
      if (uploadError) {
        setError('画像のアップロードに失敗しました。もう一度お試しください。')
        return
      }
      const { data } = supabase.storage.from('diary-images').getPublicUrl(filename)
      updateBlock(blockId, { url: data.publicUrl })
    } finally {
      setUploadingId(null)
    }
  }

  async function handleSave(makePublic: boolean) {
    setSaving(makePublic ? 'public' : 'private')
    setError(null)
    setSavedMessage(null)
    try {
      const supabase = createClient()
      const content = serializeBlocks(blocks)
      const imageUrls = blocks
        .filter((b): b is Extract<Block, { type: 'image' }> => b.type === 'image' && !!b.url)
        .map((b) => b.url)
      const payload = {
        application_id: applicationId,
        student_id: studentId,
        title: title.trim() || null,
        content,
        image_urls: imageUrls,
        is_public: makePublic,
        updated_at: new Date().toISOString(),
      }

      if (initialDiary) {
        const { error } = await supabase.from('diary_entries').update(payload).eq('id', initialDiary.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('diary_entries').insert(payload)
        if (error) throw error
      }

      setIsPublic(makePublic)
      if (makePublic) {
        setPublicUrl(`/caredent/article/${applicationId}/view`)
        setSavedMessage('公開しました！')
      } else {
        setPublicUrl(null)
        setSavedMessage('非公開で保存しました')
      }
      setTimeout(() => setSavedMessage(null), 4000)
    } catch (e) {
      setError('保存に失敗しました。もう一度お試しください。')
      console.error(e)
    } finally {
      setSaving(null)
    }
  }

  async function copyPublicUrl() {
    if (!publicUrl) return
    const full = `${window.location.origin}${publicUrl}`
    try {
      await navigator.clipboard.writeText(full)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <div>
      {/* タイトル */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="タイトルを入力"
        className="w-full bg-transparent text-3xl font-bold text-gray-900 placeholder-gray-300 focus:outline-none mb-6"
      />

      {/* エディタ本体 */}
      <div className="space-y-1">
        {blocks.map((block, idx) => (
          <div key={block.id} className="group relative">
            <div className="absolute -right-1 top-1 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-10">
              <button
                type="button"
                onClick={() => moveBlock(block.id, -1)}
                disabled={idx === 0}
                aria-label="上へ移動"
                className="w-6 h-6 flex items-center justify-center rounded text-gray-300 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 text-xs"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => moveBlock(block.id, 1)}
                disabled={idx === blocks.length - 1}
                aria-label="下へ移動"
                className="w-6 h-6 flex items-center justify-center rounded text-gray-300 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 text-xs"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => removeBlock(block.id)}
                aria-label="ブロックを削除"
                className="w-6 h-6 flex items-center justify-center rounded text-gray-300 hover:text-red-500 hover:bg-red-50 text-xs"
              >
                ✕
              </button>
            </div>

            <BlockView
              block={block}
              autoFocus={focusId === block.id}
              uploading={uploadingId === block.id}
              onChange={(patch) => updateBlock(block.id, patch)}
              onUpload={(file) => uploadImage(block.id, file)}
            />
          </div>
        ))}
      </div>

      {/* ＋ ブロック追加 */}
      <div ref={menuRef} className="relative mt-3" onMouseLeave={() => setMenuOpen(false)}>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          onMouseEnter={() => setMenuOpen(true)}
          aria-label="ブロックを追加"
          className="w-9 h-9 flex items-center justify-center rounded-full border-2 border-gray-300 text-gray-400 hover:border-[#4592c0] hover:text-[#4592c0] transition-colors text-xl leading-none"
        >
          ＋
        </button>

        {menuOpen && (
          <div className="absolute left-0 top-10 z-30 w-64 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
            {BLOCK_MENU.map((item) => (
              <button
                key={item.type}
                type="button"
                onClick={() => addBlock(item.type)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
              >
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 text-sm font-bold">
                  {item.icon}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-gray-800">{item.label}</span>
                  <span className="block text-xs text-gray-400">{item.desc}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* 公開URL（公開中のとき表示） */}
      {isPublic && publicUrl && (
        <div className="mt-8 p-4 rounded-xl bg-green-50 border border-green-200">
          <p className="text-sm font-semibold text-green-800 flex items-center gap-1.5">
            <span>🌐</span> この記事は公開中です
          </p>
          <p className="text-xs text-green-700 mt-1">下記URLを知っている人は誰でも閲覧できます</p>
          <div className="mt-2 flex items-center gap-2">
            <input
              readOnly
              value={typeof window !== 'undefined' ? `${window.location.origin}${publicUrl}` : publicUrl}
              className="flex-1 min-w-0 px-3 py-2 text-xs bg-white border border-green-200 rounded-lg text-gray-600"
            />
            <button
              type="button"
              onClick={copyPublicUrl}
              className="flex-shrink-0 px-3 py-2 text-xs font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {copied ? 'コピー済' : 'コピー'}
            </button>
          </div>
        </div>
      )}

      {/* 保存ボタン */}
      <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <button
          type="button"
          onClick={() => handleSave(false)}
          disabled={saving !== null || uploadingId !== null}
          className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm shadow-sm"
        >
          {saving === 'private' ? '保存中...' : '非公開で保存'}
        </button>
        <button
          type="button"
          onClick={() => handleSave(true)}
          disabled={saving !== null || uploadingId !== null}
          className="flex-1 px-6 py-3 bg-[#4592c0] text-white font-bold rounded-full hover:bg-[#3a7ea8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm shadow"
        >
          {saving === 'public' ? '公開中...' : '公開して保存'}
        </button>
      </div>
      {savedMessage && (
        <p className="mt-3 text-sm text-green-600 font-medium text-center sm:text-left">✓ {savedMessage}</p>
      )}
    </div>
  )
}

function BlockView({
  block,
  autoFocus,
  uploading,
  onChange,
  onUpload,
}: {
  block: Block
  autoFocus: boolean
  uploading: boolean
  onChange: (patch: Partial<Block>) => void
  onUpload: (file: File) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)

  if (block.type === 'heading') {
    return (
      <AutoTextarea
        value={block.text}
        onChange={(text) => onChange({ text })}
        placeholder="見出し"
        autoFocus={autoFocus}
        className="text-2xl font-bold text-gray-900 placeholder-gray-300 py-2 pr-20"
      />
    )
  }

  if (block.type === 'paragraph') {
    return (
      <AutoTextarea
        value={block.text}
        onChange={(text) => onChange({ text })}
        placeholder="本文を入力..."
        autoFocus={autoFocus}
        className="text-base leading-relaxed text-gray-800 placeholder-gray-300 py-1.5 pr-20"
      />
    )
  }

  if (block.type === 'image') {
    if (block.url) {
      return (
        <div className="py-2">
          <img src={block.url} alt="記事画像" className="max-w-full rounded-xl" />
        </div>
      )
    }
    return (
      <div className="py-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onUpload(file)
          }}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="w-full py-10 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 hover:border-[#4592c0] hover:text-[#4592c0] transition-colors text-sm font-medium disabled:opacity-50"
        >
          {uploading ? 'アップロード中...' : '📷 クリックして写真をアップロード'}
        </button>
      </div>
    )
  }

  const isBullet = block.type === 'bullet'
  return (
    <div className="py-1.5 space-y-1">
      {block.items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="flex-shrink-0 w-6 text-right text-gray-500 text-base leading-relaxed select-none">
            {isBullet ? '・' : `${i + 1}.`}
          </span>
          <input
            type="text"
            value={item}
            autoFocus={autoFocus && i === block.items.length - 1}
            onChange={(e) => {
              const items = [...block.items]
              items[i] = e.target.value
              onChange({ items })
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                const items = [...block.items]
                items.splice(i + 1, 0, '')
                onChange({ items })
              } else if (e.key === 'Backspace' && item === '' && block.items.length > 1) {
                e.preventDefault()
                const items = block.items.filter((_, idx) => idx !== i)
                onChange({ items })
              }
            }}
            placeholder="リスト項目"
            className="flex-1 bg-transparent text-base leading-relaxed text-gray-800 placeholder-gray-300 focus:outline-none pr-20"
          />
        </div>
      ))}
    </div>
  )
}
