'use client'

import { useEffect, useRef, useState } from 'react'
import { storage } from '@/lib/storage'
import { MOCK_RECEIPTS } from '@/lib/recipeData'
import { getDaysUntilExpiry } from '@/lib/recipeSearch'
import {
  CATEGORIES,
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  UNITS,
  type IngredientCategory,
  type InventoryItem,
} from '@/lib/types'

function genId() {
  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

interface ItemFormState {
  name: string
  category: IngredientCategory
  quantity: string
  unit: string
  expiryDate: string
}

const defaultForm: ItemFormState = {
  name: '',
  category: '野菜',
  quantity: '1',
  unit: '個',
  expiryDate: '',
}

interface ScanItem {
  name: string
  category: IngredientCategory
  quantity: number
  unit: string
  expiryDate?: string
  selected: boolean
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [mounted, setMounted] = useState(false)
  const [activeCategory, setActiveCategory] = useState<IngredientCategory | 'すべて'>('すべて')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [form, setForm] = useState<ItemFormState>(defaultForm)
  const [scanState, setScanState] = useState<'idle' | 'processing' | 'result'>('idle')
  const [scanItems, setScanItems] = useState<ScanItem[]>([])
  const [scanStore, setScanStore] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setInventory(storage.getInventory())
    setMounted(true)
  }, [])

  const save = (items: InventoryItem[]) => {
    setInventory(items)
    storage.saveInventory(items)
  }

  const handleAdd = () => {
    if (!form.name.trim()) return
    const newItem: InventoryItem = {
      id: genId(),
      name: form.name.trim(),
      category: form.category,
      quantity: parseFloat(form.quantity) || 1,
      unit: form.unit,
      expiryDate: form.expiryDate || undefined,
      addedAt: new Date().toISOString(),
    }
    save([...inventory, newItem])
    setForm(defaultForm)
    setShowAddModal(false)
  }

  const handleEdit = () => {
    if (!editingItem || !form.name.trim()) return
    const updated = inventory.map(it =>
      it.id === editingItem.id
        ? {
            ...it,
            name: form.name.trim(),
            category: form.category,
            quantity: parseFloat(form.quantity) || 1,
            unit: form.unit,
            expiryDate: form.expiryDate || undefined,
          }
        : it
    )
    save(updated)
    setEditingItem(null)
  }

  const handleDelete = (id: string) => {
    save(inventory.filter(it => it.id !== id))
  }

  const openEdit = (item: InventoryItem) => {
    setEditingItem(item)
    setForm({
      name: item.name,
      category: item.category,
      quantity: String(item.quantity),
      unit: item.unit,
      expiryDate: item.expiryDate ?? '',
    })
  }

  const handleScanFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return
    e.target.value = ''
    setScanState('processing')

    setTimeout(() => {
      const template = MOCK_RECEIPTS[Math.floor(Math.random() * MOCK_RECEIPTS.length)]
      const today = new Date()
      const items: ScanItem[] = template.items.map(it => ({
        ...it,
        expiryDate: it.expiryDays
          ? new Date(today.getTime() + it.expiryDays * 86400000).toISOString().split('T')[0]
          : undefined,
        selected: true,
      }))
      setScanStore(template.storeName)
      setScanItems(items)
      setScanState('result')
    }, 1800)
  }

  const confirmScan = () => {
    const selected = scanItems.filter(it => it.selected)
    const newItems: InventoryItem[] = selected.map(it => ({
      id: genId(),
      name: it.name,
      category: it.category,
      quantity: it.quantity,
      unit: it.unit,
      expiryDate: it.expiryDate,
      addedAt: new Date().toISOString(),
    }))
    save([...inventory, ...newItems])
    setScanState('idle')
    setScanItems([])
  }

  const filteredItems = inventory.filter(it => {
    const matchCat = activeCategory === 'すべて' || it.category === activeCategory
    const matchSearch =
      !searchQuery || it.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCat && matchSearch
  })

  if (!mounted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400 text-sm">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">在庫管理</h1>
          <p className="text-sm text-gray-500 mt-0.5">全 {inventory.length} 品目</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
          >
            📷 レシートスキャン
          </button>
          <button
            onClick={() => {
              setForm(defaultForm)
              setShowAddModal(true)
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            ＋ 追加
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleScanFile}
          />
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="食材を検索..."
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {(['すべて', ...CATEGORIES] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-emerald-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {cat !== 'すべて' && CATEGORY_ICONS[cat as IngredientCategory]}{' '}
            {cat}
          </button>
        ))}
      </div>

      {/* Item list */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">📦</div>
          <p className="text-sm">
            {searchQuery || activeCategory !== 'すべて'
              ? '条件に一致する食材がありません'
              : '食材を追加してください'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredItems.map(item => {
            const daysLeft = item.expiryDate ? getDaysUntilExpiry(item.expiryDate) : null
            const isExpiring = daysLeft !== null && daysLeft <= 3
            const isExpired = daysLeft !== null && daysLeft < 0

            return (
              <div
                key={item.id}
                className={`bg-white rounded-xl border shadow-sm p-4 flex items-center gap-3 ${
                  isExpired
                    ? 'border-red-200 bg-red-50'
                    : isExpiring
                      ? 'border-amber-200 bg-amber-50'
                      : 'border-gray-200'
                }`}
              >
                <div className="text-2xl w-10 text-center">
                  {CATEGORY_ICONS[item.category]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-900">{item.name}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[item.category]}`}
                    >
                      {item.category}
                    </span>
                    {isExpired && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">
                        期限切れ
                      </span>
                    )}
                    {isExpiring && !isExpired && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                        {daysLeft === 0 ? '今日まで' : `あと${daysLeft}日`}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                    <span>
                      {item.quantity} {item.unit}
                    </span>
                    {item.expiryDate && !isExpiring && !isExpired && (
                      <span className="text-xs">
                        期限: {item.expiryDate}
                        {daysLeft !== null && ` (あと${daysLeft}日)`}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEdit(item)}
                    className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title="編集"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="削除"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add / Edit modal */}
      {(showAddModal || editingItem) && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5">
              {editingItem ? '食材を編集' : '食材を追加'}
            </h2>
            <div className="space-y-4">
              <Field label="食材名 *">
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="例: 豚肉"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </Field>

              <Field label="カテゴリ">
                <select
                  value={form.category}
                  onChange={e =>
                    setForm(f => ({ ...f, category: e.target.value as IngredientCategory }))
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>
                      {CATEGORY_ICONS[c]} {c}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="数量">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={form.quantity}
                    onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </Field>
                <Field label="単位">
                  <select
                    value={form.unit}
                    onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
                  >
                    {UNITS.map(u => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="消費期限">
                <input
                  type="date"
                  value={form.expiryDate}
                  min={todayStr()}
                  onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </Field>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setEditingItem(null)
                }}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={editingItem ? handleEdit : handleAdd}
                disabled={!form.name.trim()}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-40"
              >
                {editingItem ? '更新' : '追加'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scan modal */}
      {scanState !== 'idle' && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            {scanState === 'processing' ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4 animate-pulse">📷</div>
                <div className="text-lg font-semibold text-gray-700 mb-2">レシートを解析中...</div>
                <div className="text-sm text-gray-500">AIが食材を自動認識しています</div>
                <div className="mt-4 flex justify-center gap-1">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">認識された食材</h2>
                    <p className="text-xs text-gray-500 mt-0.5">📍 {scanStore}</p>
                  </div>
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">
                    {scanItems.filter(i => i.selected).length} 件選択中
                  </span>
                </div>
                <div className="space-y-2 max-h-72 overflow-y-auto mb-5">
                  {scanItems.map((item, idx) => (
                    <label
                      key={idx}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        item.selected ? 'bg-emerald-50 border border-emerald-200' : 'bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={() =>
                          setScanItems(prev =>
                            prev.map((it, i) =>
                              i === idx ? { ...it, selected: !it.selected } : it
                            )
                          )
                        }
                        className="w-4 h-4 accent-emerald-600"
                      />
                      <span className="text-lg">{CATEGORY_ICONS[item.category]}</span>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-xs text-gray-500">
                          {item.quantity} {item.unit}
                          {item.expiryDate && `・期限: ${item.expiryDate}`}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setScanState('idle')}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={confirmScan}
                    disabled={scanItems.filter(i => i.selected).length === 0}
                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-40"
                  >
                    在庫に追加
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  )
}
