import type { Metadata } from 'next'
import { GREEN, JukuFooter, JukuNav, LineButton, LineCtaSection, NAVY, PALE_GREEN, SectionLabel } from './components'
import CompareMobile from './CompareMobile'
import { findImage } from './find-image'
import ModelCaseSlider from './ModelCaseSlider'

export const metadata: Metadata = {
  title: '総合型選抜対策専門塾 NOCSY塾 | NOCSY',
  description:
    '総合型選抜の準備を、高1から。週1回40分のオンライン個別指導で、課外活動づくりから志望理由書・面接までお子さまに伴走します。高1・2は月額9,800円、高3は月額15,000円。入会金0円・契約期間の縛りなし。',
  openGraph: {
    title: '総合型選抜対策専門塾 NOCSY塾',
    description:
      '週1回40分のオンライン個別指導で、課外活動づくりから志望理由書・面接まで伴走。月額9,800円〜、入会金0円・縛りなし。',
    url: 'https://www.nocsy.me/nocsy-juku',
    siteName: 'NOCSY',
    images: [{ url: '/nocsy-juku/hero.jpg', width: 1200, height: 800, alt: 'NOCSY塾' }],
    locale: 'ja_JP',
    type: 'website',
  },
}

const PROMISES = ['入会金0円', '契約の縛りなし', '毎月の報告書つき']

const WORRIES = [
  '第一志望は学力が足りず、一般選抜では厳しい',
  '勉強は得意ではなく、それ以外での進学方法を探している',
  '一般選抜と並行して総合型の対策をしたいけど、塾費用が高い',
  '部活動や学校が忙しく、通塾や勉強の時間が取れない',
]

const PLANS = [
  {
    grade: '高校1・2年生',
    name: '課外活動をつくるプラン',
    price: '9,800',
    items: [
      '週1回40分のマンツーマン指導（オンライン）',
      '提携10団体のボランティア・探究プログラムの紹介と申込サポート',
      '自分で企画するイベントの壁打ち（企画から当日の準備まで）',
      'マルシェ出展のサポート（出店先の紹介・ブースの相談・ふり返り）',
      '活動のふり返りと記録づくり',
    ],
  },
  {
    grade: '高校3年生',
    name: '出願対策プラン',
    price: '15,000',
    items: [
      '週1回40分のマンツーマン指導（オンライン）',
      '志望理由書の添削 月2回まで（3回目以降は1回3,000円）',
      '面接練習',
      '出願までに必要な活動の紹介と壁打ち',
    ],
  },
]

const COMMON = [
  { title: '入会金0円', body: 'かかるのは月謝だけ' },
  { title: 'いつでも解約OK', body: '最低契約期間なし' },
  { title: '毎月の報告書', body: '保護者さまへ月1回' },
  { title: '自宅から受講', body: 'Google Meetを使用' },
]

const MODEL_CASE = [
  {
    period: '1か月目',
    start: 1,
    end: 1,
    title: '興味を整理する',
    body: '面談で、好きなこと・気になることを洗い出す',
    image: '/nocsy-juku/detail-step5.jpg',
  },
  {
    period: '2〜3か月目',
    start: 2,
    end: 3,
    title: '社会に出てみる',
    body: '提携団体のボランティアや探究プログラムに参加',
    image: '/nocsy-juku/detail-step1.jpg',
  },
  {
    period: '4〜6か月目',
    start: 4,
    end: 6,
    title: 'テーマを見つける',
    body: '活動をふり返り、深めたいテーマを決める',
    image: '/nocsy-juku/detail-step4.jpg',
  },
  {
    period: '7〜10か月目',
    start: 7,
    end: 10,
    title: '自分で動く',
    body: 'マルシェ出展や自主イベントを企画して挑戦',
    image: '/nocsy-juku/detail-step3.jpg',
  },
  {
    period: '11〜12か月目',
    start: 11,
    end: 12,
    title: '記録にまとめる',
    body: '1年の経験を、言葉と記録に残す',
    image: '/nocsy-juku/detail-step2.png',
    // 文字の多いスクリーンショットなので、重ねる文字が読めるよう暗く・ぼかす
    busyBackground: true,
  },
]

