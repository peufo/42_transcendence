export class Vector2 {
	public x: number
	public y: number

	constructor(x: number, y: number) {
		this.x = x
		this.y = y
	}

	toJSON() {
		return {
			x: this.x,
			y: this.y,
		}
	}

	magnitude() {
		return Math.sqrt(this.x * this.x + this.y * this.y)
	}

	normalize() {
		const mag = this.magnitude()
		this.x /= mag
		this.y /= mag
		return this
	}
}
