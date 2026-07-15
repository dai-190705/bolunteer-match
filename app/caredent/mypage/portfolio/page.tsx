import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

// ポートフォリオは公開ページ /caredent/[userId] に統合。自分のIDへリダイレクト。
export default async function PortfolioRedirect() {
  let user = null
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    user = authUser
  } catch {
    // ignore
  }

  if (!user) redirect('/caredent/login')
  redirect(`/caredent/${user.id}`)
}
