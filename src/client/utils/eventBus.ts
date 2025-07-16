type Handler = (payload: unknown) => void

export class EventBus {
	private listeners: { [eventName: string]: Handler[] } = {}

	subscribe(eventName: string, handler: Handler): () => void {
		if (!this.listeners[eventName]) {
			this.listeners[eventName] = []
		}
		this.listeners[eventName].push(handler)

		return () => {
			this.listeners[eventName] = this.listeners[eventName].filter(
				(h) => h !== handler,
			)
		}
	}

	publish(eventName: string, payload?: unknown): void {
		const handlers = this.listeners[eventName] || []
		handlers.forEach((h) => h(payload))
	}
}

export const eventBus = new EventBus()
