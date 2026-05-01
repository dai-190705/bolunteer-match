'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

async function isAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  return user.email === process.env.ADMIN_EMAIL
}

export async function approvePublisher(userId: string) {
  if (!(await isAdmin())) throw new Error('Unauthorized')

  const adminClient = createAdminClient()
  await adminClient
    .from('profiles')
    .update({ approved: true })
    .eq('id', userId)

  revalidatePath('/admin')
}

export async function rejectPublisher(userId: string) {
  if (!(await isAdmin())) throw new Error('Unauthorized')

  const adminClient = createAdminClient()
  // profilesから削除
  await adminClient.from('profiles').delete().eq('id', userId)
  // auth.usersからも削除
  await adminClient.auth.admin.deleteUser(userId)

  revalidatePath('/admin')
}
