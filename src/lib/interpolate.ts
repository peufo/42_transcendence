import {
	BALL_BASE_POSITION,
	PADDLE_BASE_P1_POSITION,
	PADDLE_BASE_P2_POSITION,
	type State,
	TICK_INTERVAL,
} from './engine/index.js'

const baseState = {
	b: {
		x: BALL_BASE_POSITION.x,
		y: BALL_BASE_POSITION.y,
	},
	p1: PADDLE_BASE_P1_POSITION.y,
	p2: PADDLE_BASE_P2_POSITION.y,
}

export function useInterpolate() {
	let previousState: State
	let currentState: State
	let lastUpdateTime: number

	return {
		updateState(newState: State) {
			if (currentState) previousState = JSON.parse(JSON.stringify(currentState))
			currentState = JSON.parse(JSON.stringify(newState))
			lastUpdateTime = Date.now()
		},
		getState(): State {
			if (!previousState || !currentState) return baseState
			const timeSinceLastUpdate = Date.now() - lastUpdateTime
			const t = Math.min(1, timeSinceLastUpdate / TICK_INTERVAL)
			return {
				b: {
					x: lerp(previousState.b.x, currentState.b.x, t),
					y: lerp(previousState.b.y, currentState.b.y, t),
				},
				p1: lerp(previousState.p1, currentState.p1, t),
				p2: lerp(previousState.p2, currentState.p2, t),
			}
		},
	}
}

function lerp(a: number, b: number, t: number) {
	return a + (b - a) * t
}
