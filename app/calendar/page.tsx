'use client'

import { useEffect, useState } from 'react'
import { storage } from '@/lib/storage'
import { RECIPES } from '@/lib/recipeData'
import type { MealPlan, MealType } from '@/lib/types'
import { MEAL_ICONS, MEAL_LABELS } from '@/lib/types'

function genId() {
  return `plan-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

const WEEK_DAYS = ['日', '月', '火', '水', '木', '金', '土']

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner']

const MEAL_TYPE_COLORS: Record<MealType, string> = {
  breakfast: 'bg-amber-100 text-amber-800',
  lunch: 'bg-sky-100 text-sky-800',
  dinner: 'bg-violet-100 text-violet-800',
}

interface AddFormState {
  mealType: MealType
  title: string
  recipeId: string
}

const defaultForm: AddFormState = {
  mealType: 'dinner',
  title: '',
  recipeId: '',
}

export default function CalendarPage() {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [mounted, setMounted] = useState(false)
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(todayStr())
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState<AddFormState>(defaultForm)
  const [dragId, setDragId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')

  useEffect(() => {
    setMealPlans(storage.getMealPlans())
    setMounted(true)
  }, [])

  const save = (plans: MealPlan[]) => {
    setMealPlans(plans)
    storage.saveMealPlans(plans)
  }

  const handleAdd = () => {
    if (!form.title.trim() || !selectedDate) return
    const plan: MealPlan = {
      id: genId(),
      date: selectedDate,
      mealType: form.mealType,
      title: form.title.trim(),
      recipeId: form.recipeId || undefined,
      done: false,
    }
    save([...mealPlans, plan])
    setForm(defaultForm)
    setShowAddForm(false)
  }

  const handleDelete = (id: string) => {
    save(mealPlans.filter(p => p.id !== id))
  }

  const handleToggleDone = (id: string) => {
    save(mealPlans.map(p => (p.id === id ? { ...p, done: !p.done } : p)))
  }

  const handleDrop = (targetDate: string) => {
    if (!dragId) return
    save(mealPlans.map(p => (p.id === dragId ? { ...p, date: targetDate } : p)))
    setDragId(null)
  }

  // Build calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate()

  const cells: Array<{ day: number; isCurrentMonth: boolean; dateStr: string }> = []
  // Prev month padding
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevMonthDays - i
    const m = viewMonth === 0 ? 11 : viewMonth - 1
    const y = viewMonth === 0 ? viewYear - 1 : viewYear
    cells.push({ day: d, isCurrentMonth: false, dateStr: toDateStr(y, m, d) })
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, isCurrentMonth: true, dateStr: toDateStr(viewYear, viewMonth, d) })
  }
  // Next month padding
  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) {
    const m = viewMonth === 11 ? 0 : viewMonth + 1
    const y = viewMonth === 11 ? viewYear + 1 : viewYear
    cells.push({ day: d, isCurrentMonth: false, dateStr: toDateStr(y, m, d) })
  }

  // Week view: show current week
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek)
    d.setDate(startOfWeek.getDate() + i)
    return d.toISOString().split('T')[0]
  })

  const selectedDayPlans = selectedDate
    ? mealPlans.filter(p => p.date === selectedDate)
    : []

  // Stats for selected month
  const monthPlans = mealPlans.filter(p => {
    const [y, m] = p.date.split('-').map(Number)
    return y === viewYear && m === viewMonth + 1
  })

  if (!mounted) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10 flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400 text-sm">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Calendar */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (viewMonth === 0) {
                    setViewMonth(11)
                    setViewYear(y => y - 1)
                  } else {
                    setViewMonth(m => m - 1)
                  }
                }}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
              >
                ◀
              </button>
              <h1 className="text-xl font-bold text-gray-900 min-w-32 text-center">
                {viewYear}年 {viewMonth + 1}月
              </h1>
              <button
                onClick={() => {
                  if (viewMonth === 11) {
                    setViewMonth(0)
                    setViewYear(y => y + 1)
                  } else {
                    setViewMonth(m => m + 1)
                  }
                }}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
              >
                ▶
              </button>
              <button
                onClick={() => {
                  setViewYear(today.getFullYear())
                  setViewMonth(today.getMonth())
                  setSelectedDate(todayStr())
                }}
                className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors ml-1"
              >
                今日
              </button>
            </div>
            <div className="flex gap-1">
              {(['month', 'week'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === mode
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {mode === 'month' ? '月' : '週'}
                </button>
              ))}
            </div>
          </div>

          {/* Month stats */}
          <div className="flex gap-3 mb-4 text-xs text-gray-500">
            <span>📅 今月の献立: {monthPlans.length} 食</span>
            <span>✅ 完了: {monthPlans.filter(p => p.done).length} 食</span>
          </div>

          {viewMode === 'month' ? (
            <>
              {/* Weekday headers */}
              <div className="grid grid-cols-7 mb-1">
                {WEEK_DAYS.map((d, i) => (
                  <div
                    key={d}
                    className={`text-center text-xs font-medium py-2 ${
                      i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500'
                    }`}
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-xl overflow-hidden border border-gray-200">
                {cells.map((cell, idx) => {
                  const dayPlans = mealPlans.filter(p => p.date === cell.dateStr)
                  const isToday = cell.dateStr === todayStr()
                  const isSelected = cell.dateStr === selectedDate

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedDate(cell.dateStr)
                        setShowAddForm(false)
                      }}
                      onDragOver={e => e.preventDefault()}
                      onDrop={() => handleDrop(cell.dateStr)}
                      className={`bg-white min-h-[72px] p-1.5 cursor-pointer transition-colors relative ${
                        !cell.isCurrentMonth ? 'opacity-40' : ''
                      } ${isSelected ? 'bg-emerald-50' : 'hover:bg-gray-50'}`}
                    >
                      <div className="flex justify-end mb-1">
                        <span
                          className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                            isToday
                              ? 'bg-emerald-600 text-white'
                              : isSelected
                                ? 'text-emerald-700 font-bold'
                                : idx % 7 === 0
                                  ? 'text-red-500'
                                  : idx % 7 === 6
                                    ? 'text-blue-500'
                                    : 'text-gray-700'
                          }`}
                        >
                          {cell.day}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        {dayPlans.slice(0, 3).map(plan => (
                          <div
                            key={plan.id}
                            draggable
                            onDragStart={e => {
                              e.stopPropagation()
                              setDragId(plan.id)
                            }}
                            className={`text-xs px-1 py-0.5 rounded truncate cursor-grab active:cursor-grabbing ${
                              MEAL_TYPE_COLORS[plan.mealType]
                            } ${plan.done ? 'opacity-50 line-through' : ''}`}
                          >
                            {MEAL_ICONS[plan.mealType]} {plan.title}
                          </div>
                        ))}
                        {dayPlans.length > 3 && (
                          <div className="text-xs text-gray-400 px-1">
                            +{dayPlans.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            /* Week view */
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="grid grid-cols-7 border-b border-gray-100">
                {weekDates.map((dateStr, i) => {
                  const d = new Date(dateStr)
                  const isToday = dateStr === todayStr()
                  return (
                    <div
                      key={dateStr}
                      onClick={() => {
                        setSelectedDate(dateStr)
                        setShowAddForm(false)
                      }}
                      className={`p-3 text-center cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedDate === dateStr ? 'bg-emerald-50' : ''
                      }`}
                    >
                      <div
                        className={`text-xs font-medium mb-1 ${
                          i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500'
                        }`}
                      >
                        {WEEK_DAYS[i]}
                      </div>
                      <div
                        className={`text-sm font-bold w-8 h-8 mx-auto flex items-center justify-center rounded-full ${
                          isToday ? 'bg-emerald-600 text-white' : 'text-gray-900'
                        }`}
                      >
                        {d.getDate()}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="grid grid-cols-7 min-h-[300px]">
                {weekDates.map(dateStr => {
                  const dayPlans = mealPlans.filter(p => p.date === dateStr)
                  return (
                    <div
                      key={dateStr}
                      onDragOver={e => e.preventDefault()}
                      onDrop={() => handleDrop(dateStr)}
                      className="border-r border-gray-100 last:border-r-0 p-2 space-y-1"
                    >
                      {MEAL_TYPES.map(mt => {
                        const plan = dayPlans.find(p => p.mealType === mt)
                        return plan ? (
                          <div
                            key={mt}
                            draggable
                            onDragStart={() => setDragId(plan.id)}
                            className={`text-xs p-1.5 rounded-lg cursor-grab ${MEAL_TYPE_COLORS[mt]} ${
                              plan.done ? 'opacity-50' : ''
                            }`}
                          >
                            <div>{MEAL_ICONS[mt]}</div>
                            <div className="truncate">{plan.title}</div>
                          </div>
                        ) : (
                          <div
                            key={mt}
                            onClick={() => {
                              setSelectedDate(dateStr)
                              setForm(f => ({ ...f, mealType: mt }))
                              setShowAddForm(true)
                            }}
                            className="text-xs p-1.5 rounded-lg border border-dashed border-gray-200 text-gray-300 hover:border-emerald-300 hover:text-emerald-400 cursor-pointer transition-colors text-center"
                          >
                            {MEAL_ICONS[mt]}
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Day panel */}
        <div className="lg:w-72 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden sticky top-20">
            {selectedDate ? (
              <>
                <div className="p-4 border-b border-gray-100 bg-emerald-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-emerald-800">
                        {(() => {
                          const d = new Date(selectedDate + 'T00:00:00')
                          return `${d.getMonth() + 1}月${d.getDate()}日（${WEEK_DAYS[d.getDay()]}）`
                        })()}
                      </div>
                      {selectedDate === todayStr() && (
                        <span className="text-xs text-emerald-600">今日</span>
                      )}
                    </div>
                    <button
                      onClick={() => setShowAddForm(v => !v)}
                      className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      ＋ 追加
                    </button>
                  </div>
                </div>

                {/* Add form */}
                {showAddForm && (
                  <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          食事タイプ
                        </label>
                        <div className="flex gap-1">
                          {MEAL_TYPES.map(mt => (
                            <button
                              key={mt}
                              onClick={() => setForm(f => ({ ...f, mealType: mt }))}
                              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                form.mealType === mt
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-white border border-gray-200 text-gray-600'
                              }`}
                            >
                              {MEAL_ICONS[mt]}
                              <br />
                              {MEAL_LABELS[mt]}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          料理名 *
                        </label>
                        <input
                          type="text"
                          value={form.title}
                          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                          placeholder="例: 豚の生姜焼き"
                          list="recipe-suggestions"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        />
                        <datalist id="recipe-suggestions">
                          {RECIPES.map(r => (
                            <option key={r.id} value={r.title} />
                          ))}
                        </datalist>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          レシピから選ぶ
                        </label>
                        <select
                          value={form.recipeId}
                          onChange={e => {
                            const recipe = RECIPES.find(r => r.id === e.target.value)
                            setForm(f => ({
                              ...f,
                              recipeId: e.target.value,
                              title: recipe?.title ?? f.title,
                            }))
                          }}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
                        >
                          <option value="">-- 選択 --</option>
                          {RECIPES.map(r => (
                            <option key={r.id} value={r.id}>
                              {r.emoji} {r.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setShowAddForm(false)
                            setForm(defaultForm)
                          }}
                          className="flex-1 py-2 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          キャンセル
                        </button>
                        <button
                          onClick={handleAdd}
                          disabled={!form.title.trim()}
                          className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition-colors disabled:opacity-40"
                        >
                          追加
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Day meals */}
                <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
                  {MEAL_TYPES.map(mt => {
                    const plans = selectedDayPlans.filter(p => p.mealType === mt)
                    return (
                      <div key={mt}>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="text-sm">{MEAL_ICONS[mt]}</span>
                          <span className="text-xs font-medium text-gray-500">
                            {MEAL_LABELS[mt]}
                          </span>
                        </div>
                        {plans.length === 0 ? (
                          <button
                            onClick={() => {
                              setForm(f => ({ ...f, mealType: mt }))
                              setShowAddForm(true)
                            }}
                            className="w-full text-left text-xs text-gray-300 hover:text-emerald-500 px-2 py-1.5 border border-dashed border-gray-200 rounded-lg hover:border-emerald-300 transition-colors"
                          >
                            + 献立を追加
                          </button>
                        ) : (
                          plans.map(plan => (
                            <div
                              key={plan.id}
                              className={`flex items-center gap-2 p-2 rounded-lg ${MEAL_TYPE_COLORS[plan.mealType]} mb-1`}
                            >
                              <span
                                className={`flex-1 text-xs font-medium truncate ${
                                  plan.done ? 'line-through opacity-60' : ''
                                }`}
                              >
                                {plan.title}
                              </span>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => handleToggleDone(plan.id)}
                                  title={plan.done ? '未完了に戻す' : '完了にする'}
                                  className="text-xs hover:scale-110 transition-transform"
                                >
                                  {plan.done ? '↩️' : '✅'}
                                </button>
                                <button
                                  onClick={() => handleDelete(plan.id)}
                                  className="text-xs hover:scale-110 transition-transform"
                                  title="削除"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )
                  })}

                  {selectedDayPlans.length === 0 && !showAddForm && (
                    <div className="text-center py-6 text-gray-400">
                      <div className="text-3xl mb-2">🍽️</div>
                      <p className="text-xs">まだ献立がありません</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-gray-400">
                <div className="text-3xl mb-2">📅</div>
                <p className="text-sm">日付を選択してください</p>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="mt-4 bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="text-xs font-medium text-gray-600 mb-2">色の凡例</div>
            <div className="space-y-1.5">
              {MEAL_TYPES.map(mt => (
                <div key={mt} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-sm ${MEAL_TYPE_COLORS[mt].split(' ')[0]}`} />
                  <span className="text-xs text-gray-600">
                    {MEAL_ICONS[mt]} {MEAL_LABELS[mt]}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs text-gray-400">
              💡 献立をドラッグして別の日に移動できます
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
