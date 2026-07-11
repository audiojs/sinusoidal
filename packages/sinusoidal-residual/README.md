# @audio/sinusoidal-residual [![npm](https://img.shields.io/npm/v/@audio/sinusoidal-residual)](https://www.npmjs.com/package/@audio/sinusoidal-residual) [![MIT](https://img.shields.io/badge/MIT-%E0%A5%90-white)](https://github.com/krishnized/license)

Residual noise layer

```
npm install @audio/sinusoidal-residual
```

```js
import residual from '@audio/sinusoidal-residual'
```

The noise layer of the sinusoids+noise model (Serra-Smith SMS): input minus the additive resynthesis of its tracked partials. Phase-blind subtraction is imperfect per partial, so it works spectrally — per frame, subtract each tracked partial's estimated magnitude (Wiener-style soft mask, spread over the Hann mainlobe) from the input magnitude, then resynthesize with the input's own phase. Robust without tracking original phase. Runs [`sinusoidal-track`](https://github.com/audiojs/sinusoidal/tree/main/packages/sinusoidal-track) internally unless a `model` is passed in.

```js
residual(data, { frameSize: 2048 })          // tracks internally
residual(data, { model })                    // reuse an existing analysis
```

| Param | Default | |
|---|---|---|
| `data` | — | Mono PCM (positional) |
| `model` | — | Reuse an existing `sinusoidal-track` model instead of re-tracking |
| *(others)* | — | Forwarded to `sinusoidal-track` when no `model` is given |

Returns a `Float32Array` the same length as `data`.

**Use when:** extracting the noise/transient component for SMS-style decomposition — pairs with `sinusoidal-synth` (the sinusoidal component) to reconstruct the full signal.

---

Part of [@audio/sinusoidal](https://github.com/audiojs/sinusoidal) — the sinusoidal family umbrella.

MIT © [audiojs](https://github.com/audiojs)
