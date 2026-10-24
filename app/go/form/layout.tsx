import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '資料請求フォームへ移動しています | NOCSY塾',
  robots: { index: false, follow: false },
}

export default function GoFormLayout({ children }: { children: React.ReactNode }) {
  return children
}
