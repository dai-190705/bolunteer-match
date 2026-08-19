import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Application } from '@/types'
import CancelButton from './CancelButton'

const CATEGORY_COLORS: Record<string, string> = {
  '1day': 'bg-blue-100 text-blue-800',
  中期: 'bg-green-100 text-green-800',
  長期: 'bg-orange-100 text-orange-800',
}

function formatDeadline(deadline: string | null) {
  if (!deadline) return null
  const d = new Date(deadline)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

export default async function LogPage() {
  let applications: Application[] = []

  let user = null
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    user = authUser
  } catch {
    // ignore
  }

  if (!user) redirect('/caredent/login')

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('applications')
      .select('*, programs(*)')
      .eq('student_id', user.id)
      .order('applied_at', { ascending: false })
    applications = (data as Application[]) ?? []
  } catch {
    // ignore
  }

  const applied = applications.filter((a) => a.status === 'applied')
  const completed = applications.filter((a) => a.status === 'completed')

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 pb-32">
      <Link
        href="/caredent/mypage"
        aria-label="マイページに戻る"
        className="inline-flex items-center justify-center w-11 h-11 mb-6 bg-white rounded-full shadow-md hover:shadow-lg active:scale-95 text-gray-700 hover:text-gray-900 transition-all"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">応募・参加したボランティア</h1>
        <p className="text-sm text-gray-500 mt-1">応募中・参加済みのボランティアの一覧です</p>
      </div>

      {/* 応募中 */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
          応募中のボランティア
          <span className="text-sm font-normal text-gray-400">({applied.length}件)</span>
        </h2>

        {applied.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-400 text-sm">
            現在応募中のボランティアはありません
          </div>
        ) : (
          <div className="space-y-3">
            {applied.map((app) => (
              <ApplicationCard key={app.id} app={app} />
            ))}
          </div>
        )}
      </section>

      {/* 参加済み */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-gray-400"></span>
          過去に参加済みボランティア
          <span className="text-sm font-normal text-gray-400">({completed.length}件)</span>
        </h2>

        {completed.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-400 text-sm">
            参加済みのボランティアはありません
          </div>
        ) : (
          <div className="space-y-3">
            {completed.map((app) => (
              <CompletedCard key={app.id} app={app} />
            ))}
          </div>
        )}
      </section>

      {/* 画面下固定フッター */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-gray-50 via-gray-50/95 to-transparent pt-8 pb-5 px-4">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/caredent"
            className="block w-full py-4 rounded-full bg-[#4592c0] hover:bg-[#3a7ea8] active:scale-[0.98] text-white text-base font-bold text-center shadow-lg transition-all"
          >
            ボランティアを探す
          </Link>
        </div>
      </div>
    </div>
  )
}

function ApplicationCard({ app }: { app: Application }) {
  const program = app.programs
  if (!program) return null

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow flex items-start justify-between gap-4">
      <Link href={`/caredent/programs/${program.id}`} className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          {program.category && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[program.category] ?? ''}`}>
              {program.category}
            </span>
          )}
        </div>
        <p className="font-semibold text-gray-900 text-sm leading-snug">{program.title}</p>
        {program.deadline && (
          <p className="text-xs text-gray-500 mt-1">締切: {formatDeadline(program.deadline)}</p>
        )}
      </Link>

      <CancelButton applicationId={app.id} />
    </div>
  )
}

function CompletedCard({ app }: { app: Application }) {
  const program = app.programs
  if (!program) return null

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <Link href={`/caredent/programs/${program.id}`} className="block opacity-70 hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          {program.category && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[program.category] ?? ''}`}>
              {program.category}
            </span>
          )}
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">
            参加済み
          </span>
        </div>
        <p className="font-semibold text-gray-900 text-sm leading-snug">{program.title}</p>
        {program.deadline && (
          <p className="text-xs text-gray-500 mt-1">締切: {formatDeadline(program.deadline)}</p>
        )}
      </Link>
    </div>
  )
}
