'use client'

import { cancelApplication } from '@/app/caredent/actions'

export default function CancelButton({ applicationId }: { applicationId: string }) {
  const cancelAction = cancelApplication.bind(null, applicationId)

  return (
    <form action={cancelAction} className="flex-shrink-0">
      <button
        type="submit"
        onClick={(e) => {
          if (!confirm('応募をキャンセルしますか？')) e.preventDefault()
        }}
        className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-colors"
      >
        キャンセル
      </button>
    </form>
  )
}
