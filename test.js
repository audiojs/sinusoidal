import test, { almost, ok, is } from 'tst'
import { track, synth, residual } from './index.js'

const fs = 44100

function tones (specs, n = fs) {
	let d = new Float32Array(n)
	for (let [f, a] of specs) for (let i = 0; i < n; i++) d[i] += a * Math.sin(2 * Math.PI * f * i / fs)
	return d
}
function rms (d, from = 0, to = d.length) {
	let s = 0
	for (let i = from; i < to; i++) s += d[i] * d[i]
	return Math.sqrt(s / (to - from))
}

test('track — finds both partials of a two-tone with correct freqs and amp ratio', () => {
	let m = track(tones([[440, 0.5], [1320, 0.15]]), { fs })
	let long = m.partials.filter(p => p.freqs.length > m.frames * 0.8)
	is(long.length, 2, long.length + ' persistent partials')
	long.sort((a, b) => a.freqs[0] - b.freqs[0])
	almost(long[0].freqs[10], 440, 2)
	almost(long[1].freqs[10], 1320, 4)
	let a0 = long[0].amps[10], a1 = long[1].amps[10]
	almost(a1 / a0, 0.3, 0.05, 'amp ratio ' + (a1 / a0).toFixed(3))
})

test('track — vibrato contour is followed', () => {
	let n = fs
	let d = new Float32Array(n), phase = 0
	for (let i = 0; i < n; i++) {
		let f = 440 + 25 * Math.sin(2 * Math.PI * 5 * i / fs)
		phase += 2 * Math.PI * f / fs
		d[i] = 0.5 * Math.sin(phase)
	}
	let m = track(d, { fs })
	let p = m.partials.sort((a, b) => b.freqs.length - a.freqs.length)[0]
	let lo = Math.min(...p.freqs), hi = Math.max(...p.freqs)
	ok(lo < 425 && hi > 455, 'contour spans ' + lo.toFixed(0) + '–' + hi.toFixed(0) + ' Hz')
})

test('synth(track(x)) reconstructs stationary tones', () => {
	let d = tones([[440, 0.5], [1320, 0.15]])
	let y = synth(track(d, { fs }), { length: d.length })
	let err = new Float32Array(d.length)
	for (let i = 0; i < d.length; i++) err[i] = d[i] - y[i]
	// phase-blind resynthesis: compare energy envelopes, not waveforms
	let target = rms(d, 8192, d.length - 8192)
	let got = rms(y, 8192, d.length - 8192)
	almost(got / target, 1, 0.15, 'energy ratio ' + (got / target).toFixed(3))
	ok(y.every(isFinite))
})

test('residual — tonal content removed, noise retained', () => {
	let tonal = tones([[440, 0.5], [880, 0.25]])
	let rTonal = residual(tonal, { fs })
	ok(rms(rTonal, 8192, tonal.length - 8192) < 0.2 * rms(tonal, 8192, tonal.length - 8192), 'sines mostly removed')

	let n = fs, s = 5
	let noise = new Float32Array(n)
	for (let i = 0; i < n; i++) { s = (s * 1103515245 + 12345) & 0x7fffffff; noise[i] = 0.3 * (s / 0x3fffffff - 1) }
	let rNoise = residual(noise, { fs })
	ok(rms(rNoise, 8192, n - 8192) > 0.6 * rms(noise, 8192, n - 8192), 'noise layer survives')
})
