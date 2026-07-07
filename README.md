# @audio/sinusoidal

> Sinusoids + noise + transients modeling (McAulay-Quatieri 1986, Serra-Smith SMS). All planned.

| Package | What |
|---|---|
| `@audio/sinusoidal-track` | peak picking + partial tracking |
| `@audio/sinusoidal-synth` | additive resynthesis, trajectory smoothing |
| `@audio/sinusoidal-residual` | residual noise layer |

The De-Slop ambitious path ("gaussian splats for sound") — smooth partial trajectories to remove AI-codec pitch jitter and formant wobble. `@audio/shift-sms` / `@audio/stretch-sms` are the first consumers; `speech-world` (WORLD vocoder) builds on the same decomposition.
