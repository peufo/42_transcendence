import type EventEmitter from 'node:events'
import type { WebSocket } from 'ws'

export type EventMap<T extends Record<string, unknown>> = {
	[K in keyof T]: [T[K]]
}

export function useSenderFactory<T extends Record<string, unknown>>(
	eventEmitter: EventEmitter<EventMap<T>>,
	socket: WebSocket,
) {
	function senderFactory<EventName extends keyof T>(eventName: EventName) {
		const sender = (data: T) => {
			socket.send(JSON.stringify({ [eventName]: data }))
		}
		// @ts-ignore
		eventEmitter.on(eventName, sender)
		// @ts-ignore
		return () => sessionEvent.off(eventName, sender)
	}

	return senderFactory
}
