import type { Recipe, InventoryItem } from './types'

export interface RecipeMatch {
  recipe: Recipe
  matchScore: number
  matchedIngredients: string[]
  missingIngredients: string[]
}

function normalize(str: string): string {
  return str.toLowerCase().trim()
}

function ingredientsMatch(inventoryName: string, recipeIngredient: string): boolean {
  const inv = normalize(inventoryName)
  const rec = normalize(recipeIngredient)
  return inv.includes(rec) || rec.includes(inv)
}

export function buildRecipeMatch(recipe: Recipe, inventory: InventoryItem[]): RecipeMatch {
  const matched: string[] = []
  const missing: string[] = []

  for (const ingredient of recipe.ingredients) {
    const found = inventory.some(item => ingredientsMatch(item.name, ingredient))
    if (found) {
      matched.push(ingredient)
    } else {
      missing.push(ingredient)
    }
  }

  const score =
    recipe.ingredients.length > 0
      ? Math.round((matched.length / recipe.ingredients.length) * 100)
      : 0

  return { recipe, matchScore: score, matchedIngredients: matched, missingIngredients: missing }
}

export function searchRecipes(
  recipes: Recipe[],
  query: string,
  inventory: InventoryItem[],
  onlyFromInventory: boolean
): RecipeMatch[] {
  const q = normalize(query)

  let filtered = recipes
  if (q) {
    filtered = filtered.filter(
      r =>
        normalize(r.title).includes(q) ||
        r.tags.some(t => normalize(t).includes(q)) ||
        r.ingredients.some(i => normalize(i).includes(q))
    )
  }

  const matches = filtered.map(r => buildRecipeMatch(r, inventory))

  if (onlyFromInventory) {
    return matches
      .filter(m => m.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
  }

  return matches.sort((a, b) => b.matchScore - a.matchScore)
}

export function getExpiringItems(inventory: InventoryItem[]): InventoryItem[] {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const threshold = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

  return inventory
    .filter(item => {
      if (!item.expiryDate) return false
      const expiry = new Date(item.expiryDate)
      return expiry >= now && expiry <= threshold
    })
    .sort((a, b) => new Date(a.expiryDate!).getTime() - new Date(b.expiryDate!).getTime())
}

export function getDaysUntilExpiry(expiryDate: string): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const expiry = new Date(expiryDate)
  expiry.setHours(0, 0, 0, 0)
  return Math.round((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}
