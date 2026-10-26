'use client'

import { useRef, useState } from 'react'

type Phase = {
  period: string
  start: number
  end: number
  title: string
  body: string
  image: string
  busyBackground?: boolean
}

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
    <div
      role="region"
      aria-roledescription="スライド"
      aria-label="高1から始めた場合の1年間"
      // スマホでは親の左右余白を打ち消して画面の横幅いっぱいに広げ、高さは画面の約65%にする
      className="relative -mx-6 md:mx-0 h-[65svh] min-h-[420px] md:h-auto md:min-h-0 md:aspect-[16/9] md:rounded-xl overflow-hidden cursor-pointer select-none touch-pan-y"
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
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            p.busyBackground ? 'blur-[3px] scale-105' : ''
          }`}
          style={{ opacity: i === index ? 1 : 0 }}
        />
      ))}
      <div
        className="absolute inset-0 bg-black/55 transition-opacity duration-700"
        style={{ opacity: current.busyBackground ? 1 : 0 }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />

      <p className="absolute top-4 right-4 text-xs font-bold text-white/90 bg-black/30 rounded-full px-3 py-1">
        {index + 1} / {phases.length}
      </p>

      <div className="absolute inset-x-0 bottom-0 px-6 pb-7 md:px-10 md:pb-9 text-white">
        {/* 各時期の文字を同じ場所に重ね、表示中のものだけを見せる */}
        <div className="grid">
          {phases.map((p, i) => (
            <div
              key={p.period}
              aria-hidden={i !== index}
              className="col-start-1 row-start-1 self-end transition-all duration-700"
              style={{ opacity: i === index ? 1 : 0, transform: `translateY(${i === index ? 0 : 12}px)` }}
            >
              <p className="text-sm font-bold mb-1" style={{ color: GREEN }}>
                {p.period}
              </p>
              <p className="text-2xl md:text-3xl font-bold mb-2">{p.title}</p>
              <p className="text-sm md:text-base text-white/90 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>

        {/* 1〜12か月のバー。切り替えに合わせて点がなめらかに移動する */}
        <div className="mt-6">
          <div className="relative h-5">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 rounded-full bg-white/30" />
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 rounded-full bg-white transition-all duration-700 ease-out"
              style={{ width: `${fillWidth}%` }}
            />
            <div
              className="absolute top-1/2 w-3.5 h-3.5 rounded-full bg-white transition-all duration-700 ease-out"
              style={{ left: `${dotLeft}%`, transform: 'translate(-50%, -50%)' }}
            />
            {phases.map((p, i) => (
              <button
                key={p.period}
                type="button"
                aria-label={`${p.period}を表示`}
                className="absolute top-0 h-full"
                style={{ left: `${((p.start - 1) / 12) * 100}%`, width: `${((p.end - p.start + 1) / 12) * 100}%` }}
                onClick={(e) => {
                  e.stopPropagation()
                  setIndex(i)
                }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-1 text-[11px] text-white/70">
            <span>1か月目</span>
            <span>半年</span>
            <span>1年</span>
          </div>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {current.period}：{current.title}
      </p>
    </div>
  )
}
