import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import type { EmailOtpType } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { notifyNewPublisherApplication } from '@/app/actions/notify'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  // メール認証（signupの確認メール）
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const user = data.user
      const meta = user.user_metadata ?? {}

      // サービスロールでプロフィールを作成
      const adminClient = createSupabaseAdmin(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      if (meta.role === 'publisher') {
        // publisherプロフィールを作成（未承認状態）
        await adminClient.from('profiles').upsert({
          id: user.id,
          name: meta.name ?? null,
          organization: meta.organization ?? null,
          approved: false,
        })
        // 管理者にメール通知
        await notifyNewPublisherApplication({
          name: meta.name ?? '',
          organization: meta.organization ?? '',
          email: user.email ?? '',
        })
        // ログアウトして承認待ち画面へ
        await supabase.auth.signOut()
        return NextResponse.redirect(`${origin}/publisher-pending`)
      } else {
        // 学生プロフィールを作成
        await adminClient.from('student_profiles').upsert({
          id: user.id,
          last_name: meta.last_name ?? '',
          first_name: meta.first_name ?? '',
          last_name_kana: meta.last_name_kana ?? '',
          first_name_kana: meta.first_name_kana ?? '',
          school: meta.school ?? '',
          user_handle: meta.user_handle ?? null,
          nickname: meta.nickname ?? null,
        })
        return NextResponse.redirect(`${origin}/mypage`)
      }
    }
  }

  // OTPリンク（パスワードリセット等）
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type: type as EmailOtpType })
    if (!error) {
      // パスワードリセットの場合は set-password ページへ
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/auth/set-password`)
      }
      return NextResponse.redirect(`${origin}/mypage`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=認証リンクが無効です`)
}
