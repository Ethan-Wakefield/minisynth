const WAVEFORMS = [
  { id: 'sine',     label: 'Sine',   path: 'M 0 12 C 5 2,15 2,20 12 C 25 22,35 22,40 12' },
  { id: 'square',   label: 'Square', path: 'M 0 19 L 0 5 L 10 5 L 10 19 L 20 19 L 20 5 L 30 5 L 30 19 L 40 19' },
  { id: 'triangle', label: 'Tri',    path: 'M 0 19 L 10 5 L 20 19 L 30 5 L 40 19' },
  { id: 'sawtooth', label: 'Saw',    path: 'M 0 19 L 20 5 L 20 19 L 40 5' },
]

export default function WaveformSelector({ value, onChange }) {
  return (
    <div style={{ border: '3px solid var(--black)', display: 'flex' }}>
      {WAVEFORMS.map(({ id, label, path }, i) => {
        const active = value === id
        return (
          <button
            key={id}
            aria-pressed={active}
            onClick={() => onChange(id)}
            style={{
              flex: 1,
              padding: '14px 10px',
              cursor: 'pointer',
              border: 'none',
              borderRight: i < WAVEFORMS.length - 1 ? '2px solid var(--black)' : 'none',
              background: active ? 'var(--black)' : 'var(--white)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
              outline: 'none',
            }}
          >
            <svg width="40" height="24" viewBox="0 0 40 24">
              <path
                d={path}
                fill="none"
                stroke={active ? 'var(--white)' : 'var(--black)'}
                strokeWidth="2"
                strokeLinecap="square"
                strokeLinejoin="miter"
              />
            </svg>
            <span style={{
              fontFamily: 'var(--font-title)',
              fontSize: 13,
              letterSpacing: '0.15em',
              color: active ? 'var(--white)' : 'var(--black)',
            }}>
              {label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
