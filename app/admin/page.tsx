import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { approvePublisher, rejectPublisher } from './actions'

type PendingPublisher = {
  id: string
  name: string | null
  organization: string | null
  approved: boolean
  created_at: string
  email?: string
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
}

export default async function AdminPage() {
  // 管理者チェック
  let isAdmin = false
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    isAdmin = user?.email === process.env.ADMIN_EMAIL
  } catch {
    // ignore
  }

  if (!isAdmin) redirect('/')

  // 承認待ち・承認済みpublisher一覧をサービスロールで取得
  let pending: PendingPublisher[] = []
  let approved: PendingPublisher[] = []

  try {
    const adminClient = createAdminClient()
    const { data: profiles } = await adminClient
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (profiles && profiles.length > 0) {
      // auth.usersからメールアドレスを取得
      const { data: { users } } = await adminClient.auth.admin.listUsers()
      const emailMap = Object.fromEntries(users.map((u) => [u.id, u.email]))

      const withEmail = profiles.map((p) => ({ ...p, email: emailMap[p.id] ?? '' }))
      pending = withEmail.filter((p) => !p.approved)
      approved = withEmail.filter((p) => p.approved)
    }
  } catch {
    // ignore
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">管理者パネル</h1>
        <p className="text-sm text-gray-500 mt-1">パブリッシャー申請の承認・拒否</p>
      </div>

      {/* 承認待ち */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
            {pending.length}
          </span>
          承認待ち
        </h2>

        {pending.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">
            承認待ちの申請はありません
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">担当者名</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">団体名</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">メール</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">申請日</th>
                  <th className="text-right text-xs font-semibold text-gray-500 px-6 py-3">操作</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((pub, i) => {
                  const approveAction = approvePublisher.bind(null, pub.id)
                  const rejectAction = rejectPublisher.bind(null, pub.id)
                  return (
                    <tr key={pub.id} className={`${i < pending.length - 1 ? 'border-b border-gray-100' : ''} hover:bg-gray-50`}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{pub.name ?? '—'}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">{pub.organization ?? '—'}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">{pub.email}</td>
                      <td className="px-4 py-4 text-sm text-gray-500">{formatDate(pub.created_at)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <form action={approveAction}>
                            <button
                              type="submit"
                              className="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                            >
                              承認
                            </button>
                          </form>
                          <form action={rejectAction}>
                            <button
                              type="submit"
                              className="text-xs px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-medium"
                            >
                              拒否
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 承認済み */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">承認済みパブリッシャー</h2>
        {approved.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">
            承認済みのパブリッシャーはいません
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">担当者名</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">団体名</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">メール</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">登録日</th>
                </tr>
              </thead>
              <tbody>
                {approved.map((pub, i) => (
                  <tr key={pub.id} className={`${i < approved.length - 1 ? 'border-b border-gray-100' : ''}`}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{pub.name ?? '—'}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{pub.organization ?? '—'}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{pub.email}</td>
                    <td className="px-4 py-4 text-sm text-gray-500">{formatDate(pub.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
