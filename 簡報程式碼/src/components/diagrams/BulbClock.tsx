/** 感溫包安裝位置示意：吸氣管截面（依一丞手冊圖 5.2，管徑越大越往側邊裝） */

const CENTER = 120
const BULB_R = 96

function polar(hour: number, r: number) {
  const angle = ((hour - 3) * 30 * Math.PI) / 180
  return { x: CENTER + r * Math.cos(angle), y: CENTER + r * Math.sin(angle) }
}

function Bulb({ hour, ok }: { hour: number; ok: boolean }) {
  const { x, y } = polar(hour, BULB_R)
  const stroke = ok ? '#15a06e' : '#d23f2e'
  return (
    <g>
      <circle cx={x} cy={y} r={16} fill={stroke} fillOpacity={0.2} stroke={stroke} strokeWidth={2.5} />
      <text x={x} y={y + 5.5} textAnchor="middle" fontSize={16} fontWeight={800} className={ok ? 'fill-emerald-100' : 'fill-red-100'}>
        {hour}
      </text>
      {!ok && <line x1={x - 13} y1={y - 13} x2={x + 13} y2={y + 13} stroke={stroke} strokeWidth={3} strokeLinecap="round" />}
    </g>
  )
}

export function BulbClock({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 240"
      className={className}
      role="img"
      aria-label="感溫包安裝位置：細管 1 點鐘、中管 2 點鐘、粗管 3 點鐘，避開 6 點鐘正下方"
    >
      {Array.from({ length: 12 }, (_, i) => {
        const a = polar(i + 1, 104)
        const b = polar(i + 1, 110)
        return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#9aabc0" strokeWidth={2} strokeLinecap="round" />
      })}
      <circle cx={CENTER} cy={CENTER} r={74} fill="#ffffff" stroke="#2e7bc8" strokeWidth={8} />
      {/* 管底沉油 */}
      <path d="M 66.4 165 A 70 70 0 0 0 173.6 165 Z" fill="#e0a01b" fillOpacity={0.4} />
      <text x={CENTER} y={184} textAnchor="middle" fontSize={14} fontWeight={700} className="fill-amber-100">
        沉積油膜
      </text>
      <text x={CENTER} y={116} textAnchor="middle" fontSize={16} fontWeight={700} className="fill-slate-200">
        吸氣管
      </text>
      <text x={CENTER} y={138} textAnchor="middle" fontSize={13} className="fill-slate-400">
        管徑越粗越往側邊
      </text>
      <Bulb hour={1} ok />
      <Bulb hour={2} ok />
      <Bulb hour={3} ok />
      <Bulb hour={6} ok={false} />
    </svg>
  )
}
