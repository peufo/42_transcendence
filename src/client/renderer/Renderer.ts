import type {
	Collision,
	EngineOptionsEvents,
	GameOverData,
	Player,
	RoundData,
	Scores,
	State,
} from '../../lib/engine/index.js'
import { useInterpolate } from '../../lib/interpolate.js'
import { $user } from '../utils/store.js'

export abstract class Renderer implements EngineOptionsEvents {
	protected element: HTMLElement
	protected user = $user.get(false)
	protected interpolate = useInterpolate()
	protected scores: Scores = {
		p1: 0,
		p2: 0,
	}
	protected playerNames = {
		p1: 'Player 1',
		p2: 'Player 2',
	}

	constructor(element: HTMLElement) {
		this.element = element
	}

	setPlayerNames(names: Record<Player, string | undefined>) {
		if (names.p1) this.playerNames.p1 = names.p1
		if (names.p2) this.playerNames.p2 = names.p2
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
}
