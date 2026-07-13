// 執筆者の初期アイコン（アバター未設定のためデフォルト表示）
export default function AuthorAvatar({ size = 40 }: { size?: number }) {
  return (
    <div
      className="rounded-full bg-gradient-to-br from-[#4592c0] to-[#6db3d8] flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <svg
        className="text-white"
        style={{ width: size * 0.55, height: size * 0.55 }}
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 12c2.7 0 4.9-2.2 4.9-4.9S14.7 2.2 12 2.2 7.1 4.4 7.1 7.1 9.3 12 12 12zm0 2.4c-3.3 0-9.8 1.6-9.8 4.9v2.5h19.6v-2.5c0-3.3-6.5-4.9-9.8-4.9z" />
      </svg>
    </div>
  )
}
