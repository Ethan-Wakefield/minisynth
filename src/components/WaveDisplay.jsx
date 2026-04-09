import { useEffect, useRef } from 'react'

const ACCENT     = '#6b5ce7'
const GRID_COLOR = 'rgba(107, 92, 231, 0.12)'
const LOGICAL_W  = 500
const LOGICAL_H  = 100

// Static waveform for preview when no note is playing (2 cycles)
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
      ctx.clearRect(0, 0, LOGICAL_W, LOGICAL_H)

      // Center guide line
      ctx.beginPath()
      ctx.strokeStyle = GRID_COLOR
      ctx.lineWidth = 1
      ctx.setLineDash([5, 5])
      ctx.moveTo(0, LOGICAL_H / 2)
      ctx.lineTo(LOGICAL_W, LOGICAL_H / 2)
      ctx.stroke()
      ctx.setLineDash([])

      // Sample data: live from analyser or static preview
      let data
      if (isPlaying && analyser) {
        data = new Float32Array(analyser.fftSize)
        analyser.getFloatTimeDomainData(data)
      } else {
        data = staticWave(waveform, 512)
      }

      // Draw waveform
      ctx.beginPath()
      ctx.strokeStyle = ACCENT
      ctx.lineWidth = 2
      ctx.lineJoin = 'round'

      const n = data.length
      for (let i = 0; i < n; i++) {
        const x = (i / (n - 1)) * LOGICAL_W
        const y = LOGICAL_H / 2 - data[i] * LOGICAL_H * 0.43
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.stroke()

      if (isPlaying) {
        rafRef.current = requestAnimationFrame(draw)
      }
    }

    draw()
    return () => { cancelAnimationFrame(rafRef.current) }
  }, [analyser, isPlaying, waveform])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: LOGICAL_H, display: 'block' }}
    />
  )
}
