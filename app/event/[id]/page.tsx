import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getEventById, getPastEvents, getUpcomingEvents, formatEventDate } from '../events'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const event = getEventById(id)
  if (!event) return { title: 'イベントが見つかりません | NOCSY' }

  return {
    title: `${event.title} | NOCSY`,
    description: event.description.replace(/\n+/g, ' ').slice(0, 120),
    openGraph: {
      title: `${event.title} | NOCSY`,
      description: event.description.replace(/\n+/g, ' ').slice(0, 120),
      url: `https://www.nocsy.me/event/${event.id}`,
      siteName: 'NOCSY',
      images: [{ url: event.imageUrl ?? '/nocsy-ogp.png', width: 1200, height: 630, alt: event.title }],
      locale: 'ja_JP',
      type: 'website',
    },
  }
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const event = getEventById(id)
  if (!event) notFound()

  const past = getPastEvents().some((e) => e.id === event.id)

  return (
    <div className="font-sans text-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/nocsy-logo.png" alt="NOCSY" width={200} height={56} className="object-contain" />
          </Link>
          <Link href="/event" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            ← イベント一覧へ
          </Link>
        </div>
      </nav>

      <article className="pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-6">
          {event.imageUrl && (
            <div className="w-full bg-gray-50 flex justify-center border border-gray-100 mb-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={event.imageUrl}
                alt={event.title}
                className="max-h-[720px] w-auto max-w-full object-contain"
              />
            </div>
          )}

          <div className="flex items-center gap-3 mb-4">
            <span
              className={`text-xs font-medium px-2.5 py-1 ${
                past ? 'bg-gray-100 text-gray-500' : 'bg-gray-900 text-white'
              }`}
            >
              {past ? '開催終了' : '開催予定'}
            </span>
            <span className="text-sm text-gray-500">{formatEventDate(event)}</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-8">{event.title}</h1>

          {(event.time || event.place || event.target || event.fee) && (
            <dl className="border border-gray-200 bg-gray-50 p-6 mb-10 space-y-3 text-sm">
              {event.time && (
                <div className="flex gap-4">
                  <dt className="text-gray-400 w-16 flex-shrink-0">時間</dt>
                  <dd className="text-gray-700">{event.time}</dd>
                </div>
              )}
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
              {event.fee && (
                <div className="flex gap-4">
                  <dt className="text-gray-400 w-16 flex-shrink-0">参加費</dt>
                  <dd className="text-gray-700">{event.fee}</dd>
                </div>
              )}
            </dl>
          )}

          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap mb-12">
            {event.description}
          </div>

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

export function generateStaticParams() {
  return [...getUpcomingEvents(), ...getPastEvents()].map((e) => ({ id: e.id }))
}
