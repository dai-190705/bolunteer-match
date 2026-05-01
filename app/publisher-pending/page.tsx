import Link from 'next/link'

export default function PublisherPendingPage() {
  return (
    <div className="min-h-[calc(100vh-65px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10">
          <div className="text-4xl mb-4">⏳</div>
          <h1 className="text-xl font-bold text-gray-900 mb-3">申請を受け付けました</h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            メールアドレスの確認が完了しました。<br />
            管理者が内容を確認後、承認いたします。<br /><br />
            承認が完了したら{' '}
            <Link href="/login" className="text-indigo-600 hover:text-indigo-800 font-medium">
              こちらからログイン
            </Link>
            してください。
          </p>
        </div>
      </div>
    </div>
  )
}
