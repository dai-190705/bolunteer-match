import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export default async function PortfolioPage() {
  let user = null
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    user = authUser
  } catch {
    // ignore
  }

  if (!user) redirect('/caredent/login')

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <a
        href="/caredent/mypage"
        aria-label="マイページに戻る"
        className="inline-flex items-center justify-center w-11 h-11 mb-6 bg-white rounded-full shadow-md hover:shadow-lg active:scale-95 text-gray-700 hover:text-gray-900 transition-all"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </a>

      <div className="mb-8">
        <p className="text-xs font-medium text-[#4592c0] tracking-wide mb-1">マイポートフォリオ</p>
        <h1 className="text-2xl font-bold text-gray-900">活動の履歴書</h1>
        <p className="text-sm text-gray-500 mt-1">
          参加したボランティアと記事を時系列でまとめた自己紹介ページです
        </p>
      </div>

      {/* 準備中プレースホルダー */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center">
        <div className="text-5xl mb-4">🗂️</div>
        <h2 className="text-lg font-bold text-gray-800 mb-2">ポートフォリオは準備中です</h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          過去に参加したボランティアや執筆した記事の内容を要約し、<br className="hidden sm:block" />
          時系列の履歴書としてまとめる機能を開発中です。もう少しお待ちください。
        </p>
      </div>
    </div>
  )
}
