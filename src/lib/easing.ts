export function cubicIn(t: number) {
	return t * t * t
}

export function cubicOut(t: number) {
	const f = t - 1.0
	return f * f * f + 1.0
}
