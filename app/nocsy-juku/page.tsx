import type { Metadata } from 'next'
import Link from 'next/link'
import { GREEN, JukuFooter, JukuNav, LineButton, LineCtaSection, NAVY, PALE_GREEN, SectionLabel } from './components'

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
    images: [{ url: '/nocsy-juku/hero-photo.jpg', width: 1260, height: 570, alt: 'NOCSY塾' }],
    locale: 'ja_JP',
    type: 'website',
  },
}

const PROMISES = ['入会金0円', '契約期間の縛りなし', '毎月の報告書つき']

const WORRIES = [
  '総合型選抜に興味はあるけれど、何から始めればいいかわからない',
  '子どもに「やりたいこと」がまだ見つかっていない',
  '専門塾は月4万円以上かかると聞いて、迷っている',
  '部活や学校が忙しく、通塾の時間がとれない',
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
  { period: '1か月目', title: '興味を整理する', body: '面談で、好きなこと・気になることを洗い出す' },
  { period: '2〜3か月目', title: '社会に出てみる', body: '提携団体のボランティアや探究プログラムに参加' },
  { period: '4〜6か月目', title: 'テーマを見つける', body: '活動をふり返り、深めたいテーマを決める' },
  { period: '7〜10か月目', title: '自分で動く', body: 'マルシェ出展や自主イベントを企画して挑戦' },
  { period: '11〜12か月目', title: '記録にまとめる', body: '1年の経験を、言葉と記録に残す' },
]

