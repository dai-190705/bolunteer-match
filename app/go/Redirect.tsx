'use client'

import { useEffect } from 'react'

export default function Redirect({ url }: { url: string }) {
  useEffect(() => {
    // 計測リクエストが送られる前に遷移して取りこぼさないよう、少しだけ待つ
    const timer = setTimeout(() => window.location.replace(url), 400)
    return () => clearTimeout(timer)
  }, [url])

  return null
}
