'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { notifyNewPublisherApplication } from '@/app/actions/notify'

export async function submitPublisherApplication(data: {
  email: string
  password: string
  name: string
  organization: string
  orgType: string
  orgCategoryMain: string
  orgCategorySub: string
  websiteUrl: string
}) {
  const adminClient = createAdminClient()

  // admin APIでユーザー作成（確認メールを送らない）
  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true, // メール確認をスキップ（メール送信なし）
    user_metadata: {
      role: 'publisher',
      name: data.name,
      organization: data.organization,
      org_type: data.orgType,
      org_category_main: data.orgCategoryMain,
      org_category_sub: data.orgCategorySub,
      website_url: data.websiteUrl,
    },
  })

  if (createError || !created.user) {
    // メールアドレス重複エラーの場合
    if (createError?.message?.includes('already registered')) {
      throw new Error('このメールアドレスはすでに登録されています。')
    }
    throw new Error('登録に失敗しました。入力内容を確認してもう一度お試しください。')
  }

  const userId = created.user.id

  // profilesテーブルに未承認状態で登録
  await adminClient.from('profiles').upsert({
    id: userId,
    name: data.name,
    organization: data.organization,
    approved: false,
  })

  // 管理者にメール通知
  await notifyNewPublisherApplication({
    name: data.name,
    organization: data.organization,
    email: data.email,
  })
}
