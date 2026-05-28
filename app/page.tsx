import Link from 'next/link'
import Image from 'next/image'

export default function NOCSYHomePage() {
  return (
    <div className="font-sans text-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/nocsy-logo.png" alt="NOCSY" width={56} height={56} className="object-contain" />
            <span className="text-xl font-bold tracking-widest text-gray-900">NOCSY</span>
            <span className="text-gray-300 font-light text-lg">|</span>
            <span className="text-xs tracking-widest text-gray-500 uppercase">NO ONE CAN STOP YOU</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#greeting" className="hover:text-gray-900 transition-colors">ご挨拶</a>
            <a href="#services" className="hover:text-gray-900 transition-colors">私たちの仕事</a>
            <a href="#representative" className="hover:text-gray-900 transition-colors">代表情報</a>
            <a href="#contact" className="hover:text-gray-900 transition-colors">お問い合わせ</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1455849318743-b2233052fcff?w=1600&q=80')` }}
        />
        <div className="absolute inset-0 bg-black/55" />

        {/* Left vertical text */}
        <div
          className="absolute left-8 top-1/2 -translate-y-1/2 text-white/70 text-sm tracking-widest"
          style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
        >
          出る杭は打たれる。
        </div>

        {/* Center text */}
        <div className="relative z-10 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold tracking-wider" style={{ fontFamily: 'Georgia, serif' }}>
            No one can stop you.
          </h1>
        </div>

        {/* Right vertical text */}
        <div
          className="absolute right-8 top-1/2 -translate-y-1/2 text-white/70 text-sm tracking-widest"
          style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
        >
          でも、出過ぎる杭は打たれない。
        </div>
      </section>

      {/* Section: ご挨拶 */}
      <section id="greeting" className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex gap-8">
            {/* Vertical label */}
            <div className="flex-shrink-0 flex items-start gap-3">
              <div className="w-px bg-gray-300 h-full min-h-[200px]" />
              <span
                className="text-xs text-gray-400 tracking-widest mt-2"
                style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
              >
                存在意義
              </span>
            </div>

            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-bold mb-10 leading-tight" style={{ fontFamily: 'Georgia, "Noto Serif JP", serif' }}>
                学生の可能性を最大化させる。
              </h2>
              <div className="space-y-5 text-gray-700 leading-relaxed text-base">
                <p>正解のない問いが降り注ぎ、昨日の常識が瞬く間に塗り替えられていく。</p>
                <p>この加速し続ける時代の濁流において、今、若者たちに必要なのは、誰かに委ねる安定ではなく、自らの足で立ち、自らの思考で航路を切り拓く強さです。</p>
                <p className="font-semibold text-lg text-gray-900">「No one can stop you.」</p>
                <p>私たちは、この言葉をただの掲示物にはしません。</p>
                <p>すべての学生の内側に眠る、まだ見ぬ可能性。その爆発を阻むあらゆる境界線を壊し、可能性を最大化させること。</p>
                <p>誰にも止められない情熱が、この社会の新しい景色をつくると信じて。</p>
                <p>私たちは、挑戦を愛するすべての若者の、もっとも熱い伴走者であり続けます。</p>
              </div>
            </div>
          </div>
        </div>

        {/* Full-width image */}
        <div className="mt-16 relative h-64 md:h-80 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1533073526757-2c8ca1df9f1c?w=1200&q=80"
            alt="NOCSY"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Section: 私たちのサービス */}
      <section id="services" className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex gap-8">
            {/* Vertical label */}
            <div className="flex-shrink-0 flex items-start gap-3">
              <div className="w-px bg-gray-300 h-full min-h-[200px]" />
              <span
                className="text-xs text-gray-400 tracking-widest mt-2"
                style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
              >
                私たちのサービス
              </span>
            </div>

            <div className="flex-1">
              <p className="text-sm text-gray-400 font-mono mb-3">01</p>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 leading-tight">
                ボランティア・探究プログラムの紹介
              </h2>
              <p className="text-gray-700 leading-relaxed mb-8">
                「学校」と「社会」の境界をなくし、中高生の主体的な学びを支援する紹介エージェントを展開しています。生徒一人ひとりの好奇心を軸に、地域社会や企業での探究活動・ボランティア機会を創出。実社会での質の高い経験は、近年の総合型選抜（旧AO入試）や学校推薦型選択において、自分だけの「志望理由」や「活動実績」を語る強力な武器となります。伴走型のサポートを通じて、大学入試の先まで見据えた、未来を切り拓く力と唯一無二のキャリア形成を後押しします。
              </p>

              <div className="mb-8 rounded-xl overflow-hidden h-56 md:h-72">
                <img
                  src="https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=1200&q=80"
                  alt="ボランティア・探究プログラム"
                  className="w-full h-full object-cover"
                />
              </div>

              <Link
                href="/caredent"
                className="inline-block border border-gray-900 text-gray-900 px-8 py-3 text-sm font-medium hover:bg-gray-900 hover:text-white transition-colors"
              >
                私たちの仕事ページへ →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section: 代表情報 */}
      <section id="representative" className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex gap-8">
            {/* Vertical label */}
            <div className="flex-shrink-0 flex items-start gap-3">
              <div className="w-px bg-gray-300 h-full min-h-[200px]" />
              <span
                className="text-xs text-gray-400 tracking-widest mt-2"
                style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
              >
                代表情報
              </span>
            </div>

            <div className="flex-1">
              <div className="grid md:grid-cols-2 gap-10 items-start">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-6 leading-tight">
                    全ての高校生に探究のインフラを
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    高校時代に、地方観光マーケティングを手掛けるスタートアップでインターンシップ生として入社し、オウンドメディアの運営やSNSマーケティング、旅館やホテルのマーケティングコンサルティングを10か月間従事。その後、個人事業主としてマーケティング支援Borderlessを立ち上げた。高校生の探究学習の重要性を感じ、2025年春に探究プログラムやボランティアを紹介するエージェントをスタートさせた。
                  </p>
                  <p className="font-semibold text-gray-900">代表 安井大翔</p>
                </div>
                {/* Photo placeholder */}
                <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">代表写真</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: お問い合わせ */}
      <section id="contact" className="py-24 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">お問い合わせ</h2>
          <p className="text-gray-300 mb-8">ご質問・ご相談はお気軽にご連絡ください。</p>
          <a
            href="mailto:contact@nocsy.me"
            className="inline-block bg-white text-gray-900 px-10 py-4 text-sm font-semibold hover:bg-gray-100 transition-colors"
          >
            contact@nocsy.me
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-6">
        <div className="max-w-6xl mx-auto px-6 text-center text-gray-500 text-sm">
          © 2025 NOCSY
        </div>
      </footer>
    </div>
  )
}
