// 探究イベントの一覧データ
//
// ▼ イベントを追加するには、下の EVENTS 配列にオブジェクトを足すだけです。
//    日付は 'YYYY-MM-DD' 形式で入力してください（開催日が過ぎると自動で「過去のイベント」へ移動します）。
//    画像は public/ 配下に置き、'/ファイル名.png' のように指定します（省略可）。
//
// 例：
// {
//   id: 'sodachi-2026',
//   title: 'ソダチ祭 探究ワークショップ',
//   date: '2026-08-01',
//   endDate: '2026-08-02',        // 複数日開催のときだけ指定（省略可）
//   place: '堺市北区百舌鳥梅北町1丁',
//   target: '高校生・大学生',
//   description: '地域のお祭りを題材に、企画から運営までを体験する2日間のワークショップです。',
//   imageUrl: '/event-sodachi.png',  // 省略可
//   applyUrl: 'https://example.com/form',  // 申込先。省略するとお問い合わせへ誘導します
// },

export type NocsyEvent = {
  id: string
  title: string
  date: string
  endDate?: string
  place?: string
  target?: string
  description: string
  imageUrl?: string
  applyUrl?: string
}

export const EVENTS: NocsyEvent[] = [
  // ここにイベントを追加してください
]

function endOfDay(dateStr: string) {
  const d = new Date(dateStr)
  d.setHours(23, 59, 59, 999)
  return d
}

/** 開催予定（終了日 or 開催日が今日以降）のイベントを、開催が近い順に返す */
export function getUpcomingEvents(): NocsyEvent[] {
  const now = new Date()
  return EVENTS.filter((e) => endOfDay(e.endDate ?? e.date) >= now).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )
}

/** 終了したイベントを、新しい順に返す */
export function getPastEvents(): NocsyEvent[] {
  const now = new Date()
  return EVENTS.filter((e) => endOfDay(e.endDate ?? e.date) < now).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

export function formatEventDate(e: NocsyEvent): string {
  const f = (s: string) => {
    const d = new Date(s)
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
  }
  return e.endDate ? `${f(e.date)} 〜 ${f(e.endDate)}` : f(e.date)
}
