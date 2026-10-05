import type { Metadata } from 'next'
import Link from 'next/link'
import { DocumentRequestSection, GREEN, JukuFooter, JukuNav, NAVY } from '../components'

export const metadata: Metadata = {
  title: 'プログラム内容 | 総合型選抜対策専門塾 NOCSY塾',
  description:
    'NOCSY塾のプログラム内容。興味を広げる、自分の軸を見つける、軸を深掘りする、社会に実装する、言語化して未来へつなげる——高校1年生から3年生までの5つのステップで総合型選抜まで伴走します。',
  openGraph: {
    title: 'プログラム内容 | NOCSY塾',
    description: '高校1年生から3年生までの5つのステップで、総合型選抜まで伴走します。',
    url: 'https://www.nocsy.me/nocsy-juku/detail',
    siteName: 'NOCSY',
    images: [{ url: '/nocsy-juku/program.jpg', width: 1672, height: 941, alt: '総合型選抜までのロードマップ' }],
    locale: 'ja_JP',
    type: 'website',
  },
}

const STEPS = [
  {
    num: '01',
    image: '/nocsy-juku/detail-step1.jpg',
    imageWidth: 1400,
    imageHeight: 1050,
    imageAlt: '提携先のイベントで子どもたちと活動する学生',
    grade: '高校1年生',
    title: '興味を広げる',
    catch: 'いろんな「好き」や「やってみたい」に出会う',
    body: 'NOCSYが提携するボランティアや探究プログラム、イベントに参加し、教室の外にある社会に触れていきます。まだ自分が知らない分野にも飛び込みながら、「好き」や「やってみたい」の候補をたくさん見つける段階です。',
  },
  {
    num: '02',
    image: '/nocsy-juku/detail-step2.png',
    imageWidth: 1400,
    imageHeight: 961,
    imageAlt: '参加した活動を記録するマイポートフォリオの画面',
    grade: '高校1年生',
    title: '自分の軸を見つける',
    catch: '経験を振り返り、自分は何に惹かれるのかを知る',
    body: '参加した活動をメンターと一緒に振り返り、どんな場面で心が動いたのか、何に惹かれたのかを独自の分析ツールを使いながら言葉にしていきます。たくさんの経験の中から、自分の関心の「軸」を見つけます。',
  },
  {
    num: '03',
    image: '/nocsy-juku/detail-step3.jpg',
    imageWidth: 1200,
    imageHeight: 899,
    imageAlt: 'テーマに本気で取り組む学生',
    grade: '高校2年生',
    title: '軸を深掘りする',
    catch: '興味をもとにテーマを絞り、本気で取り組む',
    body: '見えてきた軸をもとに探究テーマを絞り込み、軸に沿ったプログラムへの参加や調査、フィールドワークを通じて、自分の問いに本気で取り組みます。表面的な興味を、自分の言葉で語れる問いへと深めていきます。',
  },
  {
    num: '04',
    image: '/nocsy-juku/detail-step4.jpg',
    imageWidth: 1166,
    imageHeight: 1009,
    imageAlt: '社会の現場で活動した学生たちの集合写真',
    grade: '高校2年生',
    title: '社会に実装する',
    catch: '自分で考え、行動し、実際の社会で試す',
    body: '深めたテーマをもとに自分で企画を考え、実際の社会の現場で試します。地域や企業、団体の大人と関わりながら行動し、うまくいったこともいかなかったことも分析し、次の問いにつなげます。',
  },
  {
    num: '05',
    image: '/nocsy-juku/detail-step5.jpg',
    imageWidth: 1400,
    imageHeight: 933,
    imageAlt: 'メンターと一緒に志望理由を言語化する高校生',
    grade: '高校3年生',
    title: '言語化して未来へつなげる',
    catch: '経験を言葉にし、総合型選抜で伝えられる形にする',
    body: 'これまでの経験を整理し、志望理由書や面接で伝えられる形に言語化します。総合型選抜を突破したメンターがマンツーマンで、出願書類の作成から面接対策まで伴走します。',
  },
]

export default function NocsyJukuDetailPage() {
  return (
    <div className="font-sans" style={{ color: NAVY }}>
      <JukuNav />

      {/* ===== 5つのステップ ===== */}
      <section className="pt-[124px] pb-20 md:pt-[140px] md:pb-28 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-bold tracking-[0.3em] mb-3" style={{ color: GREEN }}>5 STEPS</p>
            <h1 className="text-2xl md:text-3xl font-bold">NOCSY塾の5つのステップ</h1>
          </div>

          <div className="border-t" style={{ borderColor: `${NAVY}1A` }}>
            {STEPS.map((step) => (
              <div
                key={step.num}
                className="py-10 md:py-12 border-b md:flex md:gap-10"
                style={{ borderColor: `${NAVY}1A` }}
              >
                <div className="md:w-28 flex-shrink-0 mb-4 md:mb-0">
                  <p className="font-mono font-bold text-4xl md:text-5xl leading-none" style={{ color: GREEN }}>
                    {step.num}
                  </p>
                  <p
                    className="inline-block mt-4 text-sm font-bold tracking-wider text-white px-3 py-1.5"
                    style={{ backgroundColor: NAVY }}
                  >
                    {step.grade}
                  </p>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl font-bold mb-2">{step.title}</h3>
                  <p className="font-bold text-sm mb-5" style={{ color: GREEN }}>{step.catch}</p>
                  <img
                    src={step.image}
                    alt={step.imageAlt}
                    width={step.imageWidth}
                    height={step.imageHeight}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-auto border mb-5"
                    style={{ borderColor: `${NAVY}1A` }}
                  />
                  <p className="leading-relaxed" style={{ color: `${NAVY}B3` }}>{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <DocumentRequestSection>
        <div className="mt-10">
          <Link href="/nocsy-juku" className="text-sm underline underline-offset-4 hover:opacity-60 transition-opacity">
            NOCSY塾のトップへ戻る
          </Link>
        </div>
      </DocumentRequestSection>

      <JukuFooter />
    </div>
  )
}
