import { useEffect, useRef } from 'react'

const LOGICAL_W   = 500
const LOGICAL_H   = 120
const BG          = '#0d0d0d'
const AXIS        = 'rgba(255,255,255,0.07)'
const LINE_STATIC = 'rgba(245,244,240,0.45)'
const LINE_LIVE   = '#C8281E'

function staticWave(type, n) {
  const d = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const t = (i / n * 2) % 1
    switch (type) {
      case 'sine':     d[i] = Math.sin(t * 2 * Math.PI); break
      case 'square':   d[i] = t < 0.5 ? 0.85 : -0.85; break
      case 'triangle': d[i] = (t < 0.5 ? 4 * t - 1 : 3 - 4 * t) * 0.9; break
      case 'sawtooth': d[i] = (2 * t - 1) * 0.9; break
      default:         d[i] = 0
    }
  }
  return d
}

export default function WaveDisplay({ analyser, isPlaying, waveform }) {
  const canvasRef = useRef(null)
  const rafRef    = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const dpr = window.devicePixelRatio || 1
    canvas.width  = LOGICAL_W * dpr
    canvas.height = LOGICAL_H * dpr
    const ctx = canvas.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    function draw() {
      // Background
      ctx.fillStyle = BG
      ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H)

      // Center axis
      ctx.beginPath()
      ctx.strokeStyle = AXIS
      ctx.lineWidth = 1
      ctx.moveTo(0, LOGICAL_H / 2)
      ctx.lineTo(LOGICAL_W, LOGICAL_H / 2)
      ctx.stroke()

      // Sample data
      let data
      if (isPlaying && analyser) {
        data = new Float32Array(analyser.fftSize)
        analyser.getFloatTimeDomainData(data)
      } else {
        data = staticWave(waveform, 512)
      }

      // Waveform
      ctx.beginPath()
      ctx.strokeStyle = isPlaying ? LINE_LIVE : LINE_STATIC
      ctx.lineWidth = isPlaying ? 2 : 1.5
      ctx.lineJoin = 'miter'

      const n = data.length
      for (let i = 0; i < n; i++) {
        const x = (i / (n - 1)) * LOGICAL_W
        const y = LOGICAL_H / 2 - data[i] * LOGICAL_H * 0.42
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.stroke()

      if (isPlaying) rafRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(rafRef.current)
  }, [analyser, isPlaying, waveform])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: LOGICAL_H, display: 'block' }}
    />
  )
}
