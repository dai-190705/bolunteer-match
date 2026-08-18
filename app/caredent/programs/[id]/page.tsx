import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Program } from '@/types'

function formatDeadline(deadline: string | null) {
  if (!deadline) return null
  const d = new Date(deadline)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

function formatSchedule(program: Program): string | null {
  switch (program.schedule_type) {
    case 'anytime':
      return '随時募集'
    case 'range':
      if (program.event_date && program.event_end_date) {
        return `${formatDeadline(program.event_date)} 〜 ${formatDeadline(program.event_end_date)}`
      }
      return formatDeadline(program.event_date)
    case 'multiple':
      if (program.event_dates?.length) {
        return program.event_dates.map((d) => formatDeadline(d)).join('、')
      }
      return null
    case 'single':
      return formatDeadline(program.event_date)
    default:
      return program.event_date ? formatDeadline(program.event_date) : null
  }
}

const CATEGORY_COLORS: Record<string, string> = {
  '1day': 'bg-blue-100 text-blue-800',
  中期: 'bg-green-100 text-green-800',
  長期: 'bg-orange-100 text-orange-800',
}

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  let program: Program | null = null
  let userId: string | null = null
  let alreadyApplied = false
  let applicantCount = 0

  let organization: string | null = null

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('programs')
      .select('*')
      .eq('id', id)
      .eq('published', true)
      .single()
    program = data as Program | null

    // 掲載団体名を別途取得
    if (program?.publisher_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization')
        .eq('id', program.publisher_id)
        .maybeSingle()
      organization = profile?.organization ?? null
    }

    const { data: { user } } = await supabase.auth.getUser()
    userId = user?.id ?? null

    if (program) {
      // 件数のみ取得（応募者の個人情報は読ませない）
      const { data: countData } = await supabase.rpc('get_applicant_count', { p_program_id: id })
      applicantCount = Number(countData ?? 0)
    }

    if (userId && program) {
      const { data: application } = await supabase
        .from('applications')
        .select('id')
        .eq('program_id', id)
        .eq('student_id', userId)
        .maybeSingle()
      alreadyApplied = !!application
    }
  } catch {
    // ignore
  }

  const isFull = program?.capacity != null && applicantCount >= program.capacity

  if (!program) notFound()

  // 応募後に ?applied=1 で戻ってきたときの表示用
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link
        href="/caredent"
        aria-label="一覧に戻る"
        className="inline-flex items-center justify-center w-11 h-11 mb-6 bg-white rounded-full shadow-md hover:shadow-lg active:scale-95 text-gray-700 hover:text-gray-900 transition-all"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {(() => {
          const wide = program.banner_image_url || program.banner_image_tall_url
          const tall = program.banner_image_tall_url || program.banner_image_url
          if (!wide && !tall) return null
          return (
            <>
              {/* スマホ：4:5 */}
              <div className="w-full aspect-[4/5] overflow-hidden sm:hidden">
                <img src={tall as string} alt={program.title} className="w-full h-full object-cover" />
              </div>
              {/* PC：16:9 */}
              <div className="w-full aspect-[16/9] overflow-hidden hidden sm:block">
                <img src={wide as string} alt={program.title} className="w-full h-full object-cover" />
              </div>
            </>
          )
        })()}

        <div className="p-8">
          <div className="mb-6">
            {program.category && (
              <span
                className={`inline-block text-sm px-3 py-1 rounded-full font-medium mb-3 ${CATEGORY_COLORS[program.category] ?? ''}`}
              >
                {program.category}
              </span>
            )}
            <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-3">
              {program.title}
            </h1>
            {organization && (
              <p className="text-sm text-gray-500 mb-3 flex items-center gap-1">
                <span>🏢</span>
                <span>{organization}</span>
              </p>
            )}
            {program.tags && program.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {program.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-sm bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
            {program.target && (
              <div>
                <dt className="text-xs font-medium text-gray-500 mb-1">対象者</dt>
                <dd className="text-sm text-gray-800">{program.target}</dd>
              </div>
            )}
            {formatSchedule(program) && (
              <div>
                <dt className="text-xs font-medium text-gray-500 mb-1">開催日程</dt>
                <dd className="text-sm text-gray-800">{formatSchedule(program)}</dd>
              </div>
            )}
            {(program.location_type === 'online' || program.location) && (
              <div>
                <dt className="text-xs font-medium text-gray-500 mb-1">開催場所</dt>
                <dd className="text-sm text-gray-800">
                  {program.location_type === 'online' ? 'オンライン' : program.location}
                </dd>
              </div>
            )}
            {program.deadline && (
              <div>
                <dt className="text-xs font-medium text-gray-500 mb-1">応募締切</dt>
                <dd className="text-sm text-gray-800">
                  {formatDeadline(program.deadline)}
                </dd>
              </div>
            )}
            {program.capacity != null && (
              <div>
                <dt className="text-xs font-medium text-gray-500 mb-1">定員</dt>
                <dd className="text-sm text-gray-800 flex items-center gap-2">
                  <span>{applicantCount} / {program.capacity} 名</span>
                  {isFull && (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                      満員
                    </span>
                  )}
                </dd>
              </div>
            )}
          </div>

          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              ボランティア詳細
            </h2>
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {program.description}
            </div>
          </div>

          {/* Apply button section */}
          {alreadyApplied ? (
            <button
              disabled
              className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-3 bg-gray-200 text-gray-500 font-semibold rounded-xl cursor-not-allowed text-base"
            >
              応募済み ✓
            </button>
          ) : isFull ? (
            <button
              disabled
              className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-3 bg-red-100 text-red-400 font-semibold rounded-xl cursor-not-allowed text-base"
            >
              満員のため応募を締め切りました
            </button>
          ) : (
            <div>
              <Link
                href={`/caredent/programs/${id}/apply`}
                className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors text-base shadow-sm"
              >
                応募する →
              </Link>
              {!userId && (
                <p className="text-xs text-gray-400 mt-2">
                  アカウントがなくても応募できます
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
