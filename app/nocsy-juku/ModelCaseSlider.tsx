'use client'

import { useRef, useState } from 'react'

type Phase = {
  period: string
  start: number
  end: number
  title: string
  body: string
  image: string
}

const NAVY = '#19365B'
const GREEN = '#8CC63F'
const SWIPE_THRESHOLD = 40

export default function ModelCaseSlider({ phases }: { phases: Phase[] }) {
  const [index, setIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const swiped = useRef(false)

  const go = (next: number) => setIndex((next + phases.length) % phases.length)

  const current = phases[index]
  // 1か月を 1/12 の幅として、現在の時期の中央に点を置く
  const dotLeft = ((current.start - 1 + current.end) / 2 / 12) * 100
  const fillWidth = (current.end / 12) * 100

  return (
    <div>
      <div
        role="region"
        aria-roledescription="スライド"
        aria-label="高1から始めた場合の1年間"
        className="relative aspect-[4/3] md:aspect-[16/9] rounded-xl overflow-hidden cursor-pointer select-none touch-pan-y"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX
          swiped.current = false
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current === null) return
          const dx = e.changedTouches[0].clientX - touchStartX.current
          touchStartX.current = null
          if (Math.abs(dx) < SWIPE_THRESHOLD) return
          swiped.current = true
          go(dx < 0 ? index + 1 : index - 1)
        }}
        onClick={() => {
          if (swiped.current) {
            swiped.current = false
            return
          }
          go(index + 1)
        }}
      >
        {phases.map((p, i) => (
          <img
            key={p.image}
            src={p.image}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
            style={{ opacity: i === index ? 1 : 0 }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />

        {phases.map((p, i) => (
          <div
            key={p.period}
            aria-hidden={i !== index}
            className="absolute inset-x-0 bottom-0 p-6 md:p-10 text-white transition-all duration-700"
            style={{ opacity: i === index ? 1 : 0, transform: `translateY(${i === index ? 0 : 12}px)` }}
          >
            <p className="text-sm font-bold mb-1" style={{ color: GREEN }}>
              {p.period}
            </p>
            <p className="text-2xl md:text-3xl font-bold mb-2">{p.title}</p>
            <p className="text-sm md:text-base text-white/90 leading-relaxed">{p.body}</p>
          </div>
        ))}

        <p className="absolute top-4 right-4 text-xs font-bold text-white/90 bg-black/30 rounded-full px-3 py-1">
          {index + 1} / {phases.length}
        </p>
      </div>

      <p className="sr-only" aria-live="polite">
        {current.period}：{current.title}
      </p>

      {/* 1〜12か月のバー。切り替えに合わせて点がなめらかに移動する */}
      <div className="mt-6 px-2">
        <div className="relative h-6">
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 rounded-full" style={{ backgroundColor: `${NAVY}1A` }} />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${fillWidth}%`, backgroundColor: GREEN }}
          />
          <div
            className="absolute top-1/2 w-5 h-5 rounded-full border-4 border-white shadow transition-all duration-700 ease-out"
            style={{ left: `${dotLeft}%`, transform: 'translate(-50%, -50%)', backgroundColor: NAVY }}
          />
          {phases.map((p, i) => (
            <button
              key={p.period}
              type="button"
              aria-label={`${p.period}を表示`}
              className="absolute top-0 h-full"
              style={{ left: `${((p.start - 1) / 12) * 100}%`, width: `${((p.end - p.start + 1) / 12) * 100}%` }}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs" style={{ color: `${NAVY}99` }}>
          <span>1か月目</span>
          <span>半年</span>
          <span>1年</span>
        </div>
      </div>
    </div>
  )
}
