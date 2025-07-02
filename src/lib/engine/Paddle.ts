import {
	ARENA_HEIGHT,
	PADDLE_BASE_HEIGHT,
	PADDLE_BASE_SPEED,
	TICK_INTERVAL,
} from './index.js'
import type { Move } from './index.js'
import { Vector2 } from './Vector2.js'
export class Paddle {
	#position: Vector2
	#speed = PADDLE_BASE_SPEED

	get position() {
		return this.#position
	}

	constructor(position: Vector2) {
		this.#position = new Vector2(position.x, position.y)
	}

	move(direction: Move) {
		const displ = TICK_INTERVAL * this.#speed
        if (direction === 'up') {
			if (this.#position.y - displ < 0) this.#position.y = 0
			else this.#position.y -= displ
		} else if (direction === 'down') {
			if (this.#position.y + PADDLE_BASE_HEIGHT + displ > ARENA_HEIGHT)
				this.#position.y = ARENA_HEIGHT - PADDLE_BASE_HEIGHT
			else this.#position.y += displ
		}
	}
}
