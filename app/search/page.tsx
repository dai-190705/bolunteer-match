'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { storage } from '@/lib/storage'
import { RECIPES } from '@/lib/recipeData'
import { searchRecipes, type RecipeMatch } from '@/lib/recipeSearch'
import type { InventoryItem, MealPlan, MealType, Recipe } from '@/lib/types'
import { MEAL_ICONS, MEAL_LABELS, CATEGORY_ICONS } from '@/lib/types'

const ALL_TAGS = Array.from(new Set(RECIPES.flatMap(r => r.tags))).sort()

function genId() {
  return `plan-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function ScoreBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all ${
            score >= 80
              ? 'bg-emerald-500'
              : score >= 50
                ? 'bg-amber-400'
                : 'bg-red-400'
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span
        className={`text-xs font-semibold shrink-0 ${
          score >= 80
            ? 'text-emerald-600'
            : score >= 50
              ? 'text-amber-600'
              : 'text-red-500'
        }`}
      >
        {score}%
      </span>
    </div>
  )
}

function SearchPageContent() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') ?? ''
  const initialTab = searchParams.get('tab') === 'favorites' ? 'favorites' : 'all'

  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [favorites, setFavorites] = useState<Recipe[]>([])
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [mounted, setMounted] = useState(false)

  const [query, setQuery] = useState(initialQuery)
  const [onlyFromInventory, setOnlyFromInventory] = useState(false)
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>(initialTab)
  const [selectedMatch, setSelectedMatch] = useState<RecipeMatch | null>(null)
  const [showCalendarModal, setShowCalendarModal] = useState(false)
  const [calendarDate, setCalendarDate] = useState(todayStr())
  const [calendarMealType, setCalendarMealType] = useState<MealType>('dinner')

  useEffect(() => {
    setInventory(storage.getInventory())
    setFavorites(storage.getFavorites())
    setMealPlans(storage.getMealPlans())
    setMounted(true)
  }, [])

  const toggleFavorite = (recipe: Recipe) => {
    const isFav = favorites.some(f => f.id === recipe.id)
    const updated = isFav
      ? favorites.filter(f => f.id !== recipe.id)
      : [...favorites, recipe]
    setFavorites(updated)
    storage.saveFavorites(updated)
  }

  const addToCalendar = () => {
    if (!selectedMatch) return
    const plan: MealPlan = {
      id: genId(),
      date: calendarDate,
      mealType: calendarMealType,
      title: selectedMatch.recipe.title,
      recipeId: selectedMatch.recipe.id,
      done: false,
    }
    const updated = [...mealPlans, plan]
    setMealPlans(updated)
    storage.saveMealPlans(updated)
    setShowCalendarModal(false)
  }

  const allMatches = searchRecipes(
    RECIPES,
    query,
    inventory,
    onlyFromInventory
  ).filter(m => !activeTag || m.recipe.tags.includes(activeTag))

  const favoriteMatches = favorites.map(r => {
    const fromSearch = allMatches.find(m => m.recipe.id === r.id)
    if (fromSearch) return fromSearch
    return searchRecipes([r], '', inventory, false)[0]
  })

  const displayMatches = activeTab === 'favorites' ? favoriteMatches : allMatches

  if (!mounted) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10 flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400 text-sm">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 flex gap-6">
      {/* Left: Search + list */}
      <div className="flex-1 min-w-0">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">レシピ検索</h1>

          {/* Search bar */}
          <div className="relative mb-3">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="料理名・食材・タグで検索..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          {/* Tabs + inventory toggle */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex gap-1">
              {(['all', 'favorites'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {tab === 'all' ? `全レシピ (${RECIPES.length})` : `❤️ お気に入り (${favorites.length})`}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
              <div
                onClick={() => setOnlyFromInventory(v => !v)}
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  onlyFromInventory ? 'bg-emerald-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    onlyFromInventory ? 'translate-x-5' : ''
                  }`}
                />
              </div>
              <span className={onlyFromInventory ? 'text-emerald-700 font-medium' : 'text-gray-600'}>
                在庫から絞る
              </span>
            </label>
          </div>

          {/* Tag filters */}
          <div className="flex gap-1.5 mt-3 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTag(null)}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                !activeTag
                  ? 'bg-gray-700 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              すべて
            </button>
            {ALL_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  activeTag === tag
                    ? 'bg-gray-700 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="text-xs text-gray-500 mb-3">
          {displayMatches.length} 件のレシピ
          {onlyFromInventory && ' (在庫食材で絞り込み中)'}
        </p>

        {/* Recipe grid */}
        {displayMatches.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">🍽️</div>
            <p className="text-sm">
              {activeTab === 'favorites'
                ? 'お気に入りがまだありません'
                : '条件に一致するレシピがありません'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {displayMatches.map(match => {
              const isFav = favorites.some(f => f.id === match.recipe.id)
              const isSelected = selectedMatch?.recipe.id === match.recipe.id

              return (
                <div
                  key={match.recipe.id}
                  onClick={() => setSelectedMatch(isSelected ? null : match)}
                  className={`bg-white rounded-xl border shadow-sm p-4 cursor-pointer transition-all hover:shadow-md ${
                    isSelected
                      ? 'border-emerald-400 ring-2 ring-emerald-200'
                      : 'border-gray-200 hover:border-emerald-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-3xl">{match.recipe.emoji}</span>
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        toggleFavorite(match.recipe)
                      }}
                      className="text-lg leading-none"
                      title={isFav ? 'お気に入りから削除' : 'お気に入りに追加'}
                    >
                      {isFav ? '❤️' : '🤍'}
                    </button>
                  </div>
                  <div className="text-sm font-semibold text-gray-900 mb-1 leading-snug">
                    {match.recipe.title}
                  </div>
                  <div className="flex gap-2 text-xs text-gray-500 mb-2">
                    <span>⏱ {match.recipe.time}分</span>
                    <span>👥 {match.recipe.servings}人前</span>
                  </div>
                  <ScoreBar score={match.matchScore} />
                  {match.missingIngredients.length > 0 && (
                    <div className="mt-1.5 text-xs text-red-500 truncate">
                      不足: {match.missingIngredients.slice(0, 2).join(', ')}
                      {match.missingIngredients.length > 2 &&
                        ` +${match.missingIngredients.length - 2}`}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {match.recipe.tags.slice(0, 2).map(tag => (
                      <span
                        key={tag}
                        className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Right: Detail panel */}
      {selectedMatch && (
        <div className="hidden lg:block w-80 shrink-0">
          <div className="sticky top-20 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <span className="text-4xl">{selectedMatch.recipe.emoji}</span>
                <button
                  onClick={() => toggleFavorite(selectedMatch.recipe)}
                  className="text-2xl"
                >
                  {favorites.some(f => f.id === selectedMatch.recipe.id) ? '❤️' : '🤍'}
                </button>
              </div>
              <h2 className="text-lg font-bold text-gray-900 mt-2">
                {selectedMatch.recipe.title}
              </h2>
              <p className="text-sm text-gray-500 mt-1">{selectedMatch.recipe.description}</p>
              <div className="flex gap-3 mt-3 text-sm text-gray-600">
                <span>⏱ {selectedMatch.recipe.time}分</span>
                <span>👥 {selectedMatch.recipe.servings}人前</span>
              </div>
            </div>

            {/* Ingredients */}
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">材料</h3>
                <ScoreBar score={selectedMatch.matchScore} />
              </div>
              <div className="space-y-1.5">
                {selectedMatch.recipe.ingredients.map(ing => {
                  const inInventory = selectedMatch.matchedIngredients.includes(ing)
                  return (
                    <div key={ing} className="flex items-center gap-2 text-sm">
                      <span>{inInventory ? '✅' : '❌'}</span>
                      <span className={inInventory ? 'text-gray-700' : 'text-red-500'}>
                        {ing}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Steps */}
            <div className="p-5 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">作り方</h3>
              <ol className="space-y-2">
                {selectedMatch.recipe.steps.map((step, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="text-gray-700">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Actions */}
            <div className="p-5 space-y-2">
              <button
                onClick={() => setShowCalendarModal(true)}
                className="w-full py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
              >
                📅 カレンダーに追加
              </button>
              <button
                onClick={() => toggleFavorite(selectedMatch.recipe)}
                className={`w-full py-2 rounded-lg text-sm font-medium transition-colors border ${
                  favorites.some(f => f.id === selectedMatch.recipe.id)
                    ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {favorites.some(f => f.id === selectedMatch.recipe.id)
                  ? '❤️ お気に入りから削除'
                  : '🤍 お気に入りに追加'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile detail modal */}
      {selectedMatch && (
        <div className="lg:hidden fixed inset-0 bg-black/40 z-50 flex items-end">
          <div className="bg-white rounded-t-2xl w-full max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedMatch.recipe.emoji}</span>
                <h2 className="font-bold text-gray-900">{selectedMatch.recipe.title}</h2>
              </div>
              <button onClick={() => setSelectedMatch(null)} className="text-gray-400 text-xl">
                ✕
              </button>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-sm text-gray-500">{selectedMatch.recipe.description}</p>
              <div className="flex gap-3 text-sm text-gray-600">
                <span>⏱ {selectedMatch.recipe.time}分</span>
                <span>👥 {selectedMatch.recipe.servings}人前</span>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold">材料</h3>
                  <ScoreBar score={selectedMatch.matchScore} />
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {selectedMatch.recipe.ingredients.map(ing => {
                    const has = selectedMatch.matchedIngredients.includes(ing)
                    return (
                      <div key={ing} className="flex items-center gap-1 text-sm">
                        <span>{has ? '✅' : '❌'}</span>
                        <span className={has ? 'text-gray-700' : 'text-red-500'}>{ing}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-2">作り方</h3>
                <ol className="space-y-2">
                  {selectedMatch.recipe.steps.map((step, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span className="text-gray-700">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => setShowCalendarModal(true)}
                  className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors"
                >
                  📅 カレンダーに追加
                </button>
                <button
                  onClick={() => toggleFavorite(selectedMatch.recipe)}
                  className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  {favorites.some(f => f.id === selectedMatch.recipe.id)
                    ? '❤️ お気に入りから削除'
                    : '🤍 お気に入りに追加'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calendar add modal */}
      {showCalendarModal && selectedMatch && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">カレンダーに追加</h2>
            <p className="text-sm text-gray-500 mb-5">
              {selectedMatch.recipe.emoji} {selectedMatch.recipe.title}
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">日付</label>
                <input
                  type="date"
                  value={calendarDate}
                  onChange={e => setCalendarDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">食事タイプ</label>
                <div className="flex gap-2">
                  {(['breakfast', 'lunch', 'dinner'] as MealType[]).map(mt => (
                    <button
                      key={mt}
                      onClick={() => setCalendarMealType(mt)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        calendarMealType === mt
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {MEAL_ICONS[mt]} {MEAL_LABELS[mt]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCalendarModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={addToCalendar}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
              >
                追加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto px-4 py-10 flex items-center justify-center min-h-[400px]">
          <div className="text-gray-400 text-sm">読み込み中...</div>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  )
}
