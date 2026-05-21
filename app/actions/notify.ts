'use server'

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function notifyNewPublisherApplication({
  name,
  organization,
  email,
}: {
  name: string
  organization: string
  email: string
}) {
  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail || !process.env.RESEND_API_KEY) return

  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: adminEmail,
      subject: '【探究プログラム】新規パブリッシャー申請が届きました',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #1e1e1e; margin-bottom: 8px;">新規パブリッシャー申請</h2>
          <p style="color: #555; margin-bottom: 24px;">以下の内容で新しい申請が届きました。管理画面から承認または却下してください。</p>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 12px 0; color: #888; width: 120px; font-size: 14px;">担当者名</td>
              <td style="padding: 12px 0; color: #1e1e1e; font-size: 14px;">${name}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 12px 0; color: #888; font-size: 14px;">団体・組織名</td>
              <td style="padding: 12px 0; color: #1e1e1e; font-size: 14px;">${organization}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; color: #888; font-size: 14px;">メールアドレス</td>
              <td style="padding: 12px 0; color: #1e1e1e; font-size: 14px;">${email}</td>
            </tr>
          </table>

          <a
            href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://tankyuu-program.vercel.app'}/admin"
            style="display: inline-block; background: #4f46e5; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600;"
          >
            管理画面で確認する →
          </a>

          <p style="margin-top: 32px; color: #aaa; font-size: 12px;">
            このメールは探究プログラムのシステムから自動送信されています。
          </p>
        </div>
      `,
    })
  } catch (err) {
    // メール送信失敗しても申請自体は通す
    console.error('Failed to send notification email:', err)
  }
}
