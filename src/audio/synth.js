/**
 * synth.js — Web Audio API logic, no React.
 * Chain: masterGain → filter → analyser → destination
 */

export function createSynth() {
  const ctx = new AudioContext()

  const masterGain = ctx.createGain()
  masterGain.gain.value = 0.15

  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 4000
  filter.Q.value = 1

  const analyser = ctx.createAnalyser()
  analyser.fftSize = 2048
  analyser.smoothingTimeConstant = 0.1

  masterGain.connect(filter)
  filter.connect(analyser)
  analyser.connect(ctx.destination)

  let waveform = 'sine'
  const active = new Map()  // freq → { osc, gain }

  function noteOn(freq) {
    if (active.has(freq)) return
    if (ctx.state === 'suspended') ctx.resume()

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = waveform
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.01)
    osc.connect(gain)
    gain.connect(masterGain)
    osc.start()
    active.set(freq, { osc, gain })
  }

  function noteOff(freq) {
    const node = active.get(freq)
    if (!node) return
    const { osc, gain } = node
    const release = 0.08
    gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + release)
    osc.stop(ctx.currentTime + release)
    active.delete(freq)
  }

  function setWaveform(type) {
    waveform = type
    active.forEach(({ osc }) => { osc.type = type })
  }

  function setFilterFrequency(freq) {
    filter.frequency.setTargetAtTime(freq, ctx.currentTime, 0.01)
  }

  function getAnalyser() { return analyser }

  function dispose() {
    active.forEach(({ osc }) => osc.stop())
    active.clear()
    ctx.close()
  }

  return { noteOn, noteOff, setWaveform, setFilterFrequency, getAnalyser, dispose }
}
