import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { Program } from '@/types'

function formatDeadline(deadline: string | null) {
  if (!deadline) return null
  const d = new Date(deadline)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

function isDeadlinePast(deadline: string | null) {
  if (!deadline) return false
  return new Date(deadline) < new Date()
}

const CATEGORY_COLORS: Record<string, string> = {
  スキボラ: 'bg-blue-100 text-blue-800',
  ちょボラ: 'bg-green-100 text-green-800',
  ガチボラ: 'bg-orange-100 text-orange-800',
}

const CATEGORIES = ['スキボラ', 'ちょボラ', 'ガチボラ'] as const

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  let programList: Program[] = []

  try {
    const supabase = await createClient()

    let query = supabase
      .from('programs')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })

    if (category && CATEGORIES.includes(category as typeof CATEGORIES[number])) {
      query = query.eq('category', category)
    }

    const { data: programs } = await query
    programList = (programs as Program[]) ?? []
  } catch {
    // DB接続エラーは無視して空リストを表示
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">ボランティア一覧</h1>
        <p className="mt-2 text-gray-500">
          さまざまなボランティアを探して応募しよう
        </p>
      </div>

      {/* カテゴリフィルター */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href="/"
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !category
              ? 'bg-indigo-600 text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          全て
        </Link>
        {CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={`/?category=${encodeURIComponent(cat)}`}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              category === cat
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {cat}
          </Link>
        ))}
      </div>

      {programList.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">現在公開中のボランティアはありません</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {programList.map((program) => {
            const past = isDeadlinePast(program.deadline)
            return (
              <Link
                key={program.id}
                href={`/programs/${program.id}`}
                className="block bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all overflow-hidden"
              >
                {program.banner_image_url && (
                  <div className="w-full aspect-[16/9] overflow-hidden">
                    <img
                      src={program.banner_image_url}
                      alt={program.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h2 className="text-base font-semibold text-gray-900 leading-snug flex-1 pr-2">
                      {program.title}
                    </h2>
                    {program.deadline && (
                      <span
                        className={`text-xs px-2 py-1 rounded-full whitespace-nowrap font-medium ${
                          past
                            ? 'bg-gray-100 text-gray-400'
                            : 'bg-red-50 text-red-600'
                        }`}
                      >
                        {past ? '締切済' : '受付中'}
                      </span>
                    )}
                  </div>

                  {program.category && (
                    <span
                      className={`inline-block text-xs px-2.5 py-0.5 rounded-full font-medium mb-3 ${CATEGORY_COLORS[program.category] ?? ''}`}
                    >
                      {program.category}
                    </span>
                  )}

                  <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                    {program.description}
                  </p>

                  <div className="space-y-1.5">
                    {program.target && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <span>👥</span>
                        <span>{program.target}</span>
                      </div>
                    )}
                    {program.deadline && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <span>📅</span>
                        <span>締切: {formatDeadline(program.deadline)}</span>
                      </div>
                    )}
                  </div>

                  {program.tags && program.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {program.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
