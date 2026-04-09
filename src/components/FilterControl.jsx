import Knob from './Knob'

// Wrapper removed — centering is handled by the parent section in Synth.jsx
export default function FilterControl({ frequency, onFrequencyChange }) {
  return (
    <Knob
      label="Cutoff"
      value={frequency}
      min={80}
      max={18000}
      unit="Hz"
      scale="log"
      onChange={onFrequencyChange}
    />
  )
}
