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
  スキボラ: 'bg-blue-100 text-blue-800',
  ちょボラ: 'bg-green-100 text-green-800',
  ガチボラ: 'bg-orange-100 text-orange-800',
}

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  let program: Program | null = null

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('programs')
      .select('*')
      .eq('id', id)
      .eq('published', true)
      .single()
    program = data as Program | null
  } catch {
    // ignore
  }

  if (!program) notFound()

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
          <div className="w-full h-56 overflow-hidden">
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
          </div>

          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              ボランティア詳細
            </h2>
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {program.description}
            </div>
          </div>

          {program.apply_url ? (
            <a
              href={program.apply_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors text-base shadow-sm"
            >
              応募する →
            </a>
          ) : (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
              応募URLは現在準備中です
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
