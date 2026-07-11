# @audio/sinusoidal-track [![npm](https://img.shields.io/npm/v/@audio/sinusoidal-track)](https://www.npmjs.com/package/@audio/sinusoidal-track) [![MIT](https://img.shields.io/badge/MIT-%E0%A5%90-white)](https://github.com/krishnized/license)

Peak picking + partial tracking

```
npm install @audio/sinusoidal-track
```

```js
import track from '@audio/sinusoidal-track'
```

Sinusoidal analysis: STFT spectral peaks with parabolic interpolation, linked frame-to-frame into partial trajectories by nearest-frequency continuation within a cents threshold (McAulay & Quatieri 1986). Produces the `model` consumed by [`sinusoidal-synth`](https://github.com/audiojs/sinusoidal/tree/main/packages/sinusoidal-synth) (additive resynthesis) and [`sinusoidal-residual`](https://github.com/audiojs/sinusoidal/tree/main/packages/sinusoidal-residual) (noise layer).

```js
let model = track(data, { frameSize: 2048, hop: 512 })
// model.partials: [{ start, freqs: number[], amps: number[] }, ...]
```

| Param | Default | |
|---|---|---|
| `fs` | `44100` | Sample rate |
| `frameSize` | `2048` | STFT frame |
| `hop` | `512` | STFT hop |
| `maxPartials` | `40` | Peaks kept per frame |
| `threshold` | `-60` | Peak floor, dB relative to frame max |
| `maxJump` | `60` | Max cents jump for partial continuation |

Returns `{ partials, frames, hop, frameSize, fs }` — `partials` only includes trajectories lasting ≥3 frames.

**Use when:** the analysis stage of the sinusoids+noise (SMS) pipeline — additive resynthesis, residual extraction, or trajectory-based processing (smoothing, transposition).

---

Part of [@audio/sinusoidal](https://github.com/audiojs/sinusoidal) — the sinusoidal family umbrella.

MIT © [audiojs](https://github.com/audiojs)
