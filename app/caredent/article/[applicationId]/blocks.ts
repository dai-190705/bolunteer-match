// 記事のブロックモデルとマークダウン相互変換（エディタ・公開ビュー共用）

export type Block =
  | { id: string; type: 'heading'; text: string }
  | { id: string; type: 'paragraph'; text: string }
  | { id: string; type: 'image'; url: string }
  | { id: string; type: 'bullet'; items: string[] }
  | { id: string; type: 'numbered'; items: string[] }

export function genId() {
  return Math.random().toString(36).slice(2, 10)
}

// ブロック → マークダウン
export function serializeBlocks(blocks: Block[]): string {
  const parts: string[] = []
  for (const b of blocks) {
    if (b.type === 'heading' && b.text.trim()) parts.push(`## ${b.text.trim()}`)
    else if (b.type === 'paragraph' && b.text.trim()) parts.push(b.text.trim())
    else if (b.type === 'image' && b.url) parts.push(`![記事画像](${b.url})`)
    else if (b.type === 'bullet' && b.items.some((i) => i.trim()))
      parts.push(b.items.filter((i) => i.trim()).map((i) => `- ${i.trim()}`).join('\n'))
    else if (b.type === 'numbered' && b.items.some((i) => i.trim()))
      parts.push(b.items.filter((i) => i.trim()).map((i, idx) => `${idx + 1}. ${i.trim()}`).join('\n'))
  }
  return parts.join('\n\n')
}

// マークダウン → ブロック
export function parseContent(md: string): Block[] {
  const blocks: Block[] = []
  const lines = md.split('\n')
  let para: string[] = []
  let list: { type: 'bullet' | 'numbered'; items: string[] } | null = null

  const flushPara = () => {
    if (para.length) {
      blocks.push({ id: genId(), type: 'paragraph', text: para.join('\n') })
      para = []
    }
  }
  const flushList = () => {
    if (list) {
      blocks.push({ id: genId(), type: list.type, items: list.items })
      list = null
    }
  }

  for (const line of lines) {
    const imageMatch = line.match(/^!\[[^\]]*\]\((.+)\)\s*$/)
    const headingMatch = line.match(/^##\s+(.*)$/)
    const bulletMatch = line.match(/^-\s+(.*)$/)
    const numberedMatch = line.match(/^\d+\.\s+(.*)$/)

    if (headingMatch) {
      flushPara(); flushList()
      blocks.push({ id: genId(), type: 'heading', text: headingMatch[1] })
    } else if (imageMatch) {
      flushPara(); flushList()
      blocks.push({ id: genId(), type: 'image', url: imageMatch[1] })
    } else if (bulletMatch) {
      flushPara()
      if (list?.type !== 'bullet') { flushList(); list = { type: 'bullet', items: [] } }
      list.items.push(bulletMatch[1])
    } else if (numberedMatch) {
      flushPara()
      if (list?.type !== 'numbered') { flushList(); list = { type: 'numbered', items: [] } }
      list.items.push(numberedMatch[1])
    } else if (line.trim() === '') {
      flushPara(); flushList()
    } else {
      flushList()
      para.push(line)
    }
  }
  flushPara(); flushList()
  return blocks
}

// 旧形式（learned / next_challenge / image_urls）からブロックへ変換
export function blocksFromLegacy(diary: {
  image_urls: string[] | null
  learned: string | null
  next_challenge: string | null
}): Block[] {
  const blocks: Block[] = []
  for (const url of diary.image_urls ?? []) {
    blocks.push({ id: genId(), type: 'image', url })
  }
  if (diary.learned?.trim()) {
    blocks.push({ id: genId(), type: 'heading', text: 'このボランティアで学んだこと' })
    blocks.push({ id: genId(), type: 'paragraph', text: diary.learned.trim() })
  }
  if (diary.next_challenge?.trim()) {
    blocks.push({ id: genId(), type: 'heading', text: '次にやってみたいと感じたこと' })
    blocks.push({ id: genId(), type: 'paragraph', text: diary.next_challenge.trim() })
  }
  return blocks
}
