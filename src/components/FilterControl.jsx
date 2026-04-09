import Knob from './Knob'

export default function FilterControl({ frequency, onFrequencyChange }) {
  return (
    <div className="flex flex-col gap-3">
      <span style={{ color: 'var(--text-muted)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
        Filter
      </span>
      <Knob
        label="Cutoff"
        value={frequency}
        min={80}
        max={18000}
        unit="Hz"
        scale="log"
        onChange={onFrequencyChange}
      />
    </div>
  )
}
