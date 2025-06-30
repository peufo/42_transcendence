import { ARENA_HEIGHT, PADDLE_BASE_SPEED, TICK_INTERVAL } from './index.js'
import type { Move } from './index.js'
import { Vector2 } from './Vector2.js'

export class Paddle {
	#position: Vector2
	#speed = PADDLE_BASE_SPEED
	#width: number
	#height: number

	get position() {
		return this.#position
	}

	get width() {
		return this.#width
	}

	get height() {
		return this.#height
	}

	constructor(position: Vector2, width: number, height: number) {
		this.#position = new Vector2(position.x, position.y)
		this.#width = width
		this.#height = height
	}

	toJSON() {
		return {
			position: this.#position,
			width: this.#width,
			height: this.#height,
		}
	}

	move(direction: Move) {
		const displ = TICK_INTERVAL * this.#speed
		if (direction === 'up') {
			if (this.#position.y - displ < 0) this.#position.y = 0
			else this.#position.y -= displ
		} else if (direction === 'down') {
			if (this.#position.y + this.#height + displ > ARENA_HEIGHT)
				this.#position.y = ARENA_HEIGHT - this.#height
			else this.#position.y += displ
		}
	}
}
