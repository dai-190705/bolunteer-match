import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import ProfileEditForm, { type PortfolioValue } from './ProfileEditForm'

export default async function PortfolioProfileEditPage() {
  let user = null
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    user = authUser
  } catch {
    // ignore
  }

  if (!user) redirect('/caredent/login')

  const supabase = await createClient()
  const { data } = await supabase
    .from('student_profiles')
    .select('catchphrase, catchphrase_description, self_pr, interest_tags, portfolio_values')
    .eq('id', user.id)
    .maybeSingle()

  const rawValues = (data?.portfolio_values ?? []) as unknown
  const values: PortfolioValue[] = Array.isArray(rawValues)
    ? (rawValues as PortfolioValue[]).map((v) => ({ title: v?.title ?? '' }))
    : []

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <a
        href="/caredent/mypage/portfolio"
        aria-label="ポートフォリオに戻る"
        className="inline-flex items-center justify-center w-11 h-11 mb-6 bg-white rounded-full shadow-md hover:shadow-lg active:scale-95 text-gray-700 hover:text-gray-900 transition-all"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </a>

      <div className="mb-8">
        <p className="text-xs font-medium text-[#4592c0] tracking-wide mb-1">マイポートフォリオ</p>
        <h1 className="text-2xl font-bold text-gray-900">プロフィールを編集</h1>
        <p className="text-sm text-gray-500 mt-1">キャッチコピーや自己PRを設定して、あなたらしさを伝えましょう</p>
      </div>

      <ProfileEditForm
        studentId={user.id}
        initial={{
          catchphrase: data?.catchphrase ?? '',
          catchphraseDescription: data?.catchphrase_description ?? '',
          selfPr: data?.self_pr ?? '',
          interestTags: (data?.interest_tags ?? []) as string[],
          values,
        }}
      />
    </div>
  )
}
