'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function applyToProgram(programId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect(`/login?next=/programs/${programId}`)

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

  revalidatePath(`/programs/${programId}`)
  redirect(`/programs/${programId}`)
}
