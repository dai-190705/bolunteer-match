export type Application = {
  id: string
  program_id: string
  student_id: string
  status: 'applied' | 'completed'
  applied_at: string
  completed_at: string | null
  motivation: string | null
  self_pr: string | null
  // joined
  programs?: Program
}

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
  banner_image_url: string | null
  category: 'スキボラ' | 'ちょボラ' | 'ガチボラ' | null
  cancel_policy: string | null
  notes: string | null
  capacity: number | null
}
