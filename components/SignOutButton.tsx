'use client'

import { signOut } from '@/app/dashboard/actions'

export default function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="text-sm text-gray-500 hover:text-red-600 transition-colors font-medium"
      >
        ログアウト
      </button>
    </form>
  )
}
