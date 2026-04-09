# Minisynth

A minimal browser synthesizer built with React and the Web Audio API.

## Features

- **Oscillator** — sine, square, triangle, sawtooth waveforms
- **Filter** — lowpass filter with cutoff (log scale) and resonance knobs
- **Scope** — live waveform display showing the filtered signal in real time; static preview when silent
- **Keyboard** — one octave (C4–C5), playable by mouse click or computer keyboard

## Keyboard shortcuts

| White keys | `A` `S` `D` `F` `G` `H` `J` `K` |
|------------|----------------------------------|
| Black keys | `W` `E` &nbsp; `T` `Y` `U`      |

## Tech

- React 19 (functional components + hooks)
- Web Audio API (no audio libraries)
- Tailwind CSS v4
- Vite

## Getting started

```
npm install
npm run dev
```