const COMPARE = {
  columns: ['NOCSY塾', 'A塾', 'B塾', 'C塾'],
  rows: [
    { label: '月額', values: ['9,800円〜', '4.4万円〜', '4.4万円〜', '3.98万円〜'] },
    { label: '入会金', values: ['0円', '5.5万円', '3.3万〜4.5万円', '2.95万円'] },
  ],
}

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

      {/* ===== ファーストビュー ===== */}
      <section className="pt-[60px]">
        <img
          src="/nocsy-juku/hero-photo.jpg"
          alt="総合型選抜対策専門塾 NOCSY塾で学ぶ高校生"
          width={1260}
          height={570}
          fetchPriority="high"
          className="w-full h-auto max-h-[480px] object-cover"
        />
        <div className="text-white" style={{ backgroundColor: NAVY }}>
          <div className="max-w-3xl mx-auto px-6 py-12 md:py-16 text-center">
            <p className="text-xs md:text-sm font-bold tracking-[0.3em] mb-4" style={{ color: GREEN }}>
              総合型選抜対策専門塾 NOCSY塾
            </p>
            <h1 className="text-[1.7rem] md:text-4xl font-bold leading-snug mb-5">
              総合型選抜の準備を、
              <br />
              高1から。
            </h1>
            <p className="text-white/85 leading-relaxed mb-8">
              週1回40分のオンライン個別指導で、課外活動づくりから志望理由書・面接まで、お子さまに伴走します。
            </p>
            <p className="mb-6">
              <span className="text-sm text-white/80 mr-2">月額</span>
              <span className="text-5xl md:text-6xl font-bold" style={{ color: GREEN }}>
                9,800
              </span>
              <span className="text-xl font-bold ml-1">円〜</span>
            </p>
            <ul className="flex flex-wrap justify-center gap-2 mb-10">
              {PROMISES.map((p) => (
                <li key={p} className="text-sm font-bold px-3 py-1.5 border border-white/40">
                  {p}
                </li>
              ))}
            </ul>
            <LineButton position="hero" label="LINEで無料相談する" large />
            <p className="mt-4 text-xs text-white/70">友だち追加で、活動例をまとめた資料をお送りします</p>
          </div>
        </div>
      </section>

      {/* ===== 保護者のお悩み ===== */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <SectionLabel en="WORRIES" ja="こんなお悩みはありませんか？" />
          <ul className="border-t" style={{ borderColor: `${NAVY}1A` }}>
            {WORRIES.map((w) => (
              <li
                key={w}
                className="flex items-start gap-4 py-4 border-b font-bold leading-relaxed"
                style={{ borderColor: `${NAVY}1A` }}
              >
                <span className="mt-[0.55em] w-2 h-2 flex-shrink-0" style={{ backgroundColor: GREEN }} />
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

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {PLANS.map((plan) => (
              <div key={plan.name} className="bg-white border" style={{ borderColor: `${NAVY}1A` }}>
                <div className="px-6 py-4 text-white" style={{ backgroundColor: NAVY }}>
                  <p className="text-xs font-bold tracking-widest" style={{ color: GREEN }}>
                    {plan.grade}
                  </p>
                  <p className="text-lg font-bold">{plan.name}</p>
                </div>
                <div className="p-6">
                  <p className="mb-5">
                    <span className="text-sm mr-1">月額</span>
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="font-bold ml-1">円</span>
                  </p>
                  <ul className="space-y-2.5">
                    {plan.items.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm leading-relaxed">
                        <span className="mt-[0.5em] w-1.5 h-1.5 flex-shrink-0" style={{ backgroundColor: GREEN }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-sm font-bold mb-4">どちらのプランにも含まれます</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px" style={{ backgroundColor: `${NAVY}1A` }}>
            {COMMON.map((c) => (
              <div key={c.title} className="bg-white p-5">
                <p className="font-bold mb-1.5">{c.title}</p>
                <p className="text-xs leading-relaxed" style={{ color: `${NAVY}B3` }}>
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
          <SectionLabel
            en="MODEL CASE"
            ja="高1から始めた場合の1年間"
            lead="課外活動をつくるプランの一例です。"
          />

          <ol className="border-t" style={{ borderColor: `${NAVY}1A` }}>
            {MODEL_CASE.map((m) => (
              <li
                key={m.period}
                className="py-6 border-b md:flex md:gap-8"
                style={{ borderColor: `${NAVY}1A` }}
              >
                <p className="md:w-32 flex-shrink-0 mb-2 md:mb-0">
                  <span
                    className="inline-block text-sm font-bold text-white px-3 py-1"
                    style={{ backgroundColor: NAVY }}
                  >
                    {m.period}
                  </span>
                </p>
                <div>
                  <p className="font-bold text-lg mb-1">{m.title}</p>
                  <p className="text-sm leading-relaxed" style={{ color: `${NAVY}B3` }}>
                    {m.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-8 p-6 md:p-8 text-center text-white" style={{ backgroundColor: NAVY }}>
            <p className="text-xs font-bold tracking-widest mb-2" style={{ color: GREEN }}>
              高3の春には
            </p>
            <p className="font-bold text-lg leading-relaxed">
              志望理由書に書ける経験と、その記録がそろった状態で出願準備をスタートできます。
            </p>
          </div>


          <div className="mt-10 text-center">
            <LineButton position="middle" label="LINEで無料相談する" large />
            <div className="mt-6">
              <Link href="/nocsy-juku/detail" className="text-sm underline underline-offset-4 hover:opacity-60">
                NOCSY塾の5つのステップを詳しく見る
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 他塾との比較 ===== */}
      <section id="compare" className="py-16 md:py-24" style={{ backgroundColor: PALE_GREEN }}>
        <div className="max-w-3xl mx-auto px-6">
          <SectionLabel en="COMPARE" ja="他の専門塾との料金比較" />

          <div>
            <table className="w-full table-fixed bg-white text-center text-xs sm:text-sm border-collapse">
              <thead>
                <tr>
                  <th className="w-[18%] p-2 sm:p-3 border" style={{ borderColor: `${NAVY}1A` }} />
                  {COMPARE.columns.map((col, i) => (
                    <th
                      key={col}
                      className="p-2 sm:p-3 border font-bold"
                      style={
                        i === 0
                          ? { backgroundColor: NAVY, color: '#FFFFFF', borderColor: NAVY }
                          : { borderColor: `${NAVY}1A` }
                      }
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE.rows.map((row) => (
                  <tr key={row.label}>
                    <th className="p-2 sm:p-3 border font-normal text-xs" style={{ borderColor: `${NAVY}1A`, color: `${NAVY}B3` }}>
                      {row.label}
                    </th>
                    {row.values.map((v, i) => (
                      <td
                        key={i}
                        className={`px-1 py-3 sm:p-3 border leading-snug ${i === 0 ? 'font-bold text-sm sm:text-base' : ''}`}
                        style={
                          i === 0
                            ? { backgroundColor: NAVY, color: GREEN, borderColor: NAVY }
                            : { borderColor: `${NAVY}1A` }
                        }
                      >
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-right" style={{ color: `${NAVY}80` }}>
            ※ 各社の公開情報をもとに作成
          </p>

          <div className="mt-10 bg-white p-6 md:p-8">
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
                className="w-40 h-40 md:w-48 md:h-48 object-cover mx-auto md:mx-0 mb-5 md:mb-0 flex-shrink-0"
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

          <div className="border-t pt-8" style={{ borderColor: `${NAVY}1A` }}>
            <p className="text-sm font-bold mb-3">運営会社</p>
            <dl className="text-sm leading-relaxed space-y-1" style={{ color: `${NAVY}B3` }}>
              <div className="flex gap-4">
                <dt className="w-20 flex-shrink-0">会社名</dt>
                <dd>株式会社NOCSY</dd>
              </div>
              <div className="flex gap-4">
                <dt className="w-20 flex-shrink-0">代表</dt>
                <dd>代表取締役 安井大翔</dd>
              </div>
              <div className="flex gap-4">
                <dt className="w-20 flex-shrink-0">所在地</dt>
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
          <div className="bg-white border-t" style={{ borderColor: `${NAVY}1A` }}>
            {FAQS.map((f) => (
              <details key={f.q} className="group border-b px-5" style={{ borderColor: `${NAVY}1A` }}>
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
