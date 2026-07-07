// Additive resynthesis from partial trajectories — per-sample linear interpolation of
// frequency/amplitude between frame centers, phase integrated for continuity (MQ 1986).

/**
 * @param {{partials, frames, hop, frameSize, fs}} model — from @audio/sinusoidal-track
 * @param {object} opts — { length (samples; default frames·hop + frameSize) }
 * @returns {Float32Array}
 */
export default function synth (model, { length } = {}) {
	let { partials, frames, hop, frameSize, fs } = model
	let n = length ?? frames * hop + frameSize
	let out = new Float32Array(n)
	let center = frameSize / 2

	for (let p of partials) {
		let phase = 0
		let f0 = p.freqs[0]
		let t0 = p.start * hop + center
		// fade in/out one hop at the ends to avoid clicks
		let total = p.freqs.length
		let sampStart = Math.max(0, t0 - hop)
		let sampEnd = Math.min(n, (p.start + total - 1) * hop + center + hop)
		for (let i = sampStart; i < sampEnd; i++) {
			let pos = (i - t0) / hop // fractional frame index within the partial
			let idx = Math.floor(pos)
			let frac = pos - idx
			let f, a
			if (idx < 0) { f = p.freqs[0]; a = p.amps[0] * (1 + pos) }
			else if (idx >= total - 1) {
				f = p.freqs[total - 1]
				a = p.amps[total - 1] * Math.max(0, 1 - (pos - (total - 1)))
			} else {
				f = p.freqs[idx] + (p.freqs[idx + 1] - p.freqs[idx]) * frac
				a = p.amps[idx] + (p.amps[idx + 1] - p.amps[idx]) * frac
			}
			phase += 2 * Math.PI * f / fs
			out[i] += a * Math.sin(phase)
		}
	}
	return out
}
