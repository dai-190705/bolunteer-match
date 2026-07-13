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
  let diaryApplicationIds: Set<string> = new Set()

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

  // 日記が既に書かれている応募IDを取得
  try {
    const supabase = await createClient()
    const completedIds = applications.filter((a) => a.status === 'completed').map((a) => a.id)
    if (completedIds.length > 0) {
      const { data: diaries } = await supabase
        .from('diary_entries')
        .select('application_id')
        .in('application_id', completedIds)
      diaryApplicationIds = new Set((diaries ?? []).map((d) => d.application_id))
    }
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
              <CompletedCard
                key={app.id}
                app={app}
                hasDiary={diaryApplicationIds.has(app.id)}
              />
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

function CompletedCard({ app, hasDiary }: { app: Application; hasDiary: boolean }) {
  const program = app.programs
  if (!program) return null

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start justify-between gap-4">
      <Link href={`/caredent/programs/${program.id}`} className="flex-1 min-w-0 opacity-60 hover:opacity-80 transition-opacity">
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

      {/* 記事ボタン */}
      <Link
        href={`/caredent/mypage/diary/${app.id}`}
        className={`flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
          hasDiary
            ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
            : 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200'
        }`}
      >
        {hasDiary ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            記事を編集
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            記事を書く
          </>
        )}
      </Link>
    </div>
  )
}
