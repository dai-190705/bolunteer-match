'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function applyToProgram(programId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect(`/caredent/login?next=/caredent/programs/${programId}`)

  try {
    const { error } = await supabase.from('applications').insert({
      program_id: programId,
      student_id: user.id,
    })

    if (error) throw new Error(error.message)
  } catch (e) {
    // If already applied (unique constraint), silently ignore
    console.error(e)
  }

  revalidatePath(`/caredent/programs/${programId}`)
  redirect(`/caredent/programs/${programId}`)
}

export async function cancelApplication(applicationId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/caredent/login')

  // 本人の "applied" 状態の応募のみ削除できる
  const { error } = await supabase
    .from('applications')
    .delete()
    .eq('id', applicationId)
    .eq('student_id', user.id)
    .eq('status', 'applied')

  if (error) {
    console.error('cancelApplication error:', error)
    return
  }

  revalidatePath('/caredent/log')
}
