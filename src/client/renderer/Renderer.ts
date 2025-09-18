import {
	ARENA_HEIGHT,
	ARENA_WIDTH,
	type Collision,
	type EngineEventData,
	type EngineOptionsEvents,
	type GameOverData,
	type Player,
	type RoundData,
	type Scores,
	type State,
} from '../../lib/engine/index.js'
import { useInterpolate } from '../../lib/interpolate.js'
import { createEffect } from '../utils/signal.js'
import { $myRenderer, $user } from '../utils/store.js'

createEffect(() => {
	const myRenderer = $myRenderer.get()
	window.localStorage.setItem('rendering', myRenderer)
})

export abstract class Renderer implements Required<EngineOptionsEvents> {
	protected element: HTMLElement
	protected user = $user.get(false)
	protected interpolate = useInterpolate()
	protected scores: Scores = { p1: 0, p2: 0 }
	protected playerNames = { p1: 'Player 1', p2: 'Player 2' }
	protected canvas: HTMLCanvasElement

	constructor(element: HTMLElement, names: Record<Player, string>) {
		this.element = element
		this.playerNames = names
		this.canvas = document.createElement('canvas')
		this.canvas.width = ARENA_WIDTH
		this.canvas.height = ARENA_HEIGHT
		this.canvas.classList.add('border')
		this.element.appendChild(this.canvas)
	}

	onEngineEvent(data: EngineEventData) {
		for (const eventName of Object.keys(data) as (keyof EngineEventData)[]) {
			//@ts-ignore
			this[eventName](data[eventName])
		}
	}
	onTick(data: State) {
		this.interpolate.updateState(data)
	}
	onRoundEnd(data: RoundData) {
		this.scores = data.scores
	}
	onGameEnd(data: GameOverData) {
		this.scores = data.finalRound.scores
	}
	abstract onCollision(data: Collision): void
	abstract onTimerTick(data: number): void
	abstract onEngineStart(): void
	abstract clear(): void
}
