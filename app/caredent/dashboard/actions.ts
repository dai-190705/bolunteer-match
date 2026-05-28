'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function createProgram(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/caredent/login')

  const tagsRaw = (formData.get('tags') as string) ?? ''
  const tags = tagsRaw
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)

  const deadline = (formData.get('deadline') as string) || null

  const bannerImageUrl = (formData.get('banner_image_url') as string) || null
  const category = (formData.get('category') as string) || null

  const capacityRaw = (formData.get('capacity') as string) || null
  const capacity = capacityRaw ? parseInt(capacityRaw, 10) : null

  const { error } = await supabase.from('programs').insert({
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    target: (formData.get('target') as string) || null,
    deadline,
    apply_url: (formData.get('apply_url') as string) || null,
    tags: tags.length > 0 ? tags : null,
    published: formData.get('published') === 'true',
    publisher_id: user.id,
    banner_image_url: bannerImageUrl,
    category,
    cancel_policy: (formData.get('cancel_policy') as string) || null,
    notes: (formData.get('notes') as string) || null,
    capacity,
  })

  if (error) throw new Error('処理に失敗しました。もう一度お試しください。')

  revalidatePath('/caredent/dashboard')
  revalidatePath('/caredent')
  redirect('/caredent/dashboard')
}

export async function updateProgram(id: string, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/caredent/login')

  const tagsRaw = (formData.get('tags') as string) ?? ''
  const tags = tagsRaw
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)

  const deadline = (formData.get('deadline') as string) || null

  const bannerImageUrl = (formData.get('banner_image_url') as string) || null
  const category = (formData.get('category') as string) || null

  const capacityRaw = (formData.get('capacity') as string) || null
  const capacity = capacityRaw ? parseInt(capacityRaw, 10) : null

  const { error } = await supabase
    .from('programs')
    .update({
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      target: (formData.get('target') as string) || null,
      deadline,
      apply_url: (formData.get('apply_url') as string) || null,
      tags: tags.length > 0 ? tags : null,
      published: formData.get('published') === 'true',
      banner_image_url: bannerImageUrl,
      category,
      cancel_policy: (formData.get('cancel_policy') as string) || null,
      notes: (formData.get('notes') as string) || null,
      capacity,
    })
    .eq('id', id)
    .eq('publisher_id', user.id)

  if (error) throw new Error('処理に失敗しました。もう一度お試しください。')

  revalidatePath('/caredent/dashboard')
  revalidatePath('/caredent')
  revalidatePath(`/caredent/programs/${id}`)
  redirect('/caredent/dashboard')
}

export async function deleteProgram(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/caredent/login')

  const { error } = await supabase
    .from('programs')
    .delete()
    .eq('id', id)
    .eq('publisher_id', user.id)

  if (error) throw new Error('処理に失敗しました。もう一度お試しください。')

  revalidatePath('/caredent/dashboard')
  revalidatePath('/caredent')
}

export async function togglePublished(id: string, currentValue: boolean) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/caredent/login')

  const { error } = await supabase
    .from('programs')
    .update({ published: !currentValue })
    .eq('id', id)
    .eq('publisher_id', user.id)

  if (error) throw new Error('処理に失敗しました。もう一度お試しください。')

  revalidatePath('/caredent/dashboard')
  revalidatePath('/caredent')
}

export async function markAsCompleted(applicationId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/caredent/login')

  const { error } = await supabase
    .from('applications')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', applicationId)

  if (error) throw new Error('処理に失敗しました。もう一度お試しください。')

  revalidatePath('/caredent/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/caredent/login')
}
