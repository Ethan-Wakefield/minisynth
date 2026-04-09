import { useEffect, useRef, useState, useCallback } from 'react'
import { createSynth } from '../audio/synth'
import WaveformSelector from './WaveformSelector'
import FilterControl from './FilterControl'
import Keyboard from './Keyboard'
import WaveDisplay from './WaveDisplay'

export default function Synth() {
  const synthRef = useRef(null)
  const [waveform,   setWaveform]   = useState('sine')
  const [filterFreq, setFilterFreq] = useState(4000)
  const [activeFreqs, setActiveFreqs] = useState(new Set())
  const [analyser,   setAnalyser]   = useState(null)

  useEffect(() => {
    const synth = createSynth()
    synthRef.current = synth
    setAnalyser(synth.getAnalyser())
    return () => synth.dispose()
  }, [])

  const handleWaveform = useCallback((w) => {
    setWaveform(w)
    synthRef.current?.setWaveform(w)
  }, [])

  const handleFilterFreq = useCallback((f) => {
    setFilterFreq(f)
    synthRef.current?.setFilterFrequency(f)
  }, [])

  const noteOn = useCallback((freq) => {
    synthRef.current?.noteOn(freq)
    setActiveFreqs(prev => new Set(prev).add(freq))
  }, [])

  const noteOff = useCallback((freq) => {
    synthRef.current?.noteOff(freq)
    setActiveFreqs(prev => { const s = new Set(prev); s.delete(freq); return s })
  }, [])

  const isPlaying = activeFreqs.size > 0

  return (
    <div
      className="min-h-screen flex items-center justify-center p-8"
      style={{ background: 'var(--bg)' }}
    >
      {/* Synth body */}
      <div
        className="neu-raised rounded-3xl p-8 flex flex-col gap-7"
        style={{ background: 'var(--bg)' }}
      >
        {/* Header */}
        <div className="flex items-center gap-2">
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 6px var(--accent)' }} />
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.35em', textTransform: 'uppercase', color: 'var(--text)' }}>
            Minisynth
          </span>
        </div>

        {/* Controls row: OSC + Filter | Scope */}
        <div className="flex gap-8">
          {/* Left column */}
          <div className="flex flex-col gap-7">
            <WaveformSelector value={waveform} onChange={handleWaveform} />
            <FilterControl
              frequency={filterFreq}
              onFrequencyChange={handleFilterFreq}
            />
          </div>

          {/* Scope */}
          <div className="flex flex-col gap-3 flex-1" style={{ minWidth: 300 }}>
            <span style={{ color: 'var(--text-muted)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              Scope
            </span>
            <div
              className="flex-1 rounded-2xl neu-inset flex items-center px-4"
              style={{ minHeight: 120 }}
            >
              <WaveDisplay
                analyser={analyser}
                isPlaying={isPlaying}
                waveform={waveform}
              />
            </div>
          </div>
        </div>

        {/* Keyboard */}
        <Keyboard
          activeFreqs={activeFreqs}
          onNoteOn={noteOn}
          onNoteOff={noteOff}
        />
      </div>
    </div>
  )
}