const COMPARE_IMAGE = findImage('/nocsy-juku/price-comparison')

const COMPETITORS = ['A塾', 'B塾', 'C塾']

const COMPARE = [
  {
    label: '月額',
    nocsy: '9,800円〜',
    note: '安価で一般入試対策と並行して通いやすい',
    highlight: true,
    others: ['4.4万円〜', '4.4万円〜', '3.98万円〜'],
  },
  {
    label: '入会金',
    nocsy: '0円',
    highlight: true,
    others: ['5.5万円', '3.3万〜4.5万円', '2.95万円'],
  },
  {
    label: '課外活動のサポート',
    nocsy: '高1・高2からボランティアや探究プログラムなど課外活動を手厚くサポート',
    others: ['探究活動の設計・実行をサポート', '起業や学生団体立ち上げ支援などレベルが高い', 'リサーチや論文の執筆など学問的なサポート'],
  },
  {
    label: '講師',
    nocsy: '多くが実際に総合型選抜を通過した大学生メンター',
    others: ['メンターの80%が総合型選抜を突破した大学生', '難関大の推薦で合格した現役大学生', '大学教員やコンサルタントなど社会人プロ'],
  },
]

const MENTORS = [
  {
    name: '安井大翔',
    title: '近畿大学総合社会学部1年',
    body: '高校時代から地域のボランティアやプログラムに参加し、地方創生を中心に活動。同じく高校時代に地域観光のマーケティング会社でインターンした実績あり。内部の総合型選抜入試で近畿大学総合社会学部環境・まちづくり系専攻に進学した。',
    photo: '/nocsy-juku/mentors/yasui.jpg',
  },
]

const FAQS = [
  {
    q: '何年生から始められますか？',
    a: '高校1年生から3年生まで受講できます。高3から始める場合は、4〜5月ごろまでに始めると、出願までに活動の時間を確保しやすくなります。',
  },
  {
    q: 'まだやりたいことが決まっていなくても大丈夫ですか？',
    a: 'はい、大丈夫です。最初の面談で好きなことや気になることを一緒に整理し、そこから参加する活動を決めていきます。',
  },
  {
    q: '部活が忙しくても続けられますか？',
    a: '指導は週1回40分、Google Meetを使ったオンラインなので、移動の時間がかかりません。',
  },
  {
    q: '途中でやめることはできますか？',
    a: '最低契約期間はなく、いつでも解約できます。入会金もかかりません。',
  },
  {
    q: '志望理由書の添削は何回までですか？',
    a: '高3の出願対策プランでは、月2回までの添削が含まれています。3回目以降は1回3,000円で追加できます。',
  },
  {
    q: '保護者への報告はありますか？',
    a: '月に1回、取り組んだ内容と次の予定をまとめた報告書をお送りします。',
  },
]

