import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'

export default async function ApplyCompletePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: program } = await supabase
    .from('programs')
    .select('title')
    .eq('id', id)
    .eq('published', true)
    .maybeSingle()

  const { data: { user } } = await supabase.auth.getUser()
  const isGuest = !user

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 sm:p-10 text-center">
        {/* チェックアイコン */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">応募が完了しました</h1>

        {program?.title && (
          <p className="text-sm font-semibold text-gray-700 mb-4">{program.title}</p>
        )}

        <p className="text-sm text-gray-500 leading-relaxed">
          ご応募ありがとうございます。
          <br />
          担当者からの連絡をお待ちください。
        </p>

        {isGuest && (
          <div className="mt-6 p-4 rounded-xl bg-gray-50 border border-gray-200 text-left">
            <p className="text-sm text-gray-600 leading-relaxed">
              ご入力いただいたメールアドレス宛に、応募完了のご案内をお送りしました。
              届かない場合は迷惑メールフォルダもご確認ください。
            </p>
            <Link
              href="/caredent/signup"
              className="inline-block mt-3 text-sm font-semibold text-[#4592c0] hover:underline"
            >
              アカウントを作成して応募状況を管理する →
            </Link>
          </div>
        )}

        {!isGuest && (
          <div className="mt-6 p-4 rounded-xl bg-gray-50 border border-gray-200 text-left">
            <p className="text-sm text-gray-600 leading-relaxed">
              応募状況はマイページの「応募・参加したボランティア」から確認できます。
            </p>
            <Link
              href="/caredent/log"
              className="inline-block mt-3 text-sm font-semibold text-[#4592c0] hover:underline"
            >
              応募状況を確認する →
            </Link>
          </div>
        )}

        {/* ホームに戻る */}
        <Link
          href="/caredent"
          className="block w-full mt-8 py-4 rounded-full bg-[#4592c0] hover:bg-[#3a7ea8] active:scale-[0.98] text-white text-base font-bold text-center shadow-lg transition-all"
        >
          ホームに戻る
        </Link>
      </div>
    </div>
  )
}
