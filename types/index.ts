export type Program = {
  id: string
  title: string
  description: string
  target: string | null
  deadline: string | null
  apply_url: string | null
  tags: string[] | null
  publisher_id: string
  published: boolean
  created_at: string
  updated_at: string
  banner_image_wide_url: string | null
  banner_image_tall_url: string | null
  category: 'スキボラ' | 'ちょボラ' | 'ガチボラ' | null
}
