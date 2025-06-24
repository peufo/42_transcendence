import { can, ctx, Move, inputs, basePaddleSpeed } from './index.js'
import { Vector2 } from './Vector2.js'

export class Paddle {
	position: Vector2
	speed = basePaddleSpeed
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

	update(delta: number, inputs: Record<Move, boolean>) {
		if (inputs.up) this.move(delta, 'up');
		if (inputs.down) this.move(delta, 'down');
	}

	move(delta: number, direction: Move) {
		const displ = delta * this.speed;
		if (direction === 'up') {
			if (this.position.y - displ < 0)
				this.position.y = 0;
			else
				this.position.y -= displ;
		}
		else if (direction === 'down') {
			if (this.position.y + this.#height + displ > can.height)
				this.position.y = can.height - this.#height;
			else
				this.position.y += displ;
		}
	}

	draw() {
		ctx?.beginPath()
		ctx?.rect(this.position.x, this.position.y, this.#width, this.#height)
		ctx?.fill()
	}
}
