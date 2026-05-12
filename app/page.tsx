'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { storage } from '@/lib/storage'
import { SAMPLE_INVENTORY, RECIPES } from '@/lib/recipeData'
import { searchRecipes, getExpiringItems, getDaysUntilExpiry } from '@/lib/recipeSearch'
import type { InventoryItem, MealPlan, Recipe } from '@/lib/types'
import { MEAL_ICONS, MEAL_LABELS, CATEGORY_ICONS } from '@/lib/types'

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const days = ['日', '月', '火', '水', '木', '金', '土']
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${days[d.getDay()]}）`
}

function initSampleData(): void {
  if (storage.isInitialized()) return

  const today = new Date()
  const items: InventoryItem[] = SAMPLE_INVENTORY.map((s, i) => ({
    id: `init-${i}`,
    name: s.name,
    category: s.category,
    quantity: s.quantity,
    unit: s.unit,
    expiryDate: s.expiryDays
      ? new Date(today.getTime() + s.expiryDays * 86400000).toISOString().split('T')[0]
      : undefined,
    addedAt: today.toISOString(),
  }))

  const dinnerPlan: MealPlan = {
    id: 'init-plan-1',
    date: todayStr(),
    mealType: 'dinner',
    title: '豚の生姜焼き',
    recipeId: 'r1',
    done: false,
  }

  storage.saveInventory(items)
  storage.saveMealPlans([dinnerPlan])
  storage.markInitialized()
}

export default function DashboardPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [favorites, setFavorites] = useState<Recipe[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    initSampleData()
    setInventory(storage.getInventory())
    setMealPlans(storage.getMealPlans())
    setFavorites(storage.getFavorites())
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10 flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400 text-sm">読み込み中...</div>
      </div>
    )
  }

  const today = todayStr()
  const todayPlans = mealPlans.filter(p => p.date === today)
  const mealTypes = ['breakfast', 'lunch', 'dinner'] as const

  const expiringItems = getExpiringItems(inventory)
  const topRecipes = searchRecipes(RECIPES, '', inventory, true).slice(0, 4)

  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0]
  const tomorrowPlans = mealPlans.filter(p => p.date === tomorrowStr)

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Today header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
          <p className="text-sm text-gray-500 mt-0.5">{formatDate(today)}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/inventory"
            className="text-sm px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            在庫を追加
          </Link>
        </div>
      </div>

      {/* Expiry alerts */}
      {expiringItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-amber-600 font-semibold text-sm">⚠️ 消費期限が近い食材</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {expiringItems.map(item => {
              const days = getDaysUntilExpiry(item.expiryDate!)
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                    days === 0
                      ? 'bg-red-100 text-red-700'
                      : days === 1
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  <span>{CATEGORY_ICONS[item.category]}</span>
                  <span>{item.name}</span>
                  <span className="text-xs">
                    {days === 0 ? '今日まで' : `あと${days}日`}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's meals */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">今日の献立</h2>
              <Link href="/calendar" className="text-xs text-emerald-600 hover:underline">
                カレンダーで管理 →
              </Link>
            </div>
            <div className="space-y-3">
              {mealTypes.map(mealType => {
                const plan = todayPlans.find(p => p.mealType === mealType)
                return (
                  <div
                    key={mealType}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50"
                  >
                    <div className="text-2xl w-10 text-center">
                      {MEAL_ICONS[mealType]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500 font-medium">
                        {MEAL_LABELS[mealType]}
                      </div>
                      {plan ? (
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-medium ${
                              plan.done ? 'line-through text-gray-400' : 'text-gray-900'
                            }`}
                          >
                            {plan.title}
                          </span>
                          {plan.done && (
                            <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                              完了
                            </span>
                          )}
                        </div>
                      ) : (
                        <Link
                          href="/calendar"
                          className="text-sm text-gray-400 hover:text-emerald-600 transition-colors"
                        >
                          + 献立を追加
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Tomorrow preview */}
          {tomorrowPlans.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-900">明日の予定</h2>
                <Link href="/calendar" className="text-xs text-emerald-600 hover:underline">
                  詳細 →
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {tomorrowPlans.map(p => (
                  <div
                    key={p.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-full text-sm"
                  >
                    <span>{MEAL_ICONS[p.mealType]}</span>
                    <span>{p.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recipe suggestions */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">今ある食材で作れる料理</h2>
              <Link href="/search" className="text-xs text-emerald-600 hover:underline">
                もっと見る →
              </Link>
            </div>
            {topRecipes.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">
                在庫を追加するとレシピを提案します
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {topRecipes.map(({ recipe, matchScore, missingIngredients }) => (
                  <Link
                    key={recipe.id}
                    href={`/search?q=${encodeURIComponent(recipe.title)}`}
                    className="p-3 rounded-lg border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50 transition-all group"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-2xl">{recipe.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 group-hover:text-emerald-700 truncate">
                          {recipe.title}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-emerald-500 h-1.5 rounded-full"
                              style={{ width: `${matchScore}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 shrink-0">{matchScore}%</span>
                        </div>
                        {missingIngredients.length > 0 && (
                          <div className="text-xs text-gray-400 mt-0.5 truncate">
                            不足: {missingIngredients.slice(0, 2).join(', ')}
                            {missingIngredients.length > 2 && '...'}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Stats */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-4">在庫サマリー</h2>
            <div className="space-y-3">
              <StatRow label="食材数" value={`${inventory.length} 品目`} icon="📦" />
              <StatRow
                label="消費期限切れ間近"
                value={`${expiringItems.length} 品目`}
                icon="⚠️"
                highlight={expiringItems.length > 0}
              />
              <StatRow
                label="今週の予定献立"
                value={`${mealPlans.filter(p => {
                  const d = new Date(p.date)
                  const now = new Date()
                  const diffDays = (d.getTime() - now.getTime()) / 86400000
                  return diffDays >= 0 && diffDays < 7
                }).length} 食`}
                icon="📅"
              />
              <StatRow label="お気に入り" value={`${favorites.length} 件`} icon="❤️" />
            </div>
            <Link
              href="/inventory"
              className="mt-4 block text-center text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              在庫を管理する →
            </Link>
          </div>

          {/* Favorites preview */}
          {favorites.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-900">お気に入り</h2>
                <Link href="/search?tab=favorites" className="text-xs text-emerald-600 hover:underline">
                  全て →
                </Link>
              </div>
              <div className="space-y-2">
                {favorites.slice(0, 4).map(r => (
                  <div key={r.id} className="flex items-center gap-2 text-sm">
                    <span>{r.emoji}</span>
                    <span className="text-gray-700 truncate">{r.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick links */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-3">クイックアクション</h2>
            <div className="space-y-2">
              <QuickLink href="/inventory" icon="📷" label="レシートをスキャン" />
              <QuickLink href="/inventory" icon="➕" label="食材を手動で追加" />
              <QuickLink href="/search" icon="🔍" label="レシピを検索" />
              <QuickLink href="/calendar" icon="📅" label="献立をスケジュール" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatRow({
  label,
  value,
  icon,
  highlight = false,
}: {
  label: string
  value: string
  icon: string
  highlight?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <span className={`text-sm font-semibold ${highlight ? 'text-amber-600' : 'text-gray-900'}`}>
        {value}
      </span>
    </div>
  )
}

function QuickLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
    >
      <span className="text-lg w-7 text-center">{icon}</span>
      <span className="text-sm text-gray-700 group-hover:text-emerald-700">{label}</span>
    </Link>
  )
}
