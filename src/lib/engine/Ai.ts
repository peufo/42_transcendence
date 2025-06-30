import type { Engine, Player, State } from './index.js'

// function randomIntFromInterval(min: number, max: number) {
// 	// min and max included
// 	return Math.floor(Math.random() * (max - min + 1) + min)
// }

export class Bot {
	#player: Player
	#engine: Engine

	constructor(player: Player, engine: Engine) {
		this.#player = player
		this.#engine = engine
	}

	update({ ball, paddles }: State) {
		const paddle = paddles[this.#player]
		if (ball.position.y + ball.size < paddle.position.y) {
			this.#engine.setInput(this.#player, 'down', false)
			this.#engine.setInput(this.#player, 'up', true)
		} else if (ball.position.y > paddle.position.y + paddle.height) {
			this.#engine.setInput(this.#player, 'up', false)
			this.#engine.setInput(this.#player, 'down', true)
		} else if (
			ball.position.y > paddle.position.y + paddle.height * 0.4 &&
			ball.position.y + ball.size < paddle.position.y + paddle.height * 0.6
		) {
			this.#engine.setInput(this.#player, 'up', false)
			this.#engine.setInput(this.#player, 'down', false)
		}
	}
}
