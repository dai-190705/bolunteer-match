import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Application } from '@/types'

function formatDeadline(deadline: string | null) {
  if (!deadline) return null
  const d = new Date(deadline)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

const CATEGORY_COLORS: Record<string, string> = {
  スキボラ: 'bg-blue-100 text-blue-800',
  ちょボラ: 'bg-green-100 text-green-800',
  ガチボラ: 'bg-orange-100 text-orange-800',
}

export default async function MyPage() {
  let applications: Application[] = []

  let user = null
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    user = authUser
  } catch {
    // ignore
  }

  if (!user) redirect('/login')

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
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">マイページ</h1>
        <p className="text-sm text-gray-500 mt-1">{user.email}</p>
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
              <ApplicationCard key={app.id} app={app} dimmed />
            ))}
          </div>
        )}
      </section>

      <div className="mt-10 text-center">
        <Link href="/" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
          ボランティアを探す →
        </Link>
      </div>
    </div>
  )
}

function ApplicationCard({ app, dimmed = false }: { app: Application; dimmed?: boolean }) {
  const program = app.programs
  if (!program) return null

  const CATEGORY_COLORS: Record<string, string> = {
    スキボラ: 'bg-blue-100 text-blue-800',
    ちょボラ: 'bg-green-100 text-green-800',
    ガチボラ: 'bg-orange-100 text-orange-800',
  }

  function formatDeadline(deadline: string | null) {
    if (!deadline) return null
    const d = new Date(deadline)
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
  }

  return (
    <Link href={`/programs/${program.id}`}>
      <div
        className={`bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow flex items-start justify-between gap-4 ${dimmed ? 'opacity-60' : ''}`}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {program.category && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[program.category] ?? ''}`}
              >
                {program.category}
              </span>
            )}
            {app.status === 'completed' && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">
                参加済み
              </span>
            )}
          </div>
          <p className="font-semibold text-gray-900 text-sm leading-snug truncate">
            {program.title}
          </p>
          {program.deadline && (
            <p className="text-xs text-gray-500 mt-1">
              締切: {formatDeadline(program.deadline)}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
