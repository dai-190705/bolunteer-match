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
  org_type?: string | null
  org_category_main?: string | null
  org_category_sub?: string | null
  website_url?: string | null
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
}

export default async function AdminPage() {
  let isAdmin = false
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    isAdmin = user?.email === process.env.ADMIN_EMAIL
  } catch {
    // ignore
  }

  if (!isAdmin) redirect('/caredent/admin/login')

  let pending: PendingPublisher[] = []
  let approved: PendingPublisher[] = []

  try {
    const adminClient = createAdminClient()
    const { data: profiles } = await adminClient
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (profiles && profiles.length > 0) {
      const { data: { users } } = await adminClient.auth.admin.listUsers()
      const userMap = Object.fromEntries(users.map((u) => [u.id, u]))

      const withMeta = profiles.map((p) => {
        const u = userMap[p.id]
        const meta = u?.user_metadata ?? {}
        return {
          ...p,
          email: u?.email ?? '',
          org_type: meta.org_type ?? null,
          org_category_main: meta.org_category_main ?? null,
          org_category_sub: meta.org_category_sub ?? null,
          website_url: meta.website_url ?? null,
        }
      })
      pending = withMeta.filter((p) => !p.approved)
      approved = withMeta.filter((p) => p.approved)
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
          <div className="space-y-4">
            {pending.map((pub) => {
              const approveAction = approvePublisher.bind(null, pub.id)
              const rejectAction = rejectPublisher.bind(null, pub.id)
              return (
                <div key={pub.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="font-semibold text-gray-900 text-base">{pub.organization ?? '—'}</div>
                      <div className="text-sm text-gray-500 mt-0.5">{pub.name ?? '—'} ・ {pub.email}</div>
                      <div className="text-xs text-gray-400 mt-0.5">申請日: {formatDate(pub.created_at)}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <form action={approveAction}>
                        <button
                          type="submit"
                          className="text-xs px-4 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                        >
                          承認
                        </button>
                      </form>
                      <form action={rejectAction}>
                        <button
                          type="submit"
                          className="text-xs px-4 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-medium"
                        >
                          拒否
                        </button>
                      </form>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                    <div>
                      <dt className="text-xs font-medium text-gray-400 mb-0.5">組織の形式</dt>
                      <dd className="text-sm text-gray-700">{pub.org_type ?? '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-gray-400 mb-0.5">種類（大分類）</dt>
                      <dd className="text-sm text-gray-700">{pub.org_category_main ?? '—'}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-xs font-medium text-gray-400 mb-0.5">種類（中分類）</dt>
                      <dd className="text-sm text-gray-700">{pub.org_category_sub ?? '—'}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-xs font-medium text-gray-400 mb-0.5">WebサイトまたはSNSアカウントURL</dt>
                      <dd className="text-sm">
                        {pub.website_url
                          ? <a href={pub.website_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline break-all">{pub.website_url}</a>
                          : <span className="text-gray-400">—</span>
                        }
                      </dd>
                    </div>
                  </div>
                </div>
              )
            })}
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
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">担当者名</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">団体名</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">メール</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 whitespace-nowrap">登録日</th>
                  </tr>
                </thead>
                <tbody>
                  {approved.map((pub, i) => (
                    <tr key={pub.id} className={`${i < approved.length - 1 ? 'border-b border-gray-100' : ''}`}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{pub.name ?? '—'}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">{pub.organization ?? '—'}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">{pub.email}</td>
                      <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">{formatDate(pub.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
