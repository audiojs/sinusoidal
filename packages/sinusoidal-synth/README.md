# @audio/sinusoidal-synth [![npm](https://img.shields.io/npm/v/@audio/sinusoidal-synth)](https://www.npmjs.com/package/@audio/sinusoidal-synth) [![MIT](https://img.shields.io/badge/MIT-%E0%A5%90-white)](https://github.com/krishnized/license)

Additive resynthesis, trajectory smoothing

```
npm install @audio/sinusoidal-synth
```

```js
import synth from '@audio/sinusoidal-synth'
```

Additive resynthesis from the partial trajectories produced by [`sinusoidal-track`](https://github.com/audiojs/sinusoidal/tree/main/packages/sinusoidal-track): per-sample linear interpolation of frequency/amplitude between frame centers, with phase integrated for continuity (McAulay-Quatieri 1986) — no clicks at partial start/end (one-hop fade in/out).

```js
let model = track(data)
let out = synth(model, { length: data.length })   // → Float32Array
```

| Param | Default | |
|---|---|---|
| `model` | — | `{partials, frames, hop, frameSize, fs}` from `sinusoidal-track` (positional) |
| `length` | `frames·hop + frameSize` | Output length, samples |

**Use when:** resynthesizing tracked partials — after trajectory editing/smoothing (pitch correction, formant shifting) or as the sinusoidal half of an SMS reconstruction (pairs with [`sinusoidal-residual`](https://github.com/audiojs/sinusoidal/tree/main/packages/sinusoidal-residual) for the noise layer).

---

Part of [@audio/sinusoidal](https://github.com/audiojs/sinusoidal) — the sinusoidal family umbrella.

MIT © [audiojs](https://github.com/audiojs)
