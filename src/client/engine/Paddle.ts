import { ctx } from './index.js' // only for draw
import { Vector2 } from './Vector2.js'

export class Paddle {
	position: Vector2
	speed = 0.4 // const speed
	#width: number
	#height: number
	// acceleration ?

	get width() {
		return this.#width
	}

	get height() {
		return this.#height
	}

	constructor(position: Vector2, width: number, height: number) {
		this.position = new Vector2(position.x, position.y)
		this.#width = width
		this.#height = height
	}

	draw() {
		ctx?.beginPath()
		ctx?.rect(this.position.x, this.position.y, this.#width, this.#height)
		ctx?.fill()
	}
}