export default function NocsyJukuPage() {
  return (
    <div className="font-sans" style={{ color: NAVY }}>
      <JukuNav />

      {/* ===== ファーストビュー（スマホで開いた瞬間にLINEボタンまで見えるよう、画像下の文字は最小限にする） ===== */}
      <section className="pt-[60px]" style={{ backgroundColor: NAVY }}>
        <img
          src="/nocsy-juku/hero.jpg"
          srcSet="/nocsy-juku/hero.jpg 1200w, /nocsy-juku/hero-lp.jpg 1920w"
          sizes="100vw"
          alt="総合型選抜対策専門塾 NOCSY塾 — マンツーマンで課外活動からサポート、総合型選抜経験のある大学生メンターがリアルな指導、月額9,800円〜の安心低価格"
          width={1920}
          height={1280}
          fetchPriority="high"
          className="w-full h-auto"
        />
        <div className="max-w-3xl mx-auto px-6 pt-5 pb-6 md:py-12 text-center text-white">
          <h1 className="text-[1.35rem] md:text-4xl font-bold leading-snug mb-2 md:mb-4">
            総合型選抜の準備を、
            <br className="hidden md:inline" />
            高1から。
          </h1>
          <p className="mb-1.5 md:mb-3">
            <span className="text-sm text-white/80 mr-2">月額</span>
            <span className="text-[2.2rem] md:text-6xl font-bold leading-none" style={{ color: GREEN }}>
              9,800
            </span>
            <span className="text-lg md:text-xl font-bold ml-1">円〜</span>
          </p>
          <ul className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-xs md:text-sm font-bold text-white/90 mb-4 md:mb-8">
            {PROMISES.map((p) => (
              <li key={p} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: GREEN }} />
                {p}
              </li>
            ))}
          </ul>
          <LineButton position="hero" label="LINEで無料相談する" large />
        </div>
      </section>

      {/* ===== 保護者のお悩み ===== */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <SectionLabel en="WORRIES" ja="こんなお悩みはありませんか？" />
          <ul className="space-y-3">
            {WORRIES.map((w) => (
              <li
                key={w}
                className="flex items-start gap-3 px-5 py-4 rounded-lg font-bold leading-relaxed"
                style={{ backgroundColor: PALE_GREEN }}
              >
                <span className="mt-[0.6em] w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: GREEN }} />
                {w}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ===== プランと料金 ===== */}
      <section id="plans" className="py-16 md:py-24" style={{ backgroundColor: PALE_GREEN }}>
        <div className="max-w-5xl mx-auto px-6">
          <SectionLabel en="PLANS" ja="学年に合わせた2つのプラン" />

          <div className="grid md:grid-cols-2 gap-5 mb-10">
            {PLANS.map((plan) => (
              <div key={plan.name} className="bg-white rounded-xl p-6 md:p-8">
                <p className="text-sm font-bold mb-1" style={{ color: GREEN }}>
                  {plan.grade}
                </p>
                <p className="text-xl font-bold mb-4">{plan.name}</p>
                <p className="pb-5 mb-5 border-b" style={{ borderColor: `${NAVY}1A` }}>
                  <span className="text-sm mr-1">月額</span>
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="font-bold ml-1">円</span>
                </p>
                <ul className="space-y-2.5">
                  {plan.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm leading-relaxed">
                      <span className="mt-[0.55em] w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: GREEN }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="text-center text-sm font-bold mb-4">どちらのプランにも含まれます</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {COMMON.map((c) => (
              <div key={c.title} className="bg-white rounded-lg p-4 text-center">
                <p className="font-bold mb-1">{c.title}</p>
                <p className="text-xs" style={{ color: `${NAVY}B3` }}>
                  {c.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 高1・2の1年間 ===== */}
      <section id="model" className="py-16 md:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <SectionLabel en="MODEL CASE" ja="高1から始めた場合の1年間" lead="課外活動をつくるプランの一例です。" />
        </div>

        <ModelCaseSlider phases={MODEL_CASE} />

        <div className="max-w-3xl mx-auto px-6">
          <p className="mt-3 text-center text-xs" style={{ color: `${NAVY}99` }}>
            写真をタップ・スワイプすると次の時期に進みます
          </p>

          <div className="mt-8 rounded-xl p-6 md:p-8 text-center text-white" style={{ backgroundColor: NAVY }}>
            <p className="text-sm font-bold mb-2" style={{ color: GREEN }}>
              高3の春には
            </p>
            <p className="font-bold text-lg leading-relaxed">
              志望理由書に書ける経験と、その記録がそろった状態で出願準備をスタートできます。
            </p>
          </div>


          <div className="mt-10 text-center">
            <LineButton position="middle" label="LINEで無料相談する" large />
          </div>
        </div>
      </section>

      {/* ===== 他塾との比較 ===== */}
      <section id="compare" className="py-16 md:py-24" style={{ backgroundColor: PALE_GREEN }}>
        <div className="max-w-3xl mx-auto px-6">
          <SectionLabel en="COMPARE" ja="他の総合型選抜専門塾との比較" />

          {COMPARE_IMAGE && (
            <img
              src={COMPARE_IMAGE}
              alt="NOCSY塾と他の総合型選抜専門塾の比較表"
              loading="lazy"
              decoding="async"
              className="hidden md:block w-full h-auto rounded-xl bg-white"
            />
          )}

          {/* スマホでは横長の比較表画像の文字が小さすぎて読めないため、2列の表で見せる */}
          <div className={COMPARE_IMAGE ? 'md:hidden' : ''}>
            <CompareMobile competitors={COMPETITORS} rows={COMPARE} />
          </div>
          <p className="mt-3 text-xs text-right" style={{ color: `${NAVY}80` }}>
            ※ 各社の公開情報をもとに作成
          </p>

          <div className="mt-10">
            <p className="font-bold mb-3">なぜこの価格でできるのか</p>
            <p className="text-sm leading-relaxed" style={{ color: `${NAVY}B3` }}>
              校舎を持たずオンラインで指導することで固定費を抑え、いまは利益よりも支援の実績づくりを優先しているためです。
            </p>
          </div>
        </div>
      </section>

      {/* ===== メンターと運営 ===== */}
      <section id="mentors" className="py-16 md:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <SectionLabel
            en="MENTORS"
            ja="指導するメンター"
            lead="実際に総合型選抜を経験した大学生メンターが、マンツーマンで担当します。"
          />

          {MENTORS.map((m) => (
            <div key={m.name} className="md:flex gap-8 items-start mb-10">
              <img
                src={m.photo}
                alt={m.name}
                width={2752}
                height={2752}
                loading="lazy"
                decoding="async"
                className="w-40 h-40 md:w-48 md:h-48 object-cover rounded-full mx-auto md:mx-0 mb-5 md:mb-0 flex-shrink-0"
              />
              <div>
                <p className="text-xs font-bold mb-1" style={{ color: GREEN }}>
                  {m.title}
                </p>
                <p className="text-xl font-bold mb-3">{m.name}</p>
                <p className="text-sm leading-relaxed" style={{ color: `${NAVY}B3` }}>
                  {m.body}
                </p>
              </div>
            </div>
          ))}

          <div className="rounded-xl p-6" style={{ backgroundColor: PALE_GREEN }}>
            <p className="text-sm font-bold mb-3">運営会社</p>
            <dl className="text-sm leading-relaxed space-y-1" style={{ color: `${NAVY}B3` }}>
              <div className="flex gap-4">
                <dt className="w-16 flex-shrink-0">会社名</dt>
                <dd>株式会社NOCSY</dd>
              </div>
              <div className="flex gap-4">
                <dt className="w-16 flex-shrink-0">代表</dt>
                <dd>代表取締役 安井大翔</dd>
              </div>
              <div className="flex gap-4">
                <dt className="w-16 flex-shrink-0">所在地</dt>
                <dd>大阪府堺市北区長曽根町130番地42（さかい新事業創造センター内）</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* ===== よくある質問 ===== */}
      <section id="faq" className="py-16 md:py-24" style={{ backgroundColor: PALE_GREEN }}>
        <div className="max-w-3xl mx-auto px-6">
          <SectionLabel en="FAQ" ja="よくある質問" />
          <div className="space-y-3">
            {FAQS.map((f) => (
              <details key={f.q} className="group bg-white rounded-lg px-5">
                <summary className="flex items-start gap-3 py-5 cursor-pointer list-none font-bold leading-relaxed">
                  <span style={{ color: GREEN }}>Q.</span>
                  <span className="flex-1">{f.q}</span>
                  <span className="text-xl leading-none transition-transform group-open:rotate-45" style={{ color: GREEN }}>
                    +
                  </span>
                </summary>
                <p className="flex gap-3 pb-5 text-sm leading-relaxed" style={{ color: `${NAVY}B3` }}>
                  <span className="font-bold" style={{ color: NAVY }}>
                    A.
                  </span>
                  <span className="flex-1">{f.a}</span>
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <LineCtaSection position="bottom" />

      <JukuFooter />
    </div>
  )
}
