export class HttpError extends Error {
	constructor(
		public message: string,
		public statusCode: number,
	) {
		super(message)
		this.name = 'HttpError'
	}
}
