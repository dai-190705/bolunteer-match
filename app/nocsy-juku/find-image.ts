import fs from 'node:fs'
import path from 'node:path'

const EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.JPG', '.JPEG', '.PNG', '.WEBP']

// 画像が public に置かれたら表示し、まだ無ければ null を返す（ビルド時に判定）
export function findImage(basePath: string): string | null {
  for (const ext of EXTENSIONS) {
    const file = `${basePath}${ext}`
    if (fs.existsSync(path.join(process.cwd(), 'public', file))) return file
  }
  return null
}
