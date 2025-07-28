import EventEmitter from 'node:events'
import type { WebSocket } from 'ws'
import type { SocketChannels } from '../../../lib/type.js'

type EventMap<T extends Record<string, unknown>> = {
	[K in keyof T]: [T[K]]
}
type ServerEvents<Channel extends keyof SocketChannels> =
	SocketChannels[Channel]['serverEvents']

const serverEvents: {
	[Channel in keyof SocketChannels]: Record<keyof ServerEvents<Channel>, true>
} = {
	friendships: {
		onAccepted: true,
		onCreated: true,
		onDeleted: true,
	},
	tournaments: {
		onNewParticipant: true,
	},
}

const channels = Object.keys(serverEvents) as (keyof SocketChannels)[]

const emitterMaps = channels.reduce(
	(acc, channel) => {
		acc[channel] = new Map()
		return acc
	},
	{} as {
		[Channel in keyof SocketChannels]: Map<
			number,
			EventEmitter<EventMap<SocketChannels[Channel]['serverEvents']>>
		>
	},
)

export const notify = channels.reduce(
	(acc, channel) => {
		acc[channel] = useNotifier(channel)
		return acc
	},
	{} as {
		[Channel in keyof SocketChannels]: ReturnType<
			typeof useNotifier<Channel, SocketChannels[Channel]['serverEvents']>
		>
	},
)

export function bindEmitterWithSocket<Chanel extends keyof SocketChannels>(
	channel: Chanel,
	emitter: EventEmitter<EventMap<ServerEvents<Chanel>>>,
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
	const newEmitter = new EventEmitter<
		EventMap<SocketChannels[Channel]['serverEvents']>
	>()
	emitterMaps[channel].set(emitterKey, newEmitter)
	return newEmitter
}

function useNotifier<
	Channel extends keyof SocketChannels,
	ServerEvents extends SocketChannels[Channel]['serverEvents'],
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
