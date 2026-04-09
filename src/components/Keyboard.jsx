import { useEffect } from 'react'

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

const KEY_MAP = Object.fromEntries(NOTES.map(n => [n.key, n.freq]))

// White-key index at which each black key is centred
const BLACK_OFFSETS = { 'C#4': 1, 'D#4': 2, 'F#4': 4, 'G#4': 5, 'A#4': 6 }

const WHITE_W = 48
const BLACK_W = 30
const WHITE_H = 140
const BLACK_H = 90

export default function Keyboard({ activeFreqs, onNoteOn, onNoteOff }) {
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

  const whites = NOTES.filter(n => !n.black)
  const blacks = NOTES.filter(n => n.black)

  return (
    <div className="flex flex-col gap-3">
      <span style={{ color: 'var(--text-muted)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
        Keyboard&nbsp;
        <span style={{ textTransform: 'none', fontWeight: 400, fontSize: 9 }}>
          — A–K &amp; W E T Y U
        </span>
      </span>

      <div
        className="relative select-none"
        style={{ width: whites.length * WHITE_W, height: WHITE_H }}
      >
        {/* White keys */}
        {whites.map((n, i) => {
          const active = activeFreqs.has(n.freq)
          return (
            <div
              key={n.note}
              onMouseDown={() => onNoteOn(n.freq)}
              onMouseUp={() => onNoteOff(n.freq)}
              onMouseLeave={() => onNoteOff(n.freq)}
              style={{
                position: 'absolute',
                left: i * WHITE_W,
                width: WHITE_W - 2,
                height: WHITE_H,
                borderRadius: '0 0 8px 8px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                alignItems: 'center',
                paddingBottom: 8,
                transition: 'background 0.05s',
                background: active ? 'rgba(107,92,231,0.18)' : '#f6f6fa',
                boxShadow: active
                  ? 'inset 3px 3px 8px var(--sh-dark), inset -2px -2px 5px var(--sh-light)'
                  : '3px 5px 10px var(--sh-dark), -1px -1px 4px var(--sh-light)',
              }}
            >
              <span style={{ fontSize: 9, color: 'var(--text-muted)', lineHeight: 1 }}>
                {n.key.toUpperCase()}
              </span>
            </div>
          )
        })}

        {/* Black keys */}
        {blacks.map(n => {
          const active = activeFreqs.has(n.freq)
          return (
            <div
              key={n.note}
              onMouseDown={e => { e.stopPropagation(); onNoteOn(n.freq) }}
              onMouseUp={e => { e.stopPropagation(); onNoteOff(n.freq) }}
              onMouseLeave={() => onNoteOff(n.freq)}
              style={{
                position: 'absolute',
                left: BLACK_OFFSETS[n.note] * WHITE_W - BLACK_W / 2,
                width: BLACK_W,
                height: BLACK_H,
                zIndex: 10,
                borderRadius: '0 0 6px 6px',
                cursor: 'pointer',
                transition: 'background 0.05s',
                background: active ? '#5a4cbf' : '#2e2e4a',
                boxShadow: active
                  ? 'inset 2px 2px 6px rgba(0,0,0,0.5)'
                  : '3px 6px 12px rgba(0,0,0,0.35)',
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
