'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

type DiaryEntry = {
  id: string
  application_id: string
  student_id: string
  image_urls: string[]
  learned: string | null
  next_challenge: string | null
  content: string | null
}

type Props = {
  applicationId: string
  studentId: string
  initialDiary: DiaryEntry | null
}

// ─── ブロックモデル ───────────────────────────────
type Block =
  | { id: string; type: 'heading'; text: string }
  | { id: string; type: 'paragraph'; text: string }
  | { id: string; type: 'image'; url: string }
  | { id: string; type: 'bullet'; items: string[] }
  | { id: string; type: 'numbered'; items: string[] }

function genId() {
  return Math.random().toString(36).slice(2, 10)
}

// ブロック → マークダウン
function serializeBlocks(blocks: Block[]): string {
  const parts: string[] = []
  for (const b of blocks) {
    if (b.type === 'heading' && b.text.trim()) parts.push(`## ${b.text.trim()}`)
    else if (b.type === 'paragraph' && b.text.trim()) parts.push(b.text.trim())
    else if (b.type === 'image' && b.url) parts.push(`![記事画像](${b.url})`)
    else if (b.type === 'bullet' && b.items.some((i) => i.trim()))
      parts.push(b.items.filter((i) => i.trim()).map((i) => `- ${i.trim()}`).join('\n'))
    else if (b.type === 'numbered' && b.items.some((i) => i.trim()))
      parts.push(b.items.filter((i) => i.trim()).map((i, idx) => `${idx + 1}. ${i.trim()}`).join('\n'))
  }
  return parts.join('\n\n')
}

// マークダウン → ブロック
function parseContent(md: string): Block[] {
  const blocks: Block[] = []
  const lines = md.split('\n')
  let para: string[] = []
  let list: { type: 'bullet' | 'numbered'; items: string[] } | null = null

  const flushPara = () => {
    if (para.length) {
      blocks.push({ id: genId(), type: 'paragraph', text: para.join('\n') })
      para = []
    }
  }
  const flushList = () => {
    if (list) {
      blocks.push({ id: genId(), type: list.type, items: list.items })
      list = null
    }
  }

  for (const line of lines) {
    const imageMatch = line.match(/^!\[[^\]]*\]\((.+)\)\s*$/)
    const headingMatch = line.match(/^##\s+(.*)$/)
    const bulletMatch = line.match(/^-\s+(.*)$/)
    const numberedMatch = line.match(/^\d+\.\s+(.*)$/)

    if (headingMatch) {
      flushPara(); flushList()
      blocks.push({ id: genId(), type: 'heading', text: headingMatch[1] })
    } else if (imageMatch) {
      flushPara(); flushList()
      blocks.push({ id: genId(), type: 'image', url: imageMatch[1] })
    } else if (bulletMatch) {
      flushPara()
      if (list?.type !== 'bullet') { flushList(); list = { type: 'bullet', items: [] } }
      list.items.push(bulletMatch[1])
    } else if (numberedMatch) {
      flushPara()
      if (list?.type !== 'numbered') { flushList(); list = { type: 'numbered', items: [] } }
      list.items.push(numberedMatch[1])
    } else if (line.trim() === '') {
      flushPara(); flushList()
    } else {
      flushList()
      para.push(line)
    }
  }
  flushPara(); flushList()
  return blocks
}

// 旧形式（learned / next_challenge / image_urls）からブロックへ変換
function blocksFromLegacy(diary: DiaryEntry): Block[] {
  const blocks: Block[] = []
  for (const url of diary.image_urls ?? []) {
    blocks.push({ id: genId(), type: 'image', url })
  }
  if (diary.learned?.trim()) {
    blocks.push({ id: genId(), type: 'heading', text: 'このボランティアで学んだこと' })
    blocks.push({ id: genId(), type: 'paragraph', text: diary.learned.trim() })
  }
  if (diary.next_challenge?.trim()) {
    blocks.push({ id: genId(), type: 'heading', text: '次にやってみたいと感じたこと' })
    blocks.push({ id: genId(), type: 'paragraph', text: diary.next_challenge.trim() })
  }
  return blocks
}

function initialBlocks(diary: DiaryEntry | null): Block[] {
  if (diary?.content?.trim()) return parseContent(diary.content)
  if (diary) {
    const legacy = blocksFromLegacy(diary)
    if (legacy.length) return legacy
  }
  return [{ id: genId(), type: 'paragraph', text: '' }]
}

// ─── 自動リサイズ textarea ───────────────────────
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

// ─── メイン ──────────────────────────────────────
const BLOCK_MENU: { type: Block['type']; label: string; icon: string; desc: string }[] = [
  { type: 'heading', label: '見出し', icon: 'T', desc: '大きな文字の見出し' },
  { type: 'paragraph', label: '本文', icon: '¶', desc: 'ふつうの文章' },
  { type: 'image', label: '写真', icon: '📷', desc: '画像をアップロード' },
  { type: 'bullet', label: '箇条書き', icon: '・', desc: '「・」で始まるリスト' },
  { type: 'numbered', label: '番号付きリスト', icon: '1.', desc: '「1. 2. 3.」の順番リスト' },
]

export default function DiaryForm({ applicationId, studentId, initialDiary }: Props) {
  const [blocks, setBlocks] = useState<Block[]>(() => initialBlocks(initialDiary))
  const [menuOpen, setMenuOpen] = useState(false)
  const [focusId, setFocusId] = useState<string | null>(null)
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // メニュー外クリックで閉じる
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
      // 末尾が空の本文ブロックなら置き換える
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

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSavedMessage(null)
    try {
      const supabase = createClient()
      const content = serializeBlocks(blocks)
      const imageUrls = blocks.filter((b): b is Extract<Block, { type: 'image' }> => b.type === 'image' && !!b.url).map((b) => b.url)
      const payload = {
        application_id: applicationId,
        student_id: studentId,
        content,
        image_urls: imageUrls,
        updated_at: new Date().toISOString(),
      }

      if (initialDiary) {
        const { error } = await supabase.from('diary_entries').update(payload).eq('id', initialDiary.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('diary_entries').insert(payload)
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
    <div>
      {/* エディタ本体 */}
      <div className="space-y-1">
        {blocks.map((block, idx) => (
          <div key={block.id} className="group relative">
            {/* ブロック操作（ホバー時に右側に表示） */}
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

      {/* 保存 */}
      <div className="mt-10 flex items-center gap-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || uploadingId !== null}
          className="px-8 py-3 bg-[#4592c0] text-white font-bold rounded-full hover:bg-[#3a7ea8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm shadow"
        >
          {saving ? '保存中...' : '記事を保存する'}
        </button>
        {savedMessage && (
          <span className="text-sm text-green-600 font-medium">✓ {savedMessage}</span>
        )}
      </div>
    </div>
  )
}

// ─── 各ブロックの表示 ────────────────────────────
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

  // bullet / numbered リスト
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
