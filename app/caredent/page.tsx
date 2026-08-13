import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { Program } from '@/types'

const PAGE_SIZE = 20

function formatDeadline(deadline: string | null) {
  if (!deadline) return null
  const d = new Date(deadline)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function isDeadlinePast(deadline: string | null) {
  if (!deadline) return false
  return new Date(deadline) < new Date()
}

const CATEGORY_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  '1day': { label: '1day', color: 'text-sky-700', bg: 'bg-sky-100' },
  中期: { label: '中期', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  長期: { label: '長期', color: 'text-orange-700', bg: 'bg-orange-100' },
}

const CATEGORIES = ['1day', '中期', '長期'] as const

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; page?: string }>
}) {
  const { category, q, page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)

  let programList: Program[] = []
  let totalCount = 0

  try {
    const supabase = await createClient()
    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    const now = new Date().toISOString()

    let query = supabase
      .from('programs')
      .select('*', { count: 'exact' })
      .eq('published', true)
      .or(`deadline.is.null,deadline.gte.${now}`)
      .order('deadline', { ascending: true, nullsFirst: false })

    if (category && CATEGORIES.includes(category as typeof CATEGORIES[number])) {
      query = query.eq('category', category)
    }

    if (q) {
      query = query.ilike('title', `%${q}%`)
    }

    query = query.range(from, to)

    const { data: programs, count } = await query
    programList = (programs as Program[]) ?? []
    totalCount = count ?? 0
  } catch {
    // DB接続エラーは無視して空リストを表示
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  // ページネーションリンク生成ヘルパー
  function buildHref(p: number) {
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    if (q) params.set('q', q)
    if (p > 1) params.set('page', String(p))
    const qs = params.toString()
    return qs ? `/caredent?${qs}` : '/caredent'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヒーローバー */}
      <div style={{ backgroundColor: '#4592c0' }} className="pt-5 pb-4">
        <div className="max-w-3xl mx-auto px-4">
        {/* 検索バー */}
        <form method="GET" action="/caredent" className="relative">
          <input
            type="text"
            name="q"
            defaultValue={q ?? ''}
            placeholder="キーワードで検索"
            className="w-full bg-white rounded-xl px-4 py-3 pl-10 text-sm text-gray-700 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-white/60"
          />
          {category && <input type="hidden" name="category" value={category} />}
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </form>

        {/* カテゴリタブ */}
        <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
          <Link
            href={q ? `/caredent?q=${encodeURIComponent(q)}` : '/caredent'}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              !category
                ? 'bg-white text-[#4592c0] shadow-sm'
                : 'bg-white/20 text-white'
            }`}
          >
            すべて
          </Link>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/caredent?category=${encodeURIComponent(cat)}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                category === cat
                  ? 'bg-white text-[#4592c0] shadow-sm'
                  : 'bg-white/20 text-white'
              }`}
            >
              {cat}
            </Link>
          ))}

          {/* みんなの記事へ（募集とは別セクション） */}
          <Link
            href="/caredent/post"
            className="flex-shrink-0 ml-auto inline-flex items-center gap-1.5 pl-3 pr-2.5 py-1.5 rounded-full bg-white text-[#4592c0] text-sm font-bold shadow-sm border border-white/60 hover:bg-[#eaf4fa] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            みんなの記事
            <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        </div>
      </div>

      {/* 件数バー */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            <span className="font-semibold text-gray-800">{totalCount}</span> 件のプログラム
            {totalPages > 1 && (
              <span className="ml-2 text-gray-400">（{page} / {totalPages} ページ）</span>
            )}
          </span>
          <span className="text-xs text-gray-400">締切順</span>
        </div>
      </div>

      {/* カードグリッド */}
      <div className="px-3 py-4">
        {programList.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-base font-medium">プログラムが見つかりません</p>
            <p className="text-sm mt-1">条件を変えて検索してみてください</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-3xl mx-auto">
            {programList.map((program) => {
              const past = isDeadlinePast(program.deadline)
              const cat = program.category ? CATEGORY_LABELS[program.category] : null
              return (
                <Link
                  key={program.id}
                  href={`/caredent/programs/${program.id}`}
                  className="block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md active:scale-[0.98] transition-all"
                >
                  {/* サムネイル */}
                  <div className="relative w-full aspect-video bg-gray-100">
                    {program.banner_image_url ? (
                      <img
                        src={program.banner_image_url}
                        alt={program.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-300 text-4xl">🌱</span>
                      </div>
                    )}
                    {/* 締切バッジ */}
                    {program.deadline && (
                      <span
                        className={`absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-full ${
                          past
                            ? 'bg-gray-600/80 text-white'
                            : 'bg-red-500/90 text-white'
                        }`}
                      >
                        {past ? '締切済' : `〆${formatDeadline(program.deadline)}`}
                      </span>
                    )}
                  </div>

                  {/* カード本文 */}
                  <div className="p-4">
                    <p className="text-base font-bold text-gray-900 leading-snug line-clamp-2 mb-2">
                      {program.title}
                    </p>

                    {cat && (
                      <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full mb-2 ${cat.bg} ${cat.color}`}>
                        {cat.label}
                      </span>
                    )}

                    {program.target && (
                      <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="line-clamp-1">{program.target}</span>
                      </p>
                    )}

                    {program.tags && program.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {program.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-[#e8f4fc] text-[#4592c0] px-2 py-0.5 rounded-full font-medium"
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

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 px-4 py-6">
          {/* 前へ */}
          {page > 1 ? (
            <Link
              href={buildHref(page - 1)}
              className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              前へ
            </Link>
          ) : (
            <span className="flex items-center gap-1 px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-300 cursor-not-allowed">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              前へ
            </span>
          )}

          {/* ページ番号 */}
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
              // 最初・最後・現在±1のページのみ表示
              if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) {
                return (
                  <Link
                    key={p}
                    href={buildHref(p)}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      p === page
                        ? 'bg-[#4592c0] text-white shadow-sm'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </Link>
                )
              }
              // 省略記号（連続してない場合のみ）
              if (p === page - 2 || p === page + 2) {
                return (
                  <span key={p} className="w-6 text-center text-gray-400 text-sm">
                    …
                  </span>
                )
              }
              return null
            })}
          </div>

          {/* 次へ */}
          {page < totalPages ? (
            <Link
              href={buildHref(page + 1)}
              className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
            >
              次へ
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <span className="flex items-center gap-1 px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-300 cursor-not-allowed">
              次へ
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          )}
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}
