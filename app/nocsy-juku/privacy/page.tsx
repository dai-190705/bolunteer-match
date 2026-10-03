import type { Metadata } from 'next'
import { GREEN, JukuFooter, JukuNav, NAVY } from '../components'

export const metadata: Metadata = {
  title: 'プライバシーポリシー（資料請求） | 総合型選抜対策専門塾 NOCSY塾',
  description: 'NOCSY塾の資料請求フォームでお預かりする個人情報の取り扱いについて。',
  robots: { index: false },
}

const SECTIONS: { title: string; body?: string[]; list?: string[]; after?: string[] }[] = [
  {
    title: '1. 取得する情報',
    body: ['当社は、NOCSY塾の資料請求フォーム（以下「本フォーム」）を通じて、以下の情報を取得します。'],
    list: [
      '氏名',
      'メールアドレス',
      '電話番号',
      '学年、在籍する学校名',
      '保護者の方の氏名・連絡先（ご入力いただいた場合）',
      'その他、本フォームにご入力いただいた内容',
    ],
  },
  {
    title: '2. 利用目的',
    body: ['当社は、取得した情報を以下の目的で利用します。'],
    list: [
      'ご請求いただいた資料をお届けするため',
      'NOCSY塾の入塾・体験・キャンペーン・説明会等に関するご案内を、電話・メール・SMS・LINE等でご連絡するため',
      'ご入力いただいた内容に基づき、学年や状況に合わせたご提案を行うため',
      'お問い合わせに対応するため',
      '個人を特定できない形に加工した統計データを作成し、サービスの改善に役立てるため',
    ],
    after: ['当社は、上記の目的の範囲を超えて、取得した情報を利用することはありません。'],
  },
  {
    title: '3. ご案内の停止',
    body: [
      '当社からの電話・メール等によるご案内が不要な場合は、いつでも末尾のお問い合わせ先、または当社からの連絡に対する返信にてお申し出ください。お申し出をいただいた後は、速やかにご案内を停止します。',
    ],
  },
  {
    title: '4. 未成年の方の個人情報について',
    body: [
      '18歳未満の方が本フォームをご利用になる場合は、必ず保護者の方の同意を得たうえでご入力ください。18歳未満の方からご入力があった場合、当社は保護者の方の同意を得たものとみなします。',
    ],
  },
  {
    title: '5. 第三者提供',
    body: [
      '当社は、取得した個人情報を、あらかじめご本人の同意を得ることなく第三者に提供しません。ただし、次の場合を除きます。',
    ],
    list: [
      '法令に基づく場合',
      '人の生命、身体または財産の保護のために必要があり、ご本人の同意を得ることが困難である場合',
      '利用目的の達成に必要な範囲内で、個人情報の取扱いの全部または一部を委託する場合',
      '合併その他の事由による事業の承継に伴って提供する場合',
    ],
  },
  {
    title: '6. 外部サービスの利用',
    body: [
      '本フォームは、Google LLC（米国）が提供する「Googleフォーム」を利用しており、ご入力いただいた情報は同社のサーバーに保存されます。同社における個人情報の取り扱いについては、同社のプライバシーポリシーをご確認ください。',
    ],
  },
  {
    title: '7. 安全管理措置',
    body: [
      '当社は、取得した個人情報の漏えい、滅失または毀損を防止するため、閲覧できる担当者の限定、アクセス権限の管理、パスワードによる保護など、必要かつ適切な安全管理措置を講じます。',
    ],
  },
  {
    title: '8. 保存期間',
    body: [
      '当社は、利用目的の達成に必要な期間に限り個人情報を保存し、不要となった場合、またはご本人から削除のお申し出があった場合は、遅滞なく削除します。',
    ],
  },
  {
    title: '9. 開示・訂正・利用停止・削除のご請求',
    body: [
      'ご本人またはその保護者の方から、個人情報の開示、訂正、利用停止、削除のご請求があった場合は、ご本人であることを確認したうえで、法令に従い速やかに対応します。ご請求は末尾のお問い合わせ先までご連絡ください。',
    ],
  },
  {
    title: '10. プライバシーポリシーの変更',
    body: [
      '当社は、必要に応じて本ポリシーの内容を変更することがあります。変更後の内容は、本ページに掲載した時点から効力を生じるものとします。',
    ],
  },
]

export default function NocsyJukuPrivacyPage() {
  return (
    <div className="font-sans" style={{ color: NAVY }}>
      <JukuNav />

      <main className="pt-[124px] pb-20 md:pt-[140px] md:pb-28 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-bold tracking-[0.3em] mb-3" style={{ color: GREEN }}>PRIVACY POLICY</p>
            <h1 className="text-2xl md:text-3xl font-bold leading-snug">
              プライバシーポリシー<br />
              <span className="text-base md:text-lg">（NOCSY塾 資料請求）</span>
            </h1>
          </div>

          <p className="leading-relaxed mb-12" style={{ color: `${NAVY}B3` }}>
            株式会社NOCSY（以下「当社」）は、総合型選抜対策専門塾「NOCSY塾」の資料請求にあたってお預かりする個人情報を、個人情報の保護に関する法律その他の関係法令を遵守し、以下のとおり適切に取り扱います。
          </p>

          <div className="space-y-10">
            {SECTIONS.map((section) => (
              <section key={section.title}>
                <h2 className="font-bold text-lg mb-3 pb-2 border-b" style={{ borderColor: `${GREEN}66` }}>
                  {section.title}
                </h2>
                <div className="space-y-3 leading-relaxed" style={{ color: `${NAVY}CC` }}>
                  {section.body?.map((p) => <p key={p}>{p}</p>)}
                  {section.list && (
                    <ul className="list-disc pl-6 space-y-1.5">
                      {section.list.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                  {section.after?.map((p) => <p key={p}>{p}</p>)}
                </div>
              </section>
            ))}

            <section>
              <h2 className="font-bold text-lg mb-3 pb-2 border-b" style={{ borderColor: `${GREEN}66` }}>
                11. お問い合わせ先
              </h2>
              <div className="leading-relaxed space-y-1" style={{ color: `${NAVY}CC` }}>
                <p>株式会社NOCSY　個人情報お問い合わせ窓口</p>
                <p>〒591-8025 大阪府堺市北区長曽根町130番地42（さかい新事業創造センター内）</p>
                <p>代表取締役　安井大翔</p>
                <p>
                  e-mail：
                  <a href="mailto:info@nocsy.me" className="underline underline-offset-4 hover:opacity-60">
                    info@nocsy.me
                  </a>
                </p>
              </div>
            </section>
          </div>

          <p className="mt-14 text-sm text-right" style={{ color: `${NAVY}99` }}>2026年10月03日 制定</p>
        </div>
      </main>

      <JukuFooter />
    </div>
  )
}
