'use client'

import { useState } from 'react'

type Row = {
  label: string
  nocsy: string
  note?: string
  highlight?: boolean
  others: string[]
}

const NAVY = '#19365B'
const GREEN = '#8CC63F'

// スマホでは5列の表が読めないため、NOCSY塾と選んだ1塾の2列だけを並べる
export default function CompareMobile({ competitors, rows }: { competitors: string[]; rows: Row[] }) {
  const [selected, setSelected] = useState(0)

  return (
    <div>
      <div className="flex items-center justify-center gap-2 mb-4">
        <span className="text-xs font-bold mr-1">比べる塾</span>
        {competitors.map((c, i) => (
          <button
            key={c}
            type="button"
            aria-pressed={i === selected}
            onClick={() => setSelected(i)}
            className="text-sm font-bold px-4 py-1.5 rounded-full border transition-colors"
            style={
              i === selected
                ? { backgroundColor: NAVY, borderColor: NAVY, color: '#FFFFFF' }
                : { backgroundColor: '#FFFFFF', borderColor: `${NAVY}33`, color: NAVY }
            }
          >
            {c}
          </button>
        ))}
      </div>

      <div className="rounded-xl overflow-hidden bg-white">
        <div className="grid grid-cols-[4.5rem_1fr_1fr] text-center text-sm font-bold">
          <div />
          <div className="py-3 text-white" style={{ backgroundColor: NAVY }}>
            NOCSY塾
          </div>
          <div className="py-3">{competitors[selected]}</div>
        </div>
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-[4.5rem_1fr_1fr] border-t text-center"
            style={{ borderColor: `${NAVY}1A` }}
          >
            <div className="flex items-center justify-center px-1 py-4 text-xs leading-snug" style={{ color: `${NAVY}99` }}>
              {row.label}
            </div>
            <div className="flex flex-col justify-center px-2 py-4 text-white" style={{ backgroundColor: NAVY }}>
              <p className="font-bold text-sm leading-snug" style={{ color: row.highlight ? GREEN : undefined }}>
                {row.nocsy}
              </p>
              {row.note && <p className="text-[11px] text-white/80 mt-1 leading-snug">{row.note}</p>}
            </div>
            <div className="flex items-center justify-center px-2 py-4 text-sm leading-snug">
              {row.others[selected]}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
