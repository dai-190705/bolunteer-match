import type { Metadata } from 'next'
import FormRedirect from './FormRedirect'

const FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSckVaMqKNoxww9dKCPJ1V2yM6kV5KlIUOxeajoYbGy9bTaK4w/viewform'

export const metadata: Metadata = {
  title: '資料請求フォームへ移動しています | NOCSY塾',
  robots: { index: false, follow: false },
}

// next.config の redirects だとページが描画されず Vercel Web Analytics に記録されないため、
// 一度ページを表示してページビューを計測してから遷移する。
export default function GoFormPage() {
  return (
    <>
      <meta httpEquiv="refresh" content={`2;url=${FORM_URL}`} />
      <FormRedirect url={FORM_URL} />
      <div className="min-h-screen flex items-center justify-center px-6 text-center" style={{ color: '#19365B' }}>
        <div>
          <p className="font-bold mb-3">資料請求フォームへ移動しています…</p>
          <p className="text-sm">
            自動で移動しない場合は
            <a href={FORM_URL} className="underline underline-offset-4 mx-1">
              こちら
            </a>
            をクリックしてください。
          </p>
        </div>
      </div>
    </>
  )
}
