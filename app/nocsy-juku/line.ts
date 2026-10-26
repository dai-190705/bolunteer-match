export const LINE_URL = 'https://line.me/R/ti/p/@545kmxeh'

// どのボタンからLINEへ遷移したかを Vercel Web Analytics で区別するため、位置ごとに中継URLを分ける
export const LINE_POSITIONS = ['header', 'hero', 'middle', 'bottom', 'detail'] as const
export type LinePosition = (typeof LINE_POSITIONS)[number]
