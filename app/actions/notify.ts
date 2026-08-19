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
    const result = await resend.emails.send({
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
                href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.nocsy.me'}/caredent/login"
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

export async function notifyPublisherRejected({
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
      subject: '【Caredent】パブリッシャー申請の審査結果について',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background: #f9fafb;">
          <div style="background: white; border-radius: 16px; padding: 32px; border: 1px solid #e5e7eb;">
            <div style="text-align: center; margin-bottom: 28px;">
              <span style="font-size: 26px; font-weight: 800; color: #4592c0;">Caredent</span>
            </div>

            <h2 style="color: #111827; font-size: 20px; margin: 0 0 12px;">申請の審査結果について</h2>

            <p style="color: #6b7280; font-size: 14px; line-height: 1.8; margin: 0 0 24px;">
              ${name} 様<br /><br />
              ${organization} のパブリッシャー申請について審査した結果、<br />
              誠に恐れながら今回はご登録をお見送りさせていただくこととなりました。
            </p>

            <p style="color: #6b7280; font-size: 14px; line-height: 1.8; margin: 0 0 24px;">
              ご不明な点がございましたら、お手数ですがCaredentまでお問い合わせください。
            </p>

            <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 24px 0;" />

            <p style="color: #d1d5db; font-size: 11px; text-align: center; margin: 0;">
              このメールはCaredentのシステムから自動送信されています。
            </p>
          </div>
        </div>
      `,
    })
  } catch (err) {
    console.error('Failed to send rejection email:', err)
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
                href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.nocsy.me'}/caredent/admin"
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

function formatDateJa(d: string | null) {
  if (!d) return ''
  const dt = new Date(d)
  return `${dt.getFullYear()}年${dt.getMonth() + 1}月${dt.getDate()}日`
}

function formatProgramSchedule(p: {
  schedule_type: string | null
  event_date: string | null
  event_end_date: string | null
  event_dates: string[] | null
}): string {
  switch (p.schedule_type) {
    case 'anytime':
      return '随時募集'
    case 'range':
      return p.event_date && p.event_end_date
        ? `${formatDateJa(p.event_date)} 〜 ${formatDateJa(p.event_end_date)}`
        : formatDateJa(p.event_date)
    case 'multiple':
      return (p.event_dates ?? []).map(formatDateJa).filter(Boolean).join('、')
    default:
      return formatDateJa(p.event_date)
  }
}

/**
 * ゲスト応募の完了メールを応募者へ送信する。
 * クライアントから渡された宛先をそのまま信用せず、
 * 実際に応募レコードが存在する場合のみ送信する（迷惑メール送信の防止）。
 */
export async function notifyGuestApplicationReceived({
  programId,
  email,
}: {
  programId: string
  email: string
}) {
  if (!process.env.RESEND_API_KEY) return

  try {
    const { createAdminClient } = await import('@/utils/supabase/admin')
    const admin = createAdminClient()

    // 応募実体の確認（ゲスト応募のみ）
    const { data: application } = await admin
      .from('applications')
      .select('id, guest_name, guest_email, program_id')
      .eq('program_id', programId)
      .is('student_id', null)
      .ilike('guest_email', email)
      .maybeSingle()

    if (!application?.guest_email) return

    const { data: program } = await admin
      .from('programs')
      .select('title, schedule_type, event_date, event_end_date, event_dates, location_type, location, cancel_policy, notes')
      .eq('id', programId)
      .single()

    if (!program) return

    const schedule = formatProgramSchedule(program)
    const place =
      program.location_type === 'online' ? 'オンライン' : program.location ?? ''
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.nocsy.me'

    const detailRow = (label: string, value: string) =>
      value
        ? `<tr style="border-bottom: 1px solid #f3f4f6;">
             <td style="padding: 12px 8px 12px 0; color: #9ca3af; width: 110px; vertical-align: top;">${label}</td>
             <td style="padding: 12px 0; color: #111827;">${value}</td>
           </tr>`
        : ''

    await resend.emails.send({
      from: 'Caredent <no-reply@nocsy.me>',
      to: application.guest_email,
      subject: `【Caredent】応募を受け付けました：${program.title}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background: #f9fafb;">
          <div style="background: white; border-radius: 16px; padding: 32px; border: 1px solid #e5e7eb;">
            <div style="text-align: center; margin-bottom: 24px;">
              <span style="font-size: 24px; font-weight: 800; color: #4592c0;">Caredent</span>
            </div>

            <h2 style="color: #111827; font-size: 20px; margin: 0 0 16px;">応募を受け付けました 🎉</h2>

            <p style="color: #6b7280; font-size: 14px; line-height: 1.8; margin: 0 0 24px;">
              ${application.guest_name ?? ''} 様<br /><br />
              下記のボランティアへのご応募ありがとうございます。<br />
              担当者からの連絡をお待ちください。
            </p>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
              ${detailRow('ボランティア', program.title)}
              ${detailRow('開催日程', schedule)}
              ${detailRow('開催場所', place)}
            </table>

            ${
              program.cancel_policy || program.notes
                ? `<div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                     <p style="margin: 0 0 8px; font-size: 13px; font-weight: 700; color: #92400e;">ご確認ください</p>
                     ${
                       program.cancel_policy
                         ? `<p style="margin: 0 0 8px; font-size: 13px; color: #b45309; line-height: 1.7; white-space: pre-wrap;">${program.cancel_policy}</p>`
                         : ''
                     }
                     ${
                       program.notes
                         ? `<p style="margin: 0; font-size: 13px; color: #b45309; line-height: 1.7; white-space: pre-wrap;">${program.notes}</p>`
                         : ''
                     }
                   </div>`
                : ''
            }

            <div style="background: #f3f4f6; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
              <p style="margin: 0 0 10px; font-size: 13px; color: #4b5563; line-height: 1.7;">
                アカウントを作成すると、応募状況の確認やポートフォリオの作成ができます。
              </p>
              <a href="${appUrl}/caredent/signup" style="display: inline-block; background: #4592c0; color: white; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 700;">
                アカウントを作成する →
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
    // メール送信に失敗しても応募自体は成立させる
    console.error('Failed to send guest application email:', err)
  }
}
