'use client'

import { useState } from 'react'
import Link from 'next/link'

export type TimelineItem = {
  kind: 'volunteer' | 'custom'
  date: string
  title: string
  description: string
  tags: string[]
  applicationId?: string
  hasArticle: boolean
}

export type ArticleItem = {
  applicationId: string
  title: string
  program: string
  date: string
  isPublic: boolean
}

type PortfolioValue = { title: string }

type Profile = {
  name: string
  nickname: string | null
  handle: string | null
  school: string | null
  grade: string | null
  catchphrase: string | null
  catchphraseDescription: string | null
  selfPr: string | null
  interestTags: string[]
  values: PortfolioValue[]
}

type Tab = 'profile' | 'history' | 'articles'

const KIND_STYLE: Record<
  TimelineItem['kind'],
  { label: string; dot: string; badge: string; chip: string; icon: React.ReactNode }
> = {
  volunteer: {
    label: 'ボランティア活動',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-100 text-emerald-700',
    chip: 'bg-emerald-50 text-emerald-600',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  custom: {
    label: 'イベント・活動',
    dot: 'bg-[#4592c0]',
    badge: 'bg-sky-100 text-sky-700',
    chip: 'bg-sky-50 text-sky-600',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
}

function ymOf(iso: string) {
  if (!iso) return { year: '', month: '' }
  const d = new Date(iso)
  return { year: `${d.getFullYear()}年`, month: `${d.getMonth() + 1}月` }
}

function dateLabel(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

export default function PortfolioTabs({
  timeline,
  articles,
  profile,
  editable = false,
}: {
  timeline: TimelineItem[]
  articles: ArticleItem[]
  profile: Profile
  editable?: boolean
}) {
  const [tab, setTab] = useState<Tab>('history')

  const tabs: { id: Tab; label: string }[] = [
    { id: 'profile', label: 'プロフィール' },
    { id: 'history', label: '活動履歴' },
    { id: 'articles', label: '記事一覧' },
  ]

  return (
    <>
      {/* タブバー */}
      <div className="bg-white rounded-b-3xl shadow-sm border-x border-b border-gray-100">
        <div className="flex px-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex-1 py-4 text-sm font-semibold border-b-2 transition-colors ${
                tab === t.id
                  ? 'border-[#4592c0] text-[#4592c0]'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {tab === 'history' && <HistoryPanel timeline={timeline} editable={editable} />}
        {tab === 'articles' && <ArticlesPanel articles={articles} editable={editable} />}
        {tab === 'profile' && <ProfilePanel profile={profile} editable={editable} />}
      </div>
    </>
  )
}

function HistoryPanel({ timeline, editable }: { timeline: TimelineItem[]; editable: boolean }) {
  return (
    <div>
      <div className="flex items-start gap-3 mb-6">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#e8f4fc] flex items-center justify-center">
          <svg className="w-5 h-5 text-[#4592c0]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h.01M12 12h.01M9 16h6" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-gray-900">活動履歴</h2>
          <p className="text-sm text-gray-500">参加した活動やイベントを時系列でご紹介します。</p>
        </div>
        {editable && (
          <Link
            href="/caredent/mypage/portfolio/edit"
            className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:shadow transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            活動履歴を編集
          </Link>
        )}
      </div>

      {timeline.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-gray-400 text-sm">
          {editable ? 'まだ活動履歴がありません。ボランティアに参加するか、活動を追加しましょう。' : 'まだ活動履歴がありません。'}
        </div>
      ) : (
        <div className="relative pl-3">
          {/* 縦ライン */}
          <div className="absolute left-[9px] top-2 bottom-2 w-px bg-gray-200" />
          <div className="space-y-5">
            {timeline.map((item, i) => {
              const style = KIND_STYLE[item.kind]
              const { year, month } = ymOf(item.date)
              const card = (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${style.badge}`}>
                      {style.icon}
                      {style.label}
                    </span>
                    {item.hasArticle && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-violet-50 text-violet-600">
                        📝 記事あり
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-gray-900 leading-snug">{item.title}</h3>
                  {item.description && (
                    <p className="text-sm text-gray-600 mt-1.5 leading-relaxed whitespace-pre-wrap">{item.description}</p>
                  )}
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {item.tags.map((tag) => (
                        <span key={tag} className={`text-xs px-2 py-0.5 rounded-full font-medium ${style.chip}`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )
              return (
                <div key={i} className="relative flex gap-4">
                  {/* ドット＋年月 */}
                  <div className="flex-shrink-0 w-14 text-right relative">
                    <span className={`absolute -left-[9px] top-1.5 w-3 h-3 rounded-full ring-2 ring-white ${style.dot}`} />
                    <div className="text-xs font-semibold text-gray-500 leading-tight pt-0.5">
                      {year}
                      <br />
                      {month}
                    </div>
                  </div>
                  {item.hasArticle && item.applicationId ? (
                    <Link
                      href={`/caredent/article/${item.applicationId}`}
                      className="flex-1 min-w-0 active:scale-[0.99] transition-transform"
                    >
                      {card}
                    </Link>
                  ) : (
                    card
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 下部CTA（所有者のみ） */}
      {editable && (
        <div className="mt-8 rounded-2xl bg-[#eaf4fa] border border-[#cfe6f3] p-5 flex items-center gap-4">
          <div className="flex-shrink-0 w-11 h-11 rounded-full bg-[#4592c0] flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900">もっと活動を記録しよう</p>
            <p className="text-xs text-gray-500 mt-0.5">新しい活動やイベントを追加して、あなたの経験を可視化しましょう。</p>
          </div>
          <Link
            href="/caredent/mypage/portfolio/edit"
            className="flex-shrink-0 inline-flex items-center gap-1 px-4 py-2.5 rounded-full bg-[#4592c0] text-white text-sm font-bold hover:bg-[#3a7ea8] transition-colors"
          >
            ＋ 活動を追加
          </Link>
        </div>
      )}
    </div>
  )
}

function ArticlesPanel({ articles, editable }: { articles: ArticleItem[]; editable: boolean }) {
  if (articles.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-gray-400 text-sm">
        {editable ? 'まだ記事がありません。参加したボランティアの記事を書いてみましょう。' : 'まだ公開された記事はありません。'}
      </div>
    )
  }
  return (
    <div className="space-y-3">
      {articles.map((a) => (
        <Link
          key={a.applicationId}
          href={`/caredent/article/${a.applicationId}`}
          className="block bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-md active:scale-[0.99] transition-all"
        >
          {a.program && <p className="text-xs text-[#4592c0] font-medium mb-1">🏢 {a.program}</p>}
          <div className="flex items-center gap-2">
            <p className="flex-1 font-bold text-gray-900 leading-snug">{a.title}</p>
            {editable && (
              <span
                className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
                  a.isPublic ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {a.isPublic ? '公開' : '非公開'}
              </span>
            )}
          </div>
          {a.date && <p className="text-xs text-gray-400 mt-1">{dateLabel(a.date)}</p>}
        </Link>
      ))}
    </div>
  )
}

const VALUE_ICONS = [
  // 旗・山（誇り）
  <path key="0" strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 2H21l-3 6 3 6h-8.5l-1-2H5a2 2 0 00-2 2zm9-13.5V9" />,
  // 人（つながり）
  <path key="1" strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />,
  // ロケット（挑戦）
  <path key="2" strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />,
]

function ProfilePanel({ profile, editable }: { profile: Profile; editable: boolean }) {
  const hasCatch = !!(profile.catchphrase || profile.catchphraseDescription)
  const hasValues = profile.values.length > 0
  const hasPr = !!profile.selfPr
  const hasTags = profile.interestTags.length > 0
  const isEmpty = !hasCatch && !hasValues && !hasPr && !hasTags

  return (
    <div className="space-y-5">
      {/* 編集ボタン（所有者のみ） */}
      {editable && (
        <div className="flex justify-end">
          <Link
            href="/caredent/mypage/portfolio/profile"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:shadow transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            プロフィールを編集
          </Link>
        </div>
      )}

      {isEmpty && (
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
          <div className="text-4xl mb-3">✨</div>
          {editable ? (
            <>
              <p className="text-sm font-semibold text-gray-700 mb-1">プロフィールを充実させましょう</p>
              <p className="text-xs text-gray-400">キャッチコピーや自己PRを設定して、あなたらしさを伝えましょう。</p>
            </>
          ) : (
            <p className="text-sm text-gray-400">プロフィールはまだ設定されていません。</p>
          )}
        </div>
      )}

      {/* キャッチコピー */}
      {hasCatch && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#e8f4fc] flex items-center justify-center">
              <svg className="w-5 h-5 text-[#4592c0]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9.5 5H6a2 2 0 00-2 2v3.5a2 2 0 002 2h1.5a.5.5 0 01.5.5v.5a2 2 0 01-2 2H5v2h1a4 4 0 004-4V7a2 2 0 00-.5-2zm9 0H15a2 2 0 00-2 2v3.5a2 2 0 002 2h1.5a.5.5 0 01.5.5v.5a2 2 0 01-2 2H14v2h1a4 4 0 004-4V7a2 2 0 00-.5-2z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-gray-500">キャッチコピー</h3>
          </div>
          {profile.catchphrase && (
            <p className="text-xl font-bold text-[#4592c0] leading-snug">{profile.catchphrase}</p>
          )}
          {profile.catchphraseDescription && (
            <p className="text-sm text-gray-700 leading-relaxed mt-3 pt-3 border-t border-dashed border-gray-200 whitespace-pre-wrap">
              {profile.catchphraseDescription}
            </p>
          )}
        </div>
      )}

      {/* 自己PR */}
      {hasPr && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#e8f4fc] flex items-center justify-center">
              <svg className="w-5 h-5 text-[#4592c0]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-900">自己PR</h3>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{profile.selfPr}</p>
        </div>
      )}

      {/* 大切にしていること */}
      {hasValues && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#e8f4fc] flex items-center justify-center">
              <svg className="w-5 h-5 text-[#4592c0]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-900">大切にしていること</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.values.map((v, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 text-sm px-3.5 py-2 rounded-full font-semibold bg-[#eaf4fa] text-[#4592c0]"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  {VALUE_ICONS[i % VALUE_ICONS.length]}
                </svg>
                {v.title}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 興味タグ */}
      {hasTags && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#e8f4fc] flex items-center justify-center">
              <svg className="w-5 h-5 text-[#4592c0]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5a1.99 1.99 0 011.414.586l7 7a2 2 0 010 2.828l-5 5a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 8V3a2 2 0 012-2z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-900">興味タグ</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.interestTags.map((tag) => (
              <span key={tag} className="text-sm px-3 py-1.5 rounded-full font-medium bg-[#eaf4fa] text-[#4592c0]">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
