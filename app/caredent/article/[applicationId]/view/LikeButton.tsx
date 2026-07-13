'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

// 未ログイン時の匿名識別キー（localStorage）
function getLikerKey(userId: string | null): string {
  if (userId) return userId
  if (typeof window === 'undefined') return ''
  let key = localStorage.getItem('caredent_anon_id')
  if (!key) {
    key = 'anon-' + (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now())
    localStorage.setItem('caredent_anon_id', key)
  }
  return key
}

export default function LikeButton({
  applicationId,
  userId,
  initialCount,
}: {
  applicationId: string
  userId: string | null
  initialCount: number
}) {
  const [count, setCount] = useState(initialCount)
  const [liked, setLiked] = useState(false)
  const [busy, setBusy] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const likerKey = getLikerKey(userId)
    if (!likerKey) return
    const supabase = createClient()
    supabase
      .rpc('get_article_like_state', { p_application_id: applicationId, p_liker_key: likerKey })
      .then(({ data }) => {
        const row = Array.isArray(data) ? data[0] : data
        if (row) {
          setCount(Number(row.like_count))
          setLiked(Boolean(row.liked))
        }
        setReady(true)
      })
  }, [applicationId, userId])

  async function toggle() {
    if (busy) return
    setBusy(true)
    // 楽観的更新
    setLiked((v) => !v)
    setCount((c) => c + (liked ? -1 : 1))
    try {
      const supabase = createClient()
      const likerKey = getLikerKey(userId)
      const { data, error } = await supabase.rpc('toggle_article_like', {
        p_application_id: applicationId,
        p_liker_key: likerKey,
      })
      if (error) throw error
      const row = Array.isArray(data) ? data[0] : data
      if (row) {
        setCount(Number(row.like_count))
        setLiked(Boolean(row.liked))
      }
    } catch {
      // 失敗したら元に戻す
      setLiked((v) => !v)
      setCount((c) => c + (liked ? 1 : -1))
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy || !ready}
      aria-pressed={liked}
      aria-label="いいね"
      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full border font-semibold text-sm transition-all active:scale-95 disabled:opacity-60 ${
        liked
          ? 'bg-pink-50 border-pink-200 text-pink-600'
          : 'bg-white border-gray-200 text-gray-500 hover:border-pink-200 hover:text-pink-500'
      }`}
    >
      <svg className="w-5 h-5" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      <span>{count}</span>
    </button>
  )
}
