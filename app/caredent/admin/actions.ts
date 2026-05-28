'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { notifyPublisherApproved, notifyPublisherRejected } from '@/app/actions/notify'

async function isAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  return user.email === process.env.ADMIN_EMAIL
}

export async function approvePublisher(userId: string) {
  if (!(await isAdmin())) throw new Error('Unauthorized')

  const adminClient = createAdminClient()

  // プロフィール取得（名前・団体名）
  const { data: profile } = await adminClient
    .from('profiles')
    .select('name, organization')
    .eq('id', userId)
    .single()

  // メールアドレス取得
  const { data: { user: authUser } } = await adminClient.auth.admin.getUserById(userId)

  // 承認
  await adminClient
    .from('profiles')
    .update({ approved: true })
    .eq('id', userId)

  // 承認完了メールをパブリッシャーに送信
  if (authUser?.email && profile) {
    await notifyPublisherApproved({
      email: authUser.email,
      name: profile.name ?? '',
      organization: profile.organization ?? '',
    })
  }

  revalidatePath('/admin')
}

export async function rejectPublisher(userId: string) {
  if (!(await isAdmin())) throw new Error('Unauthorized')

  const adminClient = createAdminClient()

  // メール送信用に事前に情報取得
  const { data: profile } = await adminClient
    .from('profiles')
    .select('name, organization')
    .eq('id', userId)
    .single()
  const { data: { user: authUser } } = await adminClient.auth.admin.getUserById(userId)

  // profilesから削除
  await adminClient.from('profiles').delete().eq('id', userId)
  // auth.usersからも削除
  await adminClient.auth.admin.deleteUser(userId)

  // 拒否メールを送信
  if (authUser?.email && profile) {
    await notifyPublisherRejected({
      email: authUser.email,
      name: profile.name ?? '',
      organization: profile.organization ?? '',
    })
  }

  revalidatePath('/admin')
}
