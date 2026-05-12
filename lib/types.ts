export type IngredientCategory =
  | '野菜'
  | '肉類'
  | '魚介類'
  | '乳製品・卵'
  | '調味料'
  | '穀物・麺類'
  | 'その他'

export const CATEGORIES: IngredientCategory[] = [
  '野菜',
  '肉類',
  '魚介類',
  '乳製品・卵',
  '調味料',
  '穀物・麺類',
  'その他',
]

export const CATEGORY_ICONS: Record<IngredientCategory, string> = {
  '野菜': '🥦',
  '肉類': '🥩',
  '魚介類': '🐟',
  '乳製品・卵': '🥚',
  '調味料': '🧂',
  '穀物・麺類': '🌾',
  'その他': '🛒',
}

export const CATEGORY_COLORS: Record<IngredientCategory, string> = {
  '野菜': 'bg-green-100 text-green-800',
  '肉類': 'bg-red-100 text-red-800',
  '魚介類': 'bg-blue-100 text-blue-800',
  '乳製品・卵': 'bg-yellow-100 text-yellow-800',
  '調味料': 'bg-purple-100 text-purple-800',
  '穀物・麺類': 'bg-orange-100 text-orange-800',
  'その他': 'bg-gray-100 text-gray-800',
}

export const UNITS = ['g', 'kg', '個', '本', '袋', '枚', 'ml', 'L', '束', 'パック', '缶', '合']

export interface InventoryItem {
  id: string
  name: string
  category: IngredientCategory
  quantity: number
  unit: string
  expiryDate?: string
  addedAt: string
}

export type MealType = 'breakfast' | 'lunch' | 'dinner'

export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: '朝食',
  lunch: '昼食',
  dinner: '夕食',
}

export const MEAL_ICONS: Record<MealType, string> = {
  breakfast: '🌅',
  lunch: '🌞',
  dinner: '🌙',
}

export interface MealPlan {
  id: string
  date: string // YYYY-MM-DD
  mealType: MealType
  title: string
  recipeId?: string
  done?: boolean
}

export interface Recipe {
  id: string
  title: string
  emoji: string
  time: number
  servings: number
  ingredients: string[]
  tags: string[]
  description: string
  steps: string[]
}
