import { useEffect, useRef, useState } from 'react'

const NOTES = [
  { note: 'C4',  freq: 261.63, key: 'a', black: false },
  { note: 'C#4', freq: 277.18, key: 'w', black: true  },
  { note: 'D4',  freq: 293.66, key: 's', black: false },
  { note: 'D#4', freq: 311.13, key: 'e', black: true  },
  { note: 'E4',  freq: 329.63, key: 'd', black: false },
  { note: 'F4',  freq: 349.23, key: 'f', black: false },
  { note: 'F#4', freq: 369.99, key: 't', black: true  },
  { note: 'G4',  freq: 392.00, key: 'g', black: false },
  { note: 'G#4', freq: 415.30, key: 'y', black: true  },
  { note: 'A4',  freq: 440.00, key: 'h', black: false },
  { note: 'A#4', freq: 466.16, key: 'u', black: true  },
  { note: 'B4',  freq: 493.88, key: 'j', black: false },
  { note: 'C5',  freq: 523.25, key: 'k', black: false },
]

const KEY_MAP      = Object.fromEntries(NOTES.map(n => [n.key, n.freq]))
const BLACK_OFFSETS = { 'C#4': 1, 'D#4': 2, 'F#4': 4, 'G#4': 5, 'A#4': 6 }
const WHITE_KEYS   = NOTES.filter(n => !n.black)
const BLACK_KEYS   = NOTES.filter(n => n.black)
const NUM_WHITE    = WHITE_KEYS.length  // 8

const WHITE_H = 148
const BLACK_H = 92

export default function Keyboard({ activeFreqs, onNoteOn, onNoteOff }) {
  const containerRef = useRef(null)
  const [keyW, setKeyW] = useState(60)

  // Scale key width to always fill container
  useEffect(() => {
    const obs = new ResizeObserver(([entry]) => {
      setKeyW(Math.floor(entry.contentRect.width / NUM_WHITE))
    })
    obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [])

  // Computer keyboard
  useEffect(() => {
    const held = new Set()
    function onKeyDown(e) {
      if (e.repeat) return
      const freq = KEY_MAP[e.key.toLowerCase()]
      if (freq && !held.has(e.key)) { held.add(e.key); onNoteOn(freq) }
    }
    function onKeyUp(e) {
      const freq = KEY_MAP[e.key.toLowerCase()]
      if (freq) { held.delete(e.key); onNoteOff(freq) }
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [onNoteOn, onNoteOff])

  const blackW = Math.round(keyW * 0.58)

  return (
    <div>
      {/* Label strip */}
      <div style={{
        padding: '7px 14px',
        borderTop: 'var(--border)',
        borderBottom: '1px solid rgba(15,15,15,0.25)',
        background: 'var(--white)',
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 8,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: '#5e5e5e',
        }}>
          Keyboard — A–K &amp; W E T Y U
        </span>
      </div>

      {/* Keys — fills 100% width via containerRef + ResizeObserver */}
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: '100%',
          height: WHITE_H,
          background: 'var(--white)',
          overflow: 'hidden',
        }}
      >
        {/* White keys */}
        {WHITE_KEYS.map((n, i) => {
          const active = activeFreqs.has(n.freq)
          return (
            <div
              key={n.note}
              role="button"
              tabIndex={0}
              aria-label={n.note}
              aria-pressed={active}
              onMouseDown={() => onNoteOn(n.freq)}
              onMouseUp={() => onNoteOff(n.freq)}
              onMouseLeave={() => onNoteOff(n.freq)}
              onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') onNoteOn(n.freq) }}
              onKeyUp={(e) => { if (e.key === ' ' || e.key === 'Enter') onNoteOff(n.freq) }}
              style={{
                position: 'absolute',
                left: i * keyW,
                top: 0,
                width: keyW,
                height: WHITE_H,
                borderRight: i < WHITE_KEYS.length - 1 ? '1px solid var(--black)' : 'none',
                background: active ? 'var(--red)' : 'var(--white)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                alignItems: 'center',
                paddingBottom: 9,
                userSelect: 'none',
              }}
            >
              <span aria-hidden="true" style={{
                fontFamily: 'var(--font-mono)',
                fontSize: Math.min(9, keyW * 0.17),
                // #5e5e5e on #f5f4f0 = 5.9:1 contrast — passes WCAG AA
                color: active ? 'var(--white)' : '#5e5e5e',
                lineHeight: 1,
              }}>
                {n.key.toUpperCase()}
              </span>
            </div>
          )
        })}

        {/* Black keys */}
        {BLACK_KEYS.map(n => {
          const active = activeFreqs.has(n.freq)
          return (
            <div
              key={n.note}
              role="button"
              tabIndex={0}
              aria-label={n.note}
              aria-pressed={active}
              onMouseDown={e => { e.stopPropagation(); onNoteOn(n.freq) }}
              onMouseUp={e => { e.stopPropagation(); onNoteOff(n.freq) }}
              onMouseLeave={() => onNoteOff(n.freq)}
              onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.stopPropagation(); onNoteOn(n.freq) } }}
              onKeyUp={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.stopPropagation(); onNoteOff(n.freq) } }}
              style={{
                position: 'absolute',
                left: BLACK_OFFSETS[n.note] * keyW - blackW / 2,
                top: 0,
                width: blackW,
                height: BLACK_H,
                zIndex: 10,
                background: active ? 'var(--red)' : 'var(--black)',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
