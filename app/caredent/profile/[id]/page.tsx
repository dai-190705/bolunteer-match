import { redirect } from 'next/navigation'

// 公開プロフィールは /caredent/[handle] に統合。旧URLはリダイレクト。
export default async function LegacyProfileRedirect({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  redirect(`/caredent/${id}`)
}
