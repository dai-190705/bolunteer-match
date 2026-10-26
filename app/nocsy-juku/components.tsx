import Image from 'next/image'
import Link from 'next/link'
import type { LinePosition } from './line'

export const NAVY = '#19365B'
export const GREEN = '#8CC63F'
export const PALE_GREEN = '#F5F9EE'

export function LineButton({
  position,
  label,
  large = false,
}: {
  position: LinePosition
  label: string
  large?: boolean
}) {
  return (
    <a
      href={`/go/line/${position}`}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-bold text-white shadow-md hover:opacity-90 hover:shadow-lg transition-all ${
        large ? 'w-full sm:w-auto px-10 py-4 text-base' : 'px-5 py-2.5 text-sm'
      }`}
      style={{ backgroundColor: '#06C755' }}
    >
      {label}
    </a>
  )
}

export function SectionLabel({ en, ja, lead }: { en: string; ja: string; lead?: string }) {
  return (
    <div className="text-center mb-10 md:mb-14">
      <p className="text-xs md:text-sm font-bold tracking-[0.3em] mb-3" style={{ color: GREEN }}>{en}</p>
      <h2 className="text-2xl md:text-3xl font-bold leading-snug">{ja}</h2>
      {lead && (
        <p className="mt-4 text-sm md:text-base leading-relaxed" style={{ color: `${NAVY}B3` }}>
          {lead}
        </p>
      )}
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
          <a href="/nocsy-juku#plans" className="hover:opacity-60 transition-opacity">プランと料金</a>
          <a href="/nocsy-juku#model" className="hover:opacity-60 transition-opacity">1年間の流れ</a>
          <a href="/nocsy-juku#compare" className="hover:opacity-60 transition-opacity">他塾との比較</a>
          <a href="/nocsy-juku#faq" className="hover:opacity-60 transition-opacity">よくある質問</a>
        </div>
        <LineButton position="header" label="LINEで相談" />
      </div>
    </nav>
  )
}

export function LineCtaSection({
  position,
  children,
}: {
  position: Extract<LinePosition, 'bottom' | 'detail'>
  children?: React.ReactNode
}) {
  return (
    <section id="contact" className="py-16 md:py-24" style={{ backgroundColor: PALE_GREEN }}>
      <div className="max-w-2xl mx-auto px-6 text-center">
        <p className="text-xs md:text-sm font-bold tracking-[0.3em] mb-3" style={{ color: GREEN }}>CONTACT</p>
        <h2 className="text-2xl md:text-3xl font-bold leading-snug mb-5">まずはLINEで無料相談</h2>
        <p className="leading-relaxed mb-8" style={{ color: `${NAVY}B3` }}>
          お子さまの学年や状況に合わせたプランのご相談を、LINEでお気軽にどうぞ。
        </p>
        <LineButton position={position} label="LINEで無料相談する" large />
        {children}
      </div>
    </section>
  )
}

export function JukuFooter() {
  return (
    <footer className="py-6 text-center text-sm text-white/50" style={{ backgroundColor: NAVY }}>
      © 2026 NOCSY, inc
    </footer>
  )
}
