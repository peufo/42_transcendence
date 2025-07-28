import EventEmitter from 'node:events'
import type { WebSocket } from 'ws'
import { type ServerEvents, serverEvents } from '../../../lib/socketChannels.js'
import type { SocketChannels } from '../../../lib/type.js'
import { objectKeys } from '../../../lib/utils.js'

type EventMap<Channel extends keyof SocketChannels> = {
	[eventName in keyof ServerEvents<Channel>]: [ServerEvents<Channel>[eventName]]
}

const emitterMaps = objectKeys(serverEvents).reduce(
	(acc, channel) => {
		acc[channel] = new Map()
		return acc
	},
	{} as {
		[Channel in keyof SocketChannels]: Map<
			number,
			EventEmitter<EventMap<Channel>>
		>
	},
)

export const notify = objectKeys(serverEvents).reduce(
	(acc, channel) => {
		acc[channel] = useNotifier(channel)
		return acc
	},
	{} as {
		[Channel in keyof SocketChannels]: ReturnType<typeof useNotifier<Channel>>
	},
)

export function bindEmitterWithSocket<Chanel extends keyof SocketChannels>(
	channel: Chanel,
	emitter: EventEmitter<EventMap<Chanel>>,
	socket: WebSocket,
) {
	function senderFactory<K extends keyof ServerEvents<Chanel>>(eventName: K) {
		const sender = (data: ServerEvents<Chanel>[K]) => {
			socket.send(JSON.stringify({ [eventName]: data }))
		}
		// @ts-ignore
		emitter.on(eventName, sender)
		// @ts-ignore
		return () => emitter.off(eventName, sender)
	}

	const sendersOff = Object.keys(serverEvents[channel]).map((eventName) => {
		return senderFactory(eventName as keyof ServerEvents<Chanel>)
	})
	socket.on('close', (_message) => {
		for (const senderOff of sendersOff) senderOff()
	})
}

export function deleteEmitter<Channel extends keyof SocketChannels>(
	channel: Channel,
	emitterKey: number,
) {
	emitterMaps[channel].delete(emitterKey)
}

export function getEmitter<Channel extends keyof SocketChannels>(
	channel: Channel,
	emitterKey: number,
) {
	const emitter = emitterMaps[channel].get(emitterKey)
	if (emitter) return emitter
	const newEmitter = new EventEmitter<EventMap<Channel>>()
	emitterMaps[channel].set(emitterKey, newEmitter)
	return newEmitter
}

function useNotifier<
	Channel extends keyof SocketChannels,
	ServerEvents = SocketChannels[Channel]['serverEvents'],
>(channel: Channel) {
	function notify<EventName extends keyof ServerEvents>(
		emitterKey: number,
		eventName: EventName,
		data: ServerEvents[EventName],
	) {
		const emitter = getEmitter(channel, emitterKey)
		// @ts-ignore
		emitter.emit(eventName, data)
	}
	return notify
}
