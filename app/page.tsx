import Link from 'next/link'
import Image from 'next/image'

export default function NOCSYHomePage() {
  return (
    <div className="font-sans text-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/nocsy-logo.png" alt="NOCSY" width={200} height={56} className="object-contain" />
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
          style={{ backgroundImage: `url('/hero.png')` }}
        />
        <div className="absolute inset-0 bg-black/55" />

        {/* Center text */}
        <div className="relative z-10 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold tracking-wider" style={{ fontFamily: 'Georgia, serif' }}>
            No one can stop you.
          </h1>
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
                探究・ボランティアマッチングCaredent
              </h2>
              <p className="text-gray-700 leading-relaxed mb-8">
                「学校」と「社会」の境界をなくし、中高生の主体的な学びを支援する探究マッチングを展開しています。生徒一人ひとりの好奇心を軸に、地域社会や企業での探究活動・ボランティア機会を創出。実社会での質の高い経験は、近年の総合型選抜（旧AO入試）や学校推薦型選択において、自分だけの「志望理由」や「活動実績」を語る強力な武器となります。伴走型のサポートを通じて、大学入試の先まで見据えた、未来を切り拓く力と唯一無二のキャリア形成を後押しします。
              </p>

              <div className="mb-8">
                <img
                  src="/ogp.png"
                  alt="探究・ボランティアマッチングCaredent"
                  className="w-full object-contain"
                />
              </div>

              <Link
                href="/caredent"
                className="inline-block border border-gray-900 text-gray-900 px-8 py-3 text-sm font-medium hover:bg-gray-900 hover:text-white transition-colors"
              >
                Caredentサービスページへ →
              </Link>

              {/* 02 探究イベントの開催 */}
              <div className="mt-20 pt-16 border-t border-gray-200">
                <p className="text-sm text-gray-400 font-mono mb-3">02</p>
                <h2 className="text-2xl md:text-3xl font-bold mb-6 leading-tight">
                  探究イベントの開催
                </h2>
                <p className="text-gray-700 leading-relaxed mb-8">
                  中高生・大学生が実社会の課題に直接触れられる探究イベントを企画・開催しています。地域のお祭りや企業との共創プロジェクトなど、教室の外にある「本物の現場」を舞台に、企画から運営までを学生自身が担う機会を用意。参加者は多様な大人や仲間と関わりながら、自分の関心の輪郭を掴み、次の一歩を見つけていきます。学校・企業・自治体のみなさまとの共催も行っています。
                </p>

                <div className="mb-8">
                  <img
                    src="/services/event.png"
                    alt="探究イベントの開催"
                    className="w-full object-contain"
                  />
                </div>

                <Link
                  href="/event"
                  className="inline-block border border-gray-900 text-gray-900 px-8 py-3 text-sm font-medium hover:bg-gray-900 hover:text-white transition-colors"
                >
                  開催イベント一覧へ →
                </Link>
              </div>

              {/* 03 NOCSY塾 */}
              <div className="mt-20 pt-16 border-t border-gray-200">
                <p className="text-sm text-gray-400 font-mono mb-3">03</p>
                <h2 className="text-2xl md:text-3xl font-bold mb-6 leading-tight">
                  総合型選抜対策専門塾「NOCSY塾」
                </h2>
                <p className="text-gray-700 leading-relaxed mb-8">
                  オンラインで総合型選抜対策を行う専門塾を運営しています。NOCSYが提携するボランティア・探究プログラムを駆使し、志望理由書を書く前の課外活動の段階から手厚くサポートするのが特徴。総合型選抜の実績がある大学生メンターがマンツーマンで指導し、月額1.5万円からの安心低価格で、自分の言葉で語れる合格ストーリーづくりを支援します。
                </p>

                <div className="mb-8">
                  <img
                    src="/nocsy-juku/hero.png"
                    alt="総合型選抜対策専門塾 NOCSY塾"
                    className="w-full object-contain"
                  />
                </div>

                <Link
                  href="/nocsy-juku"
                  className="inline-block border border-gray-900 text-gray-900 px-8 py-3 text-sm font-medium hover:bg-gray-900 hover:text-white transition-colors"
                >
                  NOCSY塾サービスページへ →
                </Link>
              </div>
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
                <img
                  src="/portrait.jpg"
                  alt="代表 安井大翔"
                  className="rounded-lg w-full object-cover object-top"
                />
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
            href="mailto:daito.yasui@nocsy.me"
            className="inline-block bg-white text-gray-900 px-10 py-4 text-sm font-semibold hover:bg-gray-100 transition-colors"
          >
            daito.yasui@nocsy.me
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
