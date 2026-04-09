// Mini SVG wave paths — viewBox "0 0 40 24", 2 cycles
const WAVEFORMS = [
  {
    id: 'sine',
    label: 'Sine',
    path: 'M 0 12 C 5 2,15 2,20 12 C 25 22,35 22,40 12',
  },
  {
    id: 'square',
    label: 'Square',
    path: 'M 0 19 L 0 5 L 10 5 L 10 19 L 20 19 L 20 5 L 30 5 L 30 19 L 40 19',
  },
  {
    id: 'triangle',
    label: 'Tri',
    path: 'M 0 19 L 10 5 L 20 19 L 30 5 L 40 19',
  },
  {
    id: 'sawtooth',
    label: 'Saw',
    path: 'M 0 19 L 20 5 L 20 19 L 40 5',
  },
]

export default function WaveformSelector({ value, onChange }) {
  return (
    <div className="flex flex-col gap-3">
      <span style={{ color: 'var(--text-muted)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
        Oscillator
      </span>
      <div className="flex gap-3">
        {WAVEFORMS.map(({ id, label, path }) => {
          const active = value === id
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className="flex flex-col items-center gap-2 px-3 py-3 rounded-xl transition-all"
              style={{
                background: 'var(--bg)',
                border: 'none',
                cursor: 'pointer',
                outline: 'none',
                boxShadow: active
                  ? 'inset 3px 3px 7px var(--sh-dark), inset -3px -3px 7px var(--sh-light)'
                  : '4px 4px 10px var(--sh-dark), -4px -4px 10px var(--sh-light)',
              }}
            >
              <svg width="40" height="24" viewBox="0 0 40 24">
                <path
                  d={path}
                  fill="none"
                  stroke={active ? 'var(--accent)' : 'var(--text-muted)'}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span style={{
                fontSize: 9,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: active ? 'var(--accent)' : 'var(--text-muted)',
                fontWeight: active ? 700 : 400,
              }}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
