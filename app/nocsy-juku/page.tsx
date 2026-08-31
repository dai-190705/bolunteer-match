import type { Metadata } from 'next'
import Image from 'next/image'

const LINE_URL = 'https://line.me/R/ti/p/@545kmxeh'

const NAVY = '#19365B'
const GREEN = '#8CC63F'

export const metadata: Metadata = {
  title: '総合型選抜対策専門塾 NOCSY塾 | NOCSY',
  description:
    'オンラインで総合型選抜対策を行う専門塾「NOCSY塾」。総合型選抜経験のある大学生メンターがマンツーマンで、課外活動の段階から手厚くサポート。月額1.5万円からの安心低価格。',
  openGraph: {
    title: '総合型選抜対策専門塾 NOCSY塾',
    description:
      'オンラインで総合型選抜対策を行う専門塾。課外活動の段階からマンツーマンでサポート。月額1.5万円から。',
    url: 'https://www.nocsy.me/nocsy-juku',
    siteName: 'NOCSY',
    images: [{ url: '/nocsy-juku/hero.png', width: 1920, height: 1280, alt: 'NOCSY塾' }],
    locale: 'ja_JP',
    type: 'website',
  },
}

/* 特徴 */
const FEATURES = [
  {
    num: '01',
    title: 'オンラインで全国どこからでも受講可能',
    body: '授業・面談はすべてオンラインで完結。通塾の移動時間はゼロで、部活や学校生活と両立しながら、全国どこからでも総合型選抜対策を進められます。',
    icon: '💻',
  },
  {
    num: '02',
    title: '総合型選抜の実績があるメンターが指導',
    body: '実際に総合型選抜を突破した大学生メンターが、自身の経験をもとにリアルな指導を行います。「合格者だから知っている」出願書類や面接のポイントを、マンツーマンで伝えます。',
    icon: '🎓',
  },
  {
    num: '03',
    title: '課外活動の段階から手厚いサポート',
    body: '志望理由書を書く前の「課外活動・フィールドワーク」の段階から伴走するのがNOCSY塾の最大の特徴。NOCSYが提携するボランティア・探究プログラムを駆使して、あなただけの実体験を一緒に創ります。',
    icon: '🔍',
  },
]

/* メンター（写真・紹介文はあとから追加） */
const MENTORS: { name: string; title: string; body: string; photo: string | null }[] = [
  {
    name: 'Coming Soon',
    title: 'メンター紹介',
    body: '紹介文は近日公開予定です。',
    photo: null,
  },
  {
    name: 'Coming Soon',
    title: 'メンター紹介',
    body: '紹介文は近日公開予定です。',
    photo: null,
  },
  {
    name: 'Coming Soon',
    title: 'メンター紹介',
    body: '紹介文は近日公開予定です。',
    photo: null,
  },
]

