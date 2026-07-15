import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

// ポートフォリオは公開ページ /caredent/[handle] に統合。自分のハンドルへリダイレクト。
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

  let handle: string | null = null
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('student_profiles')
      .select('user_handle')
      .eq('id', user.id)
      .maybeSingle()
    handle = (data?.user_handle as string | null) ?? null
  } catch {
    // ignore
  }

  redirect(`/caredent/${handle || user.id}`)
}
