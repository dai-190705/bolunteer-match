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

type Profile = {
  name: string
  nickname: string | null
  handle: string | null
  school: string | null
  grade: string | null
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
}: {
  timeline: TimelineItem[]
  articles: ArticleItem[]
  profile: Profile
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
        {tab === 'history' && <HistoryPanel timeline={timeline} />}
        {tab === 'articles' && <ArticlesPanel articles={articles} />}
        {tab === 'profile' && <ProfilePanel profile={profile} />}
      </div>
    </>
  )
}

function HistoryPanel({ timeline }: { timeline: TimelineItem[] }) {
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
        <Link
          href="/caredent/mypage/portfolio/edit"
          className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:shadow transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          活動履歴を編集
        </Link>
      </div>

      {timeline.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-gray-400 text-sm">
          まだ活動履歴がありません。ボランティアに参加するか、活動を追加しましょう。
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

      {/* 下部CTA */}
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
    </div>
  )
}

function ArticlesPanel({ articles }: { articles: ArticleItem[] }) {
  if (articles.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-gray-400 text-sm">
        まだ記事がありません。参加したボランティアの記事を書いてみましょう。
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
            <span
              className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
                a.isPublic ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {a.isPublic ? '公開' : '非公開'}
            </span>
          </div>
          {a.date && <p className="text-xs text-gray-400 mt-1">{dateLabel(a.date)}</p>}
        </Link>
      ))}
    </div>
  )
}

function ProfilePanel({ profile }: { profile: Profile }) {
  const rows: { label: string; value: string | null }[] = [
    { label: 'ニックネーム', value: profile.nickname },
    { label: 'ユーザーID', value: profile.handle ? `@${profile.handle}` : null },
    { label: '所属学校', value: profile.school },
    { label: '学年', value: profile.grade },
  ]
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-4 px-5 py-4">
          <span className="w-24 flex-shrink-0 text-xs font-medium text-gray-500">{r.label}</span>
          <span className="text-sm text-gray-900">{r.value || '—'}</span>
        </div>
      ))}
      <div className="px-5 py-4">
        <Link href="/caredent/mypage/profile" className="text-sm font-semibold text-[#4592c0] hover:underline">
          プロフィールを編集 →
        </Link>
      </div>
    </div>
  )
}