function LineButton({ label, large = false }: { label: string; large?: boolean }) {
  return (
    <a
      href={LINE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-full font-bold text-white shadow-md hover:opacity-90 hover:shadow-lg transition-all ${
        large ? 'px-10 py-4 text-base' : 'px-6 py-3 text-sm'
      }`}
      style={{ backgroundColor: '#06C755' }}
    >
      {label}
    </a>
  )
}

export default function NocsyJukuPage() {
  return (
    <div className="font-sans" style={{ color: NAVY }}>
      {/* ===== Navigation ===== */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-3">
          <Image
            src="/nocsy-logo.png"
            alt="NOCSY塾"
            width={150}
            height={31}
            className="object-contain flex-shrink-0"
          />
          <div className="hidden md:flex items-center gap-7 text-sm" style={{ color: NAVY }}>
            <a href="#features" className="hover:opacity-60 transition-opacity">NOCSY塾の特徴</a>
            <a href="#price" className="hover:opacity-60 transition-opacity">料金</a>
            <a href="#mentors" className="hover:opacity-60 transition-opacity">メンター紹介</a>
            <a href="#campaign" className="hover:opacity-60 transition-opacity">キャンペーン</a>
          </div>
          <LineButton label="LINEで相談" />
        </div>
      </nav>

      {/* ===== Hero（トップ画像） ===== */}
      <section className="pt-[60px]">
        <img
          src="/nocsy-juku/hero.png"
          alt="総合型選抜対策専門塾 NOCSY塾 — マンツーマンで課外活動からサポート、総合型選抜経験のある大学生メンターがリアルな指導、月額1.5万円〜の安心低価格"
          className="w-full object-cover"
        />
      </section>

      {/* ===== Hero下キャッチ ===== */}
      <section className="py-16 md:py-20 text-white" style={{ backgroundColor: NAVY }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs md:text-sm font-bold tracking-[0.3em] mb-4" style={{ color: GREEN }}>
            総合型選抜対策専門塾 NOCSY塾
          </p>
          <h1 className="text-2xl md:text-4xl font-bold leading-snug mb-6">
            「経験」から創る、<br className="md:hidden" />
            自分だけの合格ストーリー。
          </h1>
          <p className="text-white/80 leading-relaxed max-w-2xl mx-auto mb-8">
            NOCSY塾は、オンラインで総合型選抜対策を行う専門塾です。NOCSYが提携するボランティア・探究プログラムを駆使し、志望理由書を書く前の課外活動の段階から手厚くサポートします。
          </p>
          <LineButton label="公式LINEで無料受験相談 →" large />
        </div>
      </section>

      {/* ===== 1. NOCSY塾の特徴 ===== */}
      <section id="features" className="py-20 md:py-28 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-bold tracking-[0.3em] mb-3" style={{ color: GREEN }}>FEATURES</p>
            <h2 className="text-2xl md:text-3xl font-bold">NOCSY塾の特徴</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.num}
                className="rounded-2xl border bg-white p-8 shadow-sm hover:shadow-md transition-shadow"
                style={{ borderColor: `${GREEN}55` }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <span
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${GREEN}22` }}
                  >
                    {f.icon}
                  </span>
                  <span className="font-mono font-bold text-sm" style={{ color: GREEN }}>{f.num}</span>
                </div>
                <h3 className="font-bold text-lg leading-snug mb-3">{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: `${NAVY}B3` }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 2. なぜこんなに安いのか？ ===== */}
      <section id="price" className="py-20 md:py-28" style={{ backgroundColor: '#F5F9EE' }}>
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-bold tracking-[0.3em] mb-3" style={{ color: GREEN }}>PRICE</p>
            <h2 className="text-2xl md:text-3xl font-bold mb-6">なぜこんなに安いのか？</h2>
            <p className="text-lg md:text-xl font-bold">
              月額<span className="text-4xl md:text-5xl mx-1" style={{ color: GREEN }}>1.5</span>万円〜
            </p>
          </div>

          {/* 他社比較表 */}
          <div className="mb-12">
            <div className="rounded-2xl overflow-hidden bg-white shadow-sm border" style={{ borderColor: `${NAVY}1A` }}>
              <img
                src="/nocsy-juku/comparison.png"
                alt="NOCSY塾と他社（A塾・B塾・C塾）の授業料・入会金・課外活動サポート・講師の比較表"
                className="w-full object-contain"
              />
            </div>
            <p className="mt-3 text-xs text-center" style={{ color: `${NAVY}80` }}>
              ※ 各社の公開情報をもとに作成
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 md:p-10 shadow-sm border" style={{ borderColor: `${GREEN}55` }}>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <span
                className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold"
                style={{ backgroundColor: GREEN }}
              >
                A
              </span>
              固定費を徹底的に下げているから。
            </h3>
            <p className="leading-relaxed" style={{ color: `${NAVY}B3` }}>
              NOCSY塾は自前の店舗（校舎）を持ちません。授業は既存の学習塾のスペースを活用したり、オンラインで実施することで、家賃などの固定費を大幅にカット。浮いたコストをそのまま受講料に還元することで、総合型選抜対策の専門塾でありながら、月額1.5万円からという価格を実現しています。
            </p>
          </div>
        </div>
      </section>

      {/* ===== 3. メンターの紹介 ===== */}
      <section id="mentors" className="py-20 md:py-28 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-bold tracking-[0.3em] mb-3" style={{ color: GREEN }}>MENTORS</p>
            <h2 className="text-2xl md:text-3xl font-bold">メンターの紹介</h2>
            <p className="mt-4 text-sm" style={{ color: `${NAVY}99` }}>
              総合型選抜を実際に突破した大学生メンターが、あなたに伴走します。
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {MENTORS.map((m, i) => (
              <div
                key={i}
                className="rounded-2xl border bg-white overflow-hidden shadow-sm"
                style={{ borderColor: `${NAVY}1A` }}
              >
                {/* 写真（あとから差し替え） */}
                <div
                  className="aspect-square flex items-center justify-center"
                  style={{ backgroundColor: '#F5F9EE' }}
                >
                  {m.photo ? (
                    <img src={m.photo} alt={m.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2" style={{ color: `${NAVY}55` }}>
                      <span
                        className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
                        style={{ backgroundColor: `${GREEN}33` }}
                      >
                        👤
                      </span>
                      <span className="text-xs font-medium">写真準備中</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <p className="text-xs font-bold mb-1" style={{ color: GREEN }}>{m.title}</p>
                  <h3 className="font-bold mb-2">{m.name}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: `${NAVY}99` }}>{m.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 4. 早期申込キャンペーン ===== */}
      <section id="campaign" className="py-20 md:py-28 text-white" style={{ backgroundColor: NAVY }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-sm font-bold tracking-[0.3em] mb-3" style={{ color: GREEN }}>CAMPAIGN</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-10">早期申込キャンペーン</h2>

          <div
            className="rounded-3xl border p-10 md:p-14 bg-white/5"
            style={{ borderColor: `${GREEN}66` }}
          >
            <p
              className="inline-block text-xs font-bold tracking-widest rounded-full px-4 py-1.5 mb-6"
              style={{ backgroundColor: GREEN, color: NAVY }}
            >
              期間限定
            </p>
            <p className="text-xl md:text-2xl font-bold mb-2">
              初月<span className="text-5xl md:text-6xl mx-1" style={{ color: GREEN }}>0</span>円
            </p>
            <p className="text-white/80 mb-8">で体験入塾できます</p>
            <p className="text-sm text-white/60 leading-relaxed mb-8">
              「総合型選抜、何から始めればいいかわからない」——まずは1ヶ月、NOCSY塾のサポートを無料で体験してみてください。
            </p>
            <LineButton label="公式LINEからキャンペーンに申し込む →" large />
          </div>
        </div>
      </section>

      {/* ===== 5. 公式LINEから受験相談 ===== */}
      <section className="py-20 md:py-28" style={{ backgroundColor: '#F5F9EE' }}>
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="text-sm font-bold tracking-[0.3em] mb-3" style={{ color: GREEN }}>CONTACT</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-5">公式LINEから受験相談</h2>
          <p className="leading-relaxed mb-10" style={{ color: `${NAVY}B3` }}>
            入塾の申込・受験のお悩み・料金のご質問など、すべて公式LINEで受け付けています。まずはお気軽に友だち追加してください。
          </p>
          <LineButton label="公式LINEを友だち追加する →" large />
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="py-6 text-center text-sm text-white/50" style={{ backgroundColor: NAVY }}>
        © 2025 NOCSY
      </footer>
    </div>
  )
}
