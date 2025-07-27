import type EventEmitter from 'node:events'
import type { WebSocket } from 'ws'
import type { RoutesSocket } from '../../../lib/type.ts'

export type EventMap<T extends Record<string, unknown>> = {
	[K in keyof T]: [T[K]]
}

type Events<Route extends keyof RoutesSocket> = RoutesSocket[Route]['events']

const routesEvents: {
	[Route in keyof RoutesSocket]: Record<keyof Events<Route>, true>
} = {
	'/friendships': {
		onAccepted: true,
		onCreated: true,
		onDeleted: true,
	},
	'/tournaments': {
		onNewParticipant: true,
	},
}

export function bindEmitterWithSocket<Route extends keyof RoutesSocket>(
	route: Route,
	emitter: EventEmitter<EventMap<Events<Route>>>,
	socket: WebSocket,
) {
	function senderFactory<K extends keyof Events<Route>>(eventName: K) {
		const sender = (data: Events<Route>[K]) => {
			socket.send(JSON.stringify({ [eventName]: data }))
		}
		// @ts-ignore
		emitter.on(eventName, sender)
		// @ts-ignore
		return () => emitter.off(eventName, sender)
	}

	const sendersOff = Object.keys(routesEvents[route]).map((eventName) => {
		return senderFactory(eventName as keyof Events<Route>)
	})
	socket.on('close', (_message) => {
		for (const senderOff of sendersOff) senderOff()
	})
}
