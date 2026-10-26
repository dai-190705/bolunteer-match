import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '公式LINEへ移動しています | NOCSY塾',
  robots: { index: false, follow: false },
}

export default function GoLineLayout({ children }: { children: React.ReactNode }) {
  return children
}
