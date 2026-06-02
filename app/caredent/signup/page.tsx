'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

export default function SignUpPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [lastName, setLastName] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastNameKana, setLastNameKana] = useState('')
  const [firstNameKana, setFirstNameKana] = useState('')
  const [school, setSchool] = useState('')
  const [userHandle, setUserHandle] = useState('')
  const [nickname, setNickname] = useState('')
  const [grade, setGrade] = useState('')
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

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
      const supabase = createClient()
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/caredent/auth/callback`,
          data: {
            role: 'student',
            last_name: lastName,
            first_name: firstName,
            last_name_kana: lastNameKana,
            first_name_kana: firstNameKana,
            school,
            user_handle: userHandle,
            nickname,
            grade,
          },
        },
      })

      if (signUpError) {
        setError('登録に失敗しました。入力内容を確認してもう一度お試しください。')
        setLoading(false)
        return
      }

      setDone(true)
    } catch {
      setError('エラーが発生しました。もう一度お試しください。')
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-[calc(100vh-65px)] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10">
            <div className="text-4xl mb-4">📬</div>
            <h1 className="text-xl font-bold text-gray-900 mb-3">確認メールを送信しました</h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              登録したメールアドレスに確認メールを送りました。<br />
              メール内のリンクをクリックしてアカウントを有効化してください。
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-65px)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">学生アカウント登録</h1>
            <p className="mt-2 text-sm text-gray-500">
              ボランティアに応募するにはアカウント登録が必要です
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                氏名 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="性（例: 山田）"
                />
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="名（例: 太郎）"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                ふりがな <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={lastNameKana}
                  onChange={(e) => setLastNameKana(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="せい（例: やまだ）"
                />
                <input
                  type="text"
                  value={firstNameKana}
                  onChange={(e) => setFirstNameKana(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="めい（例: たろう）"
                />
              </div>
            </div>

            <div>
              <label htmlFor="school" className="block text-sm font-medium text-gray-700 mb-1.5">
                所属学校 <span className="text-red-500">*</span>
              </label>
              <input
                id="school"
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="例: ○○高等学校"
              />
            </div>

            <div>
              <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1.5">
                学年 <span className="text-red-500">*</span>
              </label>
              <select
                id="grade"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
              >
                <option value="">選択してください</option>
                <optgroup label="高校生">
                  <option value="高校1年生">高校1年生</option>
                  <option value="高校2年生">高校2年生</option>
                  <option value="高校3年生">高校3年生</option>
                </optgroup>
                <optgroup label="大学生">
                  <option value="大学1年生">大学1年生</option>
                  <option value="大学2年生">大学2年生</option>
                  <option value="大学3年生">大学3年生</option>
                  <option value="大学4年生">大学4年生</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label htmlFor="userHandle" className="block text-sm font-medium text-gray-700 mb-1.5">
                ユーザーID <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2.5 bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg text-sm text-gray-500">@</span>
                <input
                  id="userHandle"
                  type="text"
                  value={userHandle}
                  onChange={(e) => setUserHandle(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                  required
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-r-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="例: taro_yamada"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">半角英数字・アンダースコアのみ使用可</p>
            </div>

            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1.5">
                ニックネーム <span className="text-red-500">*</span>
              </label>
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="例: たろう"
              />
            </div>

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
                placeholder="student@example.com"
              />
            </div>

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

            {/* プライバシーポリシー */}
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-3">
              <button
                type="button"
                onClick={() => setShowPrivacy(true)}
                className="flex items-center justify-between w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:border-indigo-400 transition-colors font-medium"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-indigo-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  プライバシーポリシーを確認する
                </span>
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={agreedToPrivacy}
                  onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 flex-shrink-0 cursor-pointer"
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors leading-snug">
                  プライバシーポリシーを読み、内容に同意します
                </span>
              </label>
            </div>

            {/* プライバシーポリシー モーダル */}
            {showPrivacy && (
              <div
                className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
                onClick={(e) => { if (e.target === e.currentTarget) setShowPrivacy(false) }}
              >
                {/* オーバーレイ */}
                <div className="absolute inset-0 bg-black/50" />

                {/* モーダル本体 */}
                <div className="relative bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col max-h-[85vh]">
                  {/* ヘッダー */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
                    <h2 className="text-base font-bold text-gray-900">プライバシーポリシー</h2>
                    <button
                      type="button"
                      onClick={() => setShowPrivacy(false)}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* 本文（スクロール可能） */}
                  <div className="overflow-y-auto px-6 py-5 text-sm text-gray-700 leading-relaxed space-y-5">
                    <section>
                      <h3 className="font-bold text-gray-900 mb-2">お客様から取得する情報</h3>
                      <p className="mb-2">当社は、お客様から以下の情報を取得します。</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>氏名（ニックネームやペンネームも含む）</li>
                        <li>年齢または生年月日</li>
                        <li>職業、職歴、学歴</li>
                        <li>メールアドレス</li>
                        <li>写真や動画</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="font-bold text-gray-900 mb-2">お客様の情報を利用する目的</h3>
                      <p className="mb-2">当社は、お客様から取得した情報を、以下の目的のために利用します。</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>当社サービスに関する登録の受付、お客様の本人確認、認証のため</li>
                        <li>お客様の当社サービスの利用履歴を管理するため</li>
                        <li>利用料金の決済のため</li>
                        <li>当社サービスにおけるお客様の行動履歴を分析し、当社サービスの維持改善に役立てるため</li>
                        <li>当社のサービスに関するご案内をするため</li>
                        <li>提携する事業者・サービスのご案内をお送りするため</li>
                        <li>お客様からのお問い合わせに対応するため</li>
                        <li>当社の規約や法令に違反する行為に対応するため</li>
                        <li>当社サービスの変更、提供中止、終了、契約解除をご連絡するため</li>
                        <li>当社規約の変更等を通知するため</li>
                        <li>以上の他、当社サービスの提供、維持、保護及び改善のため</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="font-bold text-gray-900 mb-2">安全管理のために講じた措置</h3>
                      <p>当社が、お客様から取得した情報に関して安全管理のために講じた措置につきましては、末尾記載のお問い合わせ先にご連絡をいただきましたら、法令の定めに従い個別にご回答させていただきます。</p>
                    </section>

                    <section>
                      <h3 className="font-bold text-gray-900 mb-2">第三者提供</h3>
                      <p className="mb-2">当社は、お客様から取得する情報のうち、個人データ（個人情報保護法第16条第3項）に該当するものについては、あらかじめお客様の同意を得ずに、第三者（日本国外にある者を含みます。）に提供しません。但し、次の場合は除きます。</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>個人データの取扱いを外部に委託する場合</li>
                        <li>当社や当社サービスが買収された場合</li>
                        <li>事業パートナーと共同利用する場合（具体的な共同利用がある場合は、その内容を別途公表します。）</li>
                        <li>その他、法律によって合法的に第三者提供が許されている場合</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="font-bold text-gray-900 mb-2">アクセス解析ツール</h3>
                      <p>当社は、お客様のアクセス解析のために、「Googleアナリティクス」を利用しています。Googleアナリティクスは、トラフィックデータの収集のためにCookieを使用しています。トラフィックデータは匿名で収集されており、個人を特定するものではありません。Cookieを無効にすれば、これらの情報の収集を拒否することができます。詳しくはお使いのブラウザの設定をご確認ください。</p>
                    </section>

                    <section>
                      <h3 className="font-bold text-gray-900 mb-2">プライバシーポリシーの変更</h3>
                      <p>当社は、必要に応じて、このプライバシーポリシーの内容を変更します。この場合、変更後のプライバシーポリシーの施行時期と内容を適切な方法により周知または通知します。</p>
                    </section>

                    <section>
                      <h3 className="font-bold text-gray-900 mb-2">お問い合わせ</h3>
                      <p className="mb-2">お客様の情報の開示、情報の訂正、利用停止、削除をご希望の場合は、以下のメールアドレスにご連絡ください。</p>
                      <p className="font-medium">e-mail｜<a href="mailto:info@nocsy.me" className="text-indigo-600 hover:underline">info@nocsy.me</a></p>
                      <p className="mt-2 text-xs text-gray-500">この場合、必ず、運転免許証のご提示等当社が指定する方法により、ご本人からのご請求であることの確認をさせていただきます。なお、情報の開示請求については、開示の有無に関わらず、ご申請時に一件あたり1,000円の事務手数料を申し受けます。</p>
                    </section>

                    <section className="text-xs text-gray-500 border-t border-gray-100 pt-4">
                      <p>事業者の氏名：学生団体NOCSY（安井大翔）</p>
                      <p>事業者の住所：大阪府堺市北区長曽根町1179-12ユニハイム新金岡1102号室</p>
                      <p className="mt-1">2026年06月01日 制定</p>
                    </section>
                  </div>

                  {/* フッター */}
                  <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => { setAgreedToPrivacy(true); setShowPrivacy(false) }}
                      className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                    >
                      同意して閉じる
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !agreedToPrivacy}
              className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {loading ? '登録中...' : 'アカウント登録'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            すでにアカウントをお持ちの方は{' '}
            <Link href="/caredent/login" className="text-indigo-600 hover:text-indigo-800 font-medium">
              ログインはこちら
            </Link>
          </p>

          <div className="mt-4 pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400 mb-2">ボランティアを掲載したい団体・企業の方</p>
            <Link
              href="/caredent/publisher-signup"
              className="inline-block text-sm text-gray-500 hover:text-indigo-600 font-medium border border-gray-200 hover:border-indigo-300 rounded-lg px-4 py-2 transition-colors"
            >
              掲載者（パブリッシャー）の申請はこちら →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
