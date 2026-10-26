import Redirect from './Redirect'

// next.config の redirects だとページが描画されず Vercel Web Analytics に記録されないため、
// 一度ページを表示してページビューを計測してから遷移する。
export default function RelayPage({ url, destination }: { url: string; destination: string }) {
  return (
    <>
      <meta httpEquiv="refresh" content={`2;url=${url}`} />
      <Redirect url={url} />
      <div className="min-h-screen flex items-center justify-center px-6 text-center" style={{ color: '#19365B' }}>
        <div>
          <p className="font-bold mb-3">{destination}へ移動しています…</p>
          <p className="text-sm">
            自動で移動しない場合は
            <a href={url} className="underline underline-offset-4 mx-1">
              こちら
            </a>
            をクリックしてください。
          </p>
        </div>
      </div>
    </>
  )
}
