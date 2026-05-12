import type { InventoryItem, MealPlan, Recipe } from './types'

const KEYS = {
  inventory: 'recipe-app-inventory',
  mealPlans: 'recipe-app-meal-plans',
  favorites: 'recipe-app-favorites',
  initialized: 'recipe-app-initialized',
} as const

function load<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function save(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export const storage = {
  getInventory: (): InventoryItem[] => load<InventoryItem[]>(KEYS.inventory, []),
  saveInventory: (items: InventoryItem[]): void => save(KEYS.inventory, items),
  getMealPlans: (): MealPlan[] => load<MealPlan[]>(KEYS.mealPlans, []),
  saveMealPlans: (plans: MealPlan[]): void => save(KEYS.mealPlans, plans),
  getFavorites: (): Recipe[] => load<Recipe[]>(KEYS.favorites, []),
  saveFavorites: (recipes: Recipe[]): void => save(KEYS.favorites, recipes),
  isInitialized: (): boolean => load<boolean>(KEYS.initialized, false),
  markInitialized: (): void => save(KEYS.initialized, true),
}
