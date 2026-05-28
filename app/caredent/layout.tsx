import type { Metadata } from 'next'
import Header from '@/components/Header'

export const metadata: Metadata = {
  title: 'Caredent',
  description: '探究プログラム・ボランティア募集プラットフォーム',
  metadataBase: new URL('https://www.nocsy.me'),
  openGraph: {
    title: 'Caredent',
    description: '探究プログラム・ボランティア募集プラットフォーム',
    url: 'https://www.nocsy.me/caredent',
    siteName: 'Caredent',
    images: [{ url: '/ogp.png', width: 1200, height: 630, alt: 'Caredent' }],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Caredent',
    description: '探究プログラム・ボランティア募集プラットフォーム',
    images: ['/ogp.png'],
  },
}

export default function CaredentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
    </div>
  )
}
