'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function createProgram(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const tagsRaw = (formData.get('tags') as string) ?? ''
  const tags = tagsRaw
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)

  const deadline = (formData.get('deadline') as string) || null

  const bannerImageUrl = (formData.get('banner_image_url') as string) || null
  const category = (formData.get('category') as string) || null

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
  })

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard')
  revalidatePath('/')
  redirect('/dashboard')
}

export async function updateProgram(id: string, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const tagsRaw = (formData.get('tags') as string) ?? ''
  const tags = tagsRaw
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)

  const deadline = (formData.get('deadline') as string) || null

  const bannerImageUrl = (formData.get('banner_image_url') as string) || null
  const category = (formData.get('category') as string) || null

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
    })
    .eq('id', id)
    .eq('publisher_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard')
  revalidatePath('/')
  revalidatePath(`/programs/${id}`)
  redirect('/dashboard')
}

export async function deleteProgram(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { error } = await supabase
    .from('programs')
    .delete()
    .eq('id', id)
    .eq('publisher_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard')
  revalidatePath('/')
}

export async function togglePublished(id: string, currentValue: boolean) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { error } = await supabase
    .from('programs')
    .update({ published: !currentValue })
    .eq('id', id)
    .eq('publisher_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard')
  revalidatePath('/')
}

export async function markAsCompleted(applicationId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { error } = await supabase
    .from('applications')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', applicationId)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
