'use server'

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function notifyPublisherApproved({
  email,
  name,
  organization,
}: {
  email: string
  name: string
  organization: string
}) {
  if (!process.env.RESEND_API_KEY) return

  try {
    await resend.emails.send({
      from: 'Caredent <no-reply@nocsy.me>',
      to: email,
      subject: '【Caredent】パブリッシャー申請が承認されました',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background: #f9fafb;">
          <div style="background: white; border-radius: 16px; padding: 32px; border: 1px solid #e5e7eb;">
            <div style="text-align: center; margin-bottom: 24px;">
              <span style="font-size: 24px; font-weight: 800; color: #4592c0;">Caredent</span>
            </div>

            <h2 style="color: #111827; font-size: 20px; margin: 0 0 16px;">申請が承認されました 🎉</h2>

            <p style="color: #6b7280; font-size: 14px; line-height: 1.8; margin: 0 0 24px;">
              ${name} 様<br /><br />
              ${organization} のパブリッシャー申請が承認されました。<br />
              以下のボタンからログインして、プログラムの掲載を開始してください。
            </p>

            <div style="text-align: center; margin: 32px 0;">
              <a
                href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.nocsy.me'}/login"
                style="display: inline-block; background: #4592c0; color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 15px; font-weight: 700;"
              >
                ログインする →
              </a>
            </div>

            <p style="margin: 24px 0 0; color: #9ca3af; font-size: 12px; text-align: center;">
              このメールはCaredentのシステムから自動送信されています。
            </p>
          </div>
        </div>
      `,
    })
  } catch (err) {
    console.error('Failed to send approval email:', err)
  }
}

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
      from: 'Caredent <no-reply@nocsy.me>',
      to: adminEmail,
      subject: '【Caredent】新規パブリッシャー申請が届きました',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background: #f9fafb;">
          <div style="background: white; border-radius: 16px; padding: 32px; border: 1px solid #e5e7eb;">
            <div style="text-align: center; margin-bottom: 24px;">
              <span style="font-size: 24px; font-weight: 800; color: #4592c0;">Caredent</span>
            </div>

            <h2 style="color: #111827; font-size: 20px; margin: 0 0 16px;">新規パブリッシャー申請</h2>
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px;">以下の内容で新しい申請が届きました。管理画面から承認または却下してください。</p>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
              <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 12px 8px 12px 0; color: #9ca3af; width: 120px;">担当者名</td>
                <td style="padding: 12px 0; color: #111827;">${name}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 12px 8px 12px 0; color: #9ca3af;">団体・組織名</td>
                <td style="padding: 12px 0; color: #111827;">${organization}</td>
              </tr>
              <tr>
                <td style="padding: 12px 8px 12px 0; color: #9ca3af;">メールアドレス</td>
                <td style="padding: 12px 0; color: #111827;">${email}</td>
              </tr>
            </table>

            <div style="text-align: center;">
              <a
                href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.nocsy.me'}/admin"
                style="display: inline-block; background: #4592c0; color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 15px; font-weight: 700;"
              >
                管理画面で確認する →
              </a>
            </div>

            <p style="margin: 24px 0 0; color: #9ca3af; font-size: 12px; text-align: center;">
              このメールはCaredentのシステムから自動送信されています。
            </p>
          </div>
        </div>
      `,
    })
  } catch (err) {
    // メール送信失敗しても申請自体は通す
    console.error('Failed to send notification email:', err)
  }
}
