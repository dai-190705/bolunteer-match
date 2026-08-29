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
//   time: '10:00〜15:00',           // 省略可
//   place: '堺市北区百舌鳥梅北町1丁',
//   target: '高校生・大学生',
//   fee: '4,000円（お1人につき）',    // 省略可
//   description: '地域のお祭りを題材に、企画から運営までを体験する2日間のワークショップです。',
//   imageUrl: '/event-sodachi.png',  // 省略可
//   applyUrl: 'https://example.com/form',  // 申込先。省略するとお問い合わせへ誘導します
// },

export type NocsyEvent = {
  id: string
  title: string
  date: string
  endDate?: string
  time?: string
  place?: string
  target?: string
  fee?: string
  description: string
  imageUrl?: string
  applyUrl?: string
}

export const EVENTS: NocsyEvent[] = [
  {
    id: 'kodomo-omiseyasan-fes-2026',
    title: 'こどもお店屋さんフェス',
    date: '2026-09-06',
    time: '10:00〜15:00（9:45 開場）',
    place: 'Sodachi（堺市北区百舌鳥梅北町4-194）',
    target: '小学生',
    fee: '4,000円（お1人につき）',
    imageUrl: '/events/kodomo-omiseyasan-fes.png',
    applyUrl: 'https://forms.gle/SaEjeu7aXRxkxGiQA',
    description: `9月6日（日）開催！こどもお店屋さんフェス！

今回は、小学生がお金とビジネスの感覚を学ぶことのできるイベント「こどもお店屋さんフェス」の第一回です✨
普段の休日、子どものと遊びに遊園地や公園に遊びに行ってるが、だんだん飽きてきた。そんなお母様お父様いませんか？せっかくの休日、遊びに行くなら楽しく学べるイベントに参加しませんか？😆

〈イベントの魅力〉
・チラシに記載された5つの商品から、好きな商品を選び自分だけのお店をデザインします✏️
・イベント内の架空の通貨を使って販売を行なって、金銭感覚を学べます💰
・学生のメンターが1対1で付くので、お子様のペースに合わせてサポートできます🧑‍🎓
・お昼ご飯はミートパスタを用意します🍝（※アレルギーなどある場合は、事前にご連絡ください。）
・誰に売る商品なのか？どんなお店の名前なら良いか？まで考える、知育ワークショップです🧐
・ワークショップ中は、親御様は会場を離れてもOK🙆‍♀️（スタッフには保育士の方がいます。）

〈タイムスケジュール〉
9:45 開場
10:00 オープニング&アイスブレイク
10:40 商品選び
10:50 お店決めワーク（ワークシートを用意します）
12:00 お昼ご飯
13:00 商品・看板など作成
14:00 開店
14:30 クロージング

〈こんな方に来てほしい！〉
・どうせ遊ぶなら少し学びになる遊びをさせたいお母さん
・金融教育、探究教育に関心のあるお母さん
・想像力や思考力、行動力を鍛えさせたいお母さん
・積極性があり、好奇心旺盛なお子さん

その他お問い合せは、daito.yasui@nocsy.meまで。`,
  },
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

/** id からイベントを1件取得する（詳細ページ用） */
export function getEventById(id: string): NocsyEvent | undefined {
  return EVENTS.find((e) => e.id === id)
}

/** 一覧カード用に説明文を短く切り詰める（詳細ページで全文を読ませるため） */
export function truncateDescription(description: string, maxLength = 120): string {
  const singleLine = description.replace(/\n+/g, ' ').trim()
  if (singleLine.length <= maxLength) return singleLine
  return singleLine.slice(0, maxLength) + '…'
}
