import Image from 'next/image'
import Link from 'next/link'

export const LINE_URL = 'https://line.me/R/ti/p/@545kmxeh'

// 資料請求フォームができたら差し替える
export const DOCUMENT_REQUEST_URL = LINE_URL

export const NAVY = '#19365B'
export const GREEN = '#8CC63F'

function CtaButton({
  href,
  label,
  large = false,
  background,
  color,
}: {
  href: string
  label: string
  large?: boolean
  background: string
  color: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-full font-bold shadow-md hover:opacity-90 hover:shadow-lg transition-all ${
        large ? 'px-10 py-4 text-base' : 'px-6 py-3 text-sm'
      }`}
      style={{ backgroundColor: background, color }}
    >
      {label}
    </a>
  )
}

export function LineButton(props: { label: string; large?: boolean }) {
  return <CtaButton href={LINE_URL} background="#06C755" color="#FFFFFF" {...props} />
}

export function DocumentRequestButton(props: { label: string; large?: boolean }) {
  return <CtaButton href={DOCUMENT_REQUEST_URL} background={GREEN} color={NAVY} {...props} />
}

export function SectionLabel({ en, ja }: { en: string; ja: string }) {
  return (
    <div className="text-center mb-14">
      <p className="text-sm font-bold tracking-[0.3em] mb-3" style={{ color: GREEN }}>{en}</p>
      <h2 className="text-2xl md:text-3xl font-bold">{ja}</h2>
    </div>
  )
}

export function JukuNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-3">
        <Link href="/nocsy-juku" className="flex-shrink-0">
          <Image src="/nocsy-logo.png" alt="NOCSY塾" width={150} height={31} className="object-contain" />
        </Link>
        <div className="hidden md:flex items-center gap-7 text-sm" style={{ color: NAVY }}>
          <a href="/nocsy-juku#features" className="hover:opacity-60 transition-opacity">NOCSY塾の特徴</a>
          <a href="/nocsy-juku#program" className="hover:opacity-60 transition-opacity">プログラム内容</a>
          <a href="/nocsy-juku#price" className="hover:opacity-60 transition-opacity">料金</a>
          <a href="/nocsy-juku#mentors" className="hover:opacity-60 transition-opacity">メンター紹介</a>
          <a href="/nocsy-juku#campaign" className="hover:opacity-60 transition-opacity">キャンペーン</a>
        </div>
        <DocumentRequestButton label="資料請求" />
      </div>
    </nav>
  )
}

export function JukuFooter() {
  return (
    <footer className="py-6 text-center text-sm text-white/50" style={{ backgroundColor: NAVY }}>
      © 2026 NOCSY, inc
    </footer>
  )
}
