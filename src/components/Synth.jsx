import { useEffect, useRef, useState, useCallback } from 'react'
import { createSynth } from '../audio/synth'
import WaveformSelector from './WaveformSelector'
import FilterControl from './FilterControl'
import Keyboard from './Keyboard'
import WaveDisplay from './WaveDisplay'

// Shared border constant
const B = 'var(--border)'

// Section header: coloured square + Bebas Neue label
function Label({ dot, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 16 }}>
      <div style={{ width: 8, height: 8, background: dot, flexShrink: 0 }} />
      <span style={{ fontFamily: 'var(--font-title)', fontSize: 14, letterSpacing: '0.22em', color: 'var(--black)' }}>
        {children}
      </span>
    </div>
  )
}

export default function Synth() {
  const synthRef = useRef(null)
  const [waveform,    setWaveform]    = useState('sine')
  const [filterFreq,  setFilterFreq]  = useState(4000)
  const [activeFreqs, setActiveFreqs] = useState(new Set())
  const [analyser,    setAnalyser]    = useState(null)

  useEffect(() => {
    const synth = createSynth()
    synthRef.current = synth
    setAnalyser(synth.getAnalyser())
    return () => synth.dispose()
  }, [])

  const handleWaveform = useCallback((w) => {
    setWaveform(w); synthRef.current?.setWaveform(w)
  }, [])

  const handleFilterFreq = useCallback((f) => {
    setFilterFreq(f); synthRef.current?.setFilterFrequency(f)
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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      {/* Synth panel */}
      <div style={{
        width: 'min(800px, calc(100vw - 48px))',
        background: 'var(--white)',
        border: B,
      }}>

        {/* Red accent stripe */}
        <div style={{ height: 6, background: 'var(--red)' }} />

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '13px 20px',
          borderBottom: B,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 11, height: 11, background: 'var(--red)' }} />
            <span style={{
              fontFamily: 'var(--font-title)',
              fontSize: 22,
              letterSpacing: '0.35em',
              color: 'var(--black)',
            }}>
              Minisynth
            </span>
          </div>
          {/* Bauhaus geometric accent: yellow + blue blocks */}
          <div style={{ display: 'flex' }}>
            <div style={{ width: 22, height: 22, background: 'var(--yellow)' }} />
            <div style={{ width: 22, height: 22, background: 'var(--blue)' }} />
          </div>
        </div>

        {/* Controls row — three sections separated by thick borders */}
        <div style={{ display: 'flex', borderBottom: B }}>

          {/* Oscillator */}
          <div style={{ padding: '20px 20px', borderRight: B, flexShrink: 0 }}>
            <Label dot="var(--yellow)">Oscillator</Label>
            <WaveformSelector value={waveform} onChange={handleWaveform} />
          </div>

          {/* Filter — centered horizontally and vertically */}
          <div style={{
            padding: '20px 28px',
            borderRight: B,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Label dot="var(--blue)">Filter</Label>
            <FilterControl frequency={filterFreq} onFrequencyChange={handleFilterFreq} />
          </div>

          {/* Scope — fills remaining width, dark background */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div style={{ padding: '20px 20px 12px' }}>
              <Label dot={isPlaying ? 'var(--red)' : '#555'}>
                {isPlaying ? 'Scope — Live' : 'Scope'}
              </Label>
            </div>
            <div style={{ flex: 1, background: 'var(--scope)', borderTop: B }}>
              <WaveDisplay analyser={analyser} isPlaying={isPlaying} waveform={waveform} />
            </div>
          </div>

        </div>

        {/* Keyboard — no horizontal padding, fills full panel width */}
        <Keyboard activeFreqs={activeFreqs} onNoteOn={noteOn} onNoteOff={noteOff} />

      </div>
    </div>
  )
}
