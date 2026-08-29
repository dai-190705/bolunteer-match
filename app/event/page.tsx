import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { getUpcomingEvents, getPastEvents, formatEventDate, type NocsyEvent } from './events'

export const metadata: Metadata = {
  title: '探究イベント | NOCSY',
  description: 'NOCSYが開催する探究イベントの一覧です。中高生・大学生が実社会とつながる学びの機会を届けます。',
  openGraph: {
    title: '探究イベント | NOCSY',
    description: 'NOCSYが開催する探究イベントの一覧です。',
    url: 'https://www.nocsy.me/event',
    siteName: 'NOCSY',
    images: [{ url: '/nocsy-ogp.png', width: 1200, height: 630, alt: 'NOCSY' }],
    locale: 'ja_JP',
    type: 'website',
  },
}

function EventCard({ event, past = false }: { event: NocsyEvent; past?: boolean }) {
  return (
    <article
      className={`border border-gray-200 bg-white ${past ? 'opacity-70' : ''}`}
    >
      {event.imageUrl && (
        <div className="w-full aspect-[16/9] overflow-hidden bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="p-6 md:p-8">
        <div className="flex items-center gap-3 mb-3">
          <span
            className={`text-xs font-medium px-2.5 py-1 ${
              past ? 'bg-gray-100 text-gray-500' : 'bg-gray-900 text-white'
            }`}
          >
            {past ? '開催終了' : '開催予定'}
          </span>
          <span className="text-sm text-gray-500">{formatEventDate(event)}</span>
        </div>

        <h3 className="text-xl md:text-2xl font-bold leading-snug mb-4">{event.title}</h3>

        <p className="text-gray-700 leading-relaxed mb-6 whitespace-pre-wrap">{event.description}</p>

        {(event.place || event.target) && (
          <dl className="border-t border-gray-100 pt-4 mb-6 space-y-2 text-sm">
            {event.place && (
              <div className="flex gap-4">
                <dt className="text-gray-400 w-16 flex-shrink-0">会場</dt>
                <dd className="text-gray-700">{event.place}</dd>
              </div>
            )}
            {event.target && (
              <div className="flex gap-4">
                <dt className="text-gray-400 w-16 flex-shrink-0">対象</dt>
                <dd className="text-gray-700">{event.target}</dd>
              </div>
            )}
          </dl>
        )}

        {!past &&
          (event.applyUrl ? (
            <a
              href={event.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block border border-gray-900 text-gray-900 px-8 py-3 text-sm font-medium hover:bg-gray-900 hover:text-white transition-colors"
            >
              このイベントに申し込む →
            </a>
          ) : (
            <a
              href="mailto:daito.yasui@nocsy.me"
              className="inline-block border border-gray-900 text-gray-900 px-8 py-3 text-sm font-medium hover:bg-gray-900 hover:text-white transition-colors"
            >
              お問い合わせ →
            </a>
          ))}
      </div>
    </article>
  )
}

export default function EventPage() {
  const upcoming = getUpcomingEvents()
  const past = getPastEvents()

  return (
    <div className="font-sans text-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/nocsy-logo.png" alt="NOCSY" width={200} height={56} className="object-contain" />
          </Link>
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            ← トップページへ
          </Link>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-32 pb-16 bg-gray-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-sm text-gray-400 font-mono mb-3">EVENT</p>
          <h1 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">探究イベント</h1>
          <p className="text-gray-700 leading-relaxed">
            NOCSYが主催・共催する探究イベントの一覧です。<br className="hidden md:block" />
            中高生・大学生が実社会の課題に触れ、自分の関心を深める機会を届けています。
          </p>
        </div>
      </section>

      {/* 開催予定 */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
            開催予定のイベント
            <span className="text-sm font-normal text-gray-400">{upcoming.length}件</span>
          </h2>

          {upcoming.length === 0 ? (
            <div className="border border-gray-200 bg-gray-50 px-6 py-16 text-center">
              <p className="text-gray-500 mb-2">現在、開催予定のイベントはありません。</p>
              <p className="text-sm text-gray-400 mb-8">
                新しいイベントが決まり次第、こちらでお知らせします。
              </p>
              <a
                href="mailto:daito.yasui@nocsy.me"
                className="inline-block border border-gray-900 text-gray-900 px-8 py-3 text-sm font-medium hover:bg-gray-900 hover:text-white transition-colors"
              >
                イベントのご相談・お問い合わせ →
              </a>
            </div>
          ) : (
            <div className="space-y-8">
              {upcoming.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 過去のイベント */}
      {past.length > 0 && (
        <section className="py-16 bg-gray-50 border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
              過去のイベント
              <span className="text-sm font-normal text-gray-400">{past.length}件</span>
            </h2>
            <div className="space-y-8">
              {past.map((e) => (
                <EventCard key={e.id} event={e} past />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">イベントのご相談</h2>
          <p className="text-gray-300 mb-8">
            学校・企業・自治体のみなさまとの共催も承っています。お気軽にご連絡ください。
          </p>
          <a
            href="mailto:daito.yasui@nocsy.me"
            className="inline-block bg-white text-gray-900 px-10 py-4 text-sm font-semibold hover:bg-gray-100 transition-colors"
          >
            daito.yasui@nocsy.me
          </a>
        </div>
      </section>
    </div>
  )
}
