import { useRef, useEffect } from 'react'

// Knob sweep: 225° (7:30) → 495° (4:30), clockwise through 12
const START_DEG = 225
const SWEEP_DEG = 270

// Convert clockwise-from-top degrees to SVG {x, y}
function polar(cx, cy, r, deg) {
  const rad = (deg * Math.PI) / 180
  return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) }
}

// SVG arc path from startDeg, spanning sweepDeg degrees clockwise
function arcPath(cx, cy, r, startDeg, sweepDeg) {
  if (sweepDeg <= 0) return ''
  const endDeg = startDeg + Math.min(sweepDeg, 359.99)
  const s = polar(cx, cy, r, startDeg)
  const e = polar(cx, cy, r, endDeg)
  const large = sweepDeg > 180 ? 1 : 0
  return `M${s.x.toFixed(2)} ${s.y.toFixed(2)} A${r} ${r} 0 ${large} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`
}

function toNorm(v, min, max, scale) {
  if (scale === 'log') return (Math.log(v) - Math.log(min)) / (Math.log(max) - Math.log(min))
  return (v - min) / (max - min)
}

function fromNorm(t, min, max, scale) {
  const c = Math.max(0, Math.min(1, t))
  if (scale === 'log') return Math.exp(Math.log(min) + c * (Math.log(max) - Math.log(min)))
  return min + c * (max - min)
}

function formatValue(value, unit) {
  if (unit === 'Hz') {
    return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : `${Math.round(value)}`
  }
  return value % 1 === 0 ? `${value}` : `${value.toFixed(1)}`
}

export default function Knob({ label, value, min, max, onChange, unit = '', scale = 'linear', size = 80 }) {
  const elRef = useRef(null)
  // Keep latest state accessible in non-React event listeners
  const stateRef = useRef(null)
  stateRef.current = { value, min, max, scale, onChange }

  // Non-passive wheel listener so we can call preventDefault
  useEffect(() => {
    const el = elRef.current
    function onWheel(e) {
      e.preventDefault()
      const { value, min, max, scale, onChange } = stateRef.current
      const t = toNorm(value, min, max, scale)
      onChange(fromNorm(t - e.deltaY / 600, min, max, scale))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  function onMouseDown(e) {
    e.preventDefault()
    const startY = e.clientY
    const startT = toNorm(value, min, max, scale)

    function onMove(e) {
      const { min, max, scale, onChange } = stateRef.current
      onChange(fromNorm(startT + (startY - e.clientY) / 150, min, max, scale))
    }
    function onUp() {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  const t = toNorm(value, min, max, scale)
  const cx = size / 2
  const cy = size / 2
  const rArc = size * 0.36

  const track = arcPath(cx, cy, rArc, START_DEG, SWEEP_DEG)
  const fill  = arcPath(cx, cy, rArc, START_DEG, t * SWEEP_DEG)
  const dot   = polar(cx, cy, rArc, START_DEG + t * SWEEP_DEG)

  return (
    <div className="flex flex-col items-center gap-2 select-none">
      <div
        ref={elRef}
        onMouseDown={onMouseDown}
        className="rounded-full neu-raised cursor-grab active:cursor-grabbing"
        style={{
          width: size,
          height: size,
          flexShrink: 0,
          background: 'radial-gradient(circle at 38% 36%, var(--sh-light) 0%, var(--bg) 65%)',
        }}
      >
        <svg width={size} height={size}>
          {/* Track (full sweep, background) */}
          <path d={track} fill="none" stroke="var(--sh-dark)" strokeWidth="3.5" strokeLinecap="round" />
          {/* Value fill */}
          {t > 0.005 && (
            <path d={fill} fill="none" stroke="var(--accent)" strokeWidth="3.5" strokeLinecap="round" />
          )}
          {/* Indicator dot */}
          <circle cx={dot.x.toFixed(2)} cy={dot.y.toFixed(2)} r="4" fill="var(--accent)" />
        </svg>
      </div>

      <div className="text-center leading-tight">
        <div style={{ color: 'var(--accent)', fontSize: 11, fontWeight: 700, fontFamily: 'ui-monospace, monospace' }}>
          {formatValue(value, unit)}{unit}
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 2 }}>
          {label}
        </div>
      </div>
    </div>
  )
}
