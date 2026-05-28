'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Program } from '@/types'
import { deleteProgram, togglePublished } from './actions'

export default function DashboardActions({ program }: { program: Program }) {
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm(`「${program.title}」を削除しますか？この操作は取り消せません。`))
      return
    setLoading(true)
    await deleteProgram(program.id)
    setLoading(false)
  }

  async function handleToggle() {
    setLoading(true)
    await togglePublished(program.id, program.published)
    setLoading(false)
  }

  return (
    <div className="flex items-center justify-end gap-2 flex-wrap">
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 ${
          program.published
            ? 'bg-orange-50 text-orange-600 hover:bg-orange-100'
            : 'bg-green-50 text-green-700 hover:bg-green-100'
        }`}
      >
        {program.published ? '非公開にする' : '公開する'}
      </button>
      <Link
        href={`/caredent/dashboard/programs/${program.id}/edit`}
        className="text-xs px-2.5 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
      >
        編集
      </Link>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="text-xs px-2.5 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium disabled:opacity-50"
      >
        削除
      </button>
    </div>
  )
}
