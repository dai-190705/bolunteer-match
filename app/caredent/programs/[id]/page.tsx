import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Program } from '@/types'

function formatDeadline(deadline: string | null) {
  if (!deadline) return null
  const d = new Date(deadline)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
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
      .select('*, profiles(organization)')
      .eq('id', id)
      .eq('published', true)
      .single()
    if (data) {
      const { profiles, ...rest } = data as any
      program = rest as Program
      organization = profiles?.organization ?? null
    }

    const { data: { user } } = await supabase.auth.getUser()
    userId = user?.id ?? null

    if (program) {
      const { count } = await supabase
        .from('applications')
        .select('id', { count: 'exact', head: true })
        .eq('program_id', id)
      applicantCount = count ?? 0
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
        href="/"
        className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 mb-6 transition-colors"
      >
        ← 一覧に戻る
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {program.banner_image_url && (
          <div className="w-full aspect-[16/9] overflow-hidden">
            <img
              src={program.banner_image_url}
              alt={program.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

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
          {!userId ? (
            <Link
              href={`/caredent/login?next=/caredent/programs/${id}/apply`}
              className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors text-base shadow-sm"
            >
              応募するにはログインが必要です
            </Link>
          ) : alreadyApplied ? (
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
            <Link
              href={`/caredent/programs/${id}/apply`}
              className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors text-base shadow-sm"
            >
              応募する →
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
