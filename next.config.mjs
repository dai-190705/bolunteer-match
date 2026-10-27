/** @type {import('next').NextConfig} */
const nextConfig = {
  // 画像は既定だと毎回取り直しになり、SNSのリンクプレビュー用ボットが同じ画像を何度もダウンロードして
  // 転送量を圧迫していたため、一定期間キャッシュさせる
  async headers() {
    return [
      {
        source: '/:path*.(jpg|jpeg|png|webp|svg)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }],
      },
      {
        source: '/icon.jpg',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=604800' }],
      },
    ]
  },
}

export default nextConfig
