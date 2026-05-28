'use client'

import { useState } from 'react'
import Link from 'next/link'
import { submitPublisherApplication } from './actions'

const ORG_TYPES = [
  '企業（株式会社・合同会社・個人事業主など）',
  '非営利団体・任意団体（NPO・一般社団法人・学生団体・サークルなど）',
  '行政・公的機関（自治体・社会福祉協議会・外郭団体など）',
  '教育・医療・福祉機関（学校・病院・社会福祉法人など）',
] as const

const ORG_CATEGORIES: Record<string, string[]> = {
  '医療・福祉・健康': [
    '医療・保健（病院・クリニック・薬局・看護）',
    '介護・福祉（高齢者福祉・障がい者支援・児童福祉・子ども食堂）',
    '健康・スポーツ（フィットネス・スポーツチーム・メンタルケア）',
  ],
  '教育・子ども・子育て': [
    '学校・学習支援（学校・塾・フリースクール・学童保育）',
    '幼児教育・子育て支援（保育園・幼稚園・育児コミュニティ）',
    '教育サービス・教材開発（エドテック・体験型イベント企画）',
  ],
  'IT・情報・メディア': [
    'IT・ソフトウェア・AI（アプリ開発・Web制作・システム開発・AI活用）',
    'メディア・出版・広告（ローカルメディア・SNSマーケティング・映像制作）',
    'デザイン・クリエイティブ（グラフィック・イラスト・ゲーム・ものづくり）',
  ],
  'まちづくり・地域活性・観光': [
    '地域活性・コミュニティ（まちづくり協議会・移住支援・商店街活性）',
    '観光・旅行・インバウンド（ゲストハウス・観光協会・地域ツアー企画）',
    'イベント・レジャー（地域のお祭り・アートフェス・文化イベント）',
  ],
  '環境・農業・一次産業': [
    '農業・林業・水産業（地方農家・六次産業化・伝統的漁業）',
    '環境保全・エコ（里山再生・ゴミ拾いイベント・気候変動対策・動物愛護）',
    '食・フード（オーガニック食材・フードロス削減・地域食堂）',
  ],
  'ビジネス・ものづくり・専門サービス': [
    'メーカー・製造業（地場産業・町工場・伝統工芸・製品開発）',
    '小売・流通・飲食（セレクトショップ・カフェ経営）',
    '専門サービス・起業支援（コンサルティング・スタートアップ支援・士業）',
  ],
  '国際・人権・社会貢献': [
    '国際協力・多文化共生（NGO・海外支援・在住外国人サポート）',
    '人権・ジェンダー・多様性（ジェンダー平等・ひきこもり支援・就労支援）',
  ],
}

const ORG_CATEGORY_MAINS = Object.keys(ORG_CATEGORIES)

export default function PublisherSignUpPage() {
  const [name, setName] = useState('')
  const [organization, setOrganization] = useState('')
  const [orgType, setOrgType] = useState('')
  const [orgCategoryMain, setOrgCategoryMain] = useState('')
  const [orgCategorySub, setOrgCategorySub] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleCategoryMainChange(val: string) {
    setOrgCategoryMain(val)
    setOrgCategorySub('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== passwordConfirm) {
      setError('パスワードが一致しません')
      return
    }
    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください')
      return
    }

    setLoading(true)

    try {
      await submitPublisherApplication({
        email,
        password,
        name,
        organization,
        orgType,
        orgCategoryMain,
        orgCategorySub,
        websiteUrl,
      })
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました。もう一度お試しください。')
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-[calc(100vh-65px)] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10">
            <div className="text-4xl mb-4">✅</div>
            <h1 className="text-xl font-bold text-gray-900 mb-3">申請完了</h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              申請を受け付けました。<br />
              管理者に承認され次第、メールにてご案内いたします。
            </p>
          </div>
        </div>
      </div>
    )
  }

  const subCategories = orgCategoryMain ? ORG_CATEGORIES[orgCategoryMain] ?? [] : []

  return (
    <div className="min-h-[calc(100vh-65px)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">パブリッシャー申請</h1>
            <p className="mt-2 text-sm text-gray-500">
              ボランティアを掲載するには管理者の承認が必要です
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* 担当者名 */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                担当者名 <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="例: 山田 太郎"
              />
            </div>

            {/* 団体・組織名 */}
            <div>
              <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-1.5">
                団体・組織名 <span className="text-red-500">*</span>
              </label>
              <input
                id="organization"
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="例: ○○NPO法人"
              />
            </div>

            {/* 組織の形式 */}
            <div>
              <label htmlFor="orgType" className="block text-sm font-medium text-gray-700 mb-1.5">
                組織の形式 <span className="text-red-500">*</span>
              </label>
              <select
                id="orgType"
                value={orgType}
                onChange={(e) => setOrgType(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
              >
                <option value="">選択してください</option>
                {ORG_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* 組織の種類（大分類） */}
            <div>
              <label htmlFor="orgCategoryMain" className="block text-sm font-medium text-gray-700 mb-1.5">
                組織の種類（大分類） <span className="text-red-500">*</span>
              </label>
              <select
                id="orgCategoryMain"
                value={orgCategoryMain}
                onChange={(e) => handleCategoryMainChange(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
              >
                <option value="">選択してください</option>
                {ORG_CATEGORY_MAINS.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* 組織の種類（中分類） */}
            <div>
              <label htmlFor="orgCategorySub" className="block text-sm font-medium text-gray-700 mb-1.5">
                組織の種類（中分類） <span className="text-red-500">*</span>
              </label>
              <select
                id="orgCategorySub"
                value={orgCategorySub}
                onChange={(e) => setOrgCategorySub(e.target.value)}
                required
                disabled={!orgCategoryMain}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="">{orgCategoryMain ? '選択してください' : '先に大分類を選んでください'}</option>
                {subCategories.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            {/* Webサイト or SNS URL */}
            <div>
              <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700 mb-1.5">
                WebサイトまたはSNSアカウントのURL <span className="text-red-500">*</span>
                <span className="ml-1 text-xs font-normal text-gray-400">（Instagram・X・Facebook・公式サイト等）</span>
              </label>
              <input
                id="websiteUrl"
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="https://example.org"
              />
            </div>

            {/* メールアドレス */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="publisher@example.com"
              />
            </div>

            {/* パスワード */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                パスワード <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="••••••••"
              />
            </div>

            {/* パスワード確認 */}
            <div>
              <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700 mb-1.5">
                パスワード確認 <span className="text-red-500">*</span>
              </label>
              <input
                id="passwordConfirm"
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {loading ? '申請中...' : '申請する'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            すでにアカウントをお持ちの方は{' '}
            <Link href="/login" className="text-indigo-600 hover:text-indigo-800 font-medium">
              ログインはこちら
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
