import { useRef, useEffect } from 'react'

const START_DEG = 225
const SWEEP_DEG = 270

function polar(cx, cy, r, deg) {
  const rad = (deg * Math.PI) / 180
  return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) }
}

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
  if (unit === 'Hz') return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : `${Math.round(value)}`
  return value % 1 === 0 ? `${value}` : `${value.toFixed(1)}`
}

export default function Knob({ label, value, min, max, onChange, unit = '', scale = 'linear', size = 88 }) {
  const elRef    = useRef(null)
  const stateRef = useRef(null)
  stateRef.current = { value, min, max, scale, onChange }

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

  const t       = toNorm(value, min, max, scale)
  const cx      = size / 2
  const cy      = size / 2
  const rArc    = size * 0.34
  const track   = arcPath(cx, cy, rArc, START_DEG, SWEEP_DEG)
  const fill    = arcPath(cx, cy, rArc, START_DEG, t * SWEEP_DEG)
  const pointer = polar(cx, cy, rArc * 0.58, START_DEG + t * SWEEP_DEG)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, userSelect: 'none' }}>
      <div
        ref={elRef}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuetext={`${formatValue(value, unit)}${unit}`}
        onMouseDown={onMouseDown}
        onKeyDown={(e) => {
          const step = e.shiftKey ? 0.005 : 0.02
          const { value, min, max, scale, onChange } = stateRef.current
          const t = toNorm(value, min, max, scale)
          if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
            e.preventDefault(); onChange(fromNorm(t + step, min, max, scale))
          } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
            e.preventDefault(); onChange(fromNorm(t - step, min, max, scale))
          } else if (e.key === 'Home') {
            e.preventDefault(); onChange(min)
          } else if (e.key === 'End') {
            e.preventDefault(); onChange(max)
          }
        }}
        style={{
          // content-box so the SVG fills exactly size×size inside the border
          boxSizing: 'content-box',
          width: size, height: size, flexShrink: 0,
          background: 'var(--white)',
          border: '3px solid var(--black)',
          borderRadius: '50%',
          cursor: 'grab',
        }}
      >
        <svg width={size} height={size}>
          {/* Full track */}
          <path d={track} fill="none" stroke="#d0cfc8" strokeWidth="2" strokeLinecap="butt" />
          {/* Value arc — bold red */}
          {t > 0.005 && (
            <path d={fill} fill="none" stroke="var(--red)" strokeWidth="5.5" strokeLinecap="butt" />
          )}
          {/* Pointer line */}
          <line
            x1={cx} y1={cy}
            x2={pointer.x.toFixed(2)} y2={pointer.y.toFixed(2)}
            stroke="var(--black)" strokeWidth="2.5"
          />
          {/* Center dot */}
          <circle cx={cx} cy={cy} r="4" fill="var(--black)" />
        </svg>
      </div>

      <div style={{ textAlign: 'center', lineHeight: 1.2 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--black)' }}>
          {formatValue(value, unit)}{unit}
        </div>
        <div style={{ fontFamily: 'var(--font-title)', fontSize: 12, letterSpacing: '0.2em', color: '#5e5e5e', marginTop: 3 }}>
          {label}
        </div>
      </div>
    </div>
  )
}
