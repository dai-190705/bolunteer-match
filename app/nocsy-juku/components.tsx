import Image from 'next/image'
import Link from 'next/link'

export const LINE_URL = 'https://line.me/R/ti/p/@545kmxeh'

export const DOCUMENT_REQUEST_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSckVaMqKNoxww9dKCPJ1V2yM6kV5KlIUOxeajoYbGy9bTaK4w/viewform'

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
  return <CtaButton href={DOCUMENT_REQUEST_URL} background={GREEN} color="#FFFFFF" {...props} />
}

const DOCUMENT_CONTENTS = [
  '実際の塾生が5つのステップをどう進んだのか',
  '参加したボランティアや探究プログラムの実例',
  '経験を志望理由へとつなげていくまでの過程',
]

export function DocumentRequestSection({ children }: { children?: React.ReactNode }) {
  return (
    <section id="document" className="py-20 md:py-28" style={{ backgroundColor: '#F5F9EE' }}>
      <div className="max-w-2xl mx-auto px-6 text-center">
        <p className="text-sm font-bold tracking-[0.3em] mb-3" style={{ color: GREEN }}>DOCUMENT</p>
        <h2 className="text-2xl md:text-3xl font-bold leading-snug mb-6">
          「NOCSY塾での活動例」を<br />
          無料でダウンロード
        </h2>
        <img
          src="/nocsy-juku/document.jpg"
          alt="メンターと一緒に活動を振り返る高校生"
          className="w-full h-auto border mb-8"
          style={{ borderColor: `${NAVY}1A` }}
        />
        <p className="leading-relaxed mb-10" style={{ color: `${NAVY}B3` }}>
          実際の塾生が、興味を広げるところから総合型選抜で自分の経験を伝えるまでを、どのように歩んだのか。5つのステップに沿って、具体的な活動例としてまとめました。
        </p>

        <div className="bg-white text-left px-8 py-7 mb-10 border" style={{ borderColor: `${NAVY}1A` }}>
          <p className="text-xs font-bold tracking-widest mb-4" style={{ color: GREEN }}>資料でわかること</p>
          <ul className="space-y-3">
            {DOCUMENT_CONTENTS.map((item) => (
              <li key={item} className="flex items-start gap-3 font-bold leading-snug">
                <span className="mt-[0.45em] w-2 h-2 flex-shrink-0" style={{ backgroundColor: GREEN }} />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm mb-8" style={{ color: `${NAVY}B3` }}>
          「実際に何をするの？」が、具体的にイメージできる資料です。
        </p>
        <DocumentRequestButton label="活動例の資料をダウンロード" large />
        {children}
      </div>
    </section>
  )
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
