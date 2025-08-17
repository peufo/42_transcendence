import EventEmitter from 'node:events'
import type { WebSocket } from 'ws'
import type { ServerEvents } from '../../../lib/socketChannels.js'
import type { SocketChannels } from '../../../lib/type.js'
import { getFriendshipsId } from '../friendships/model.js'

type EventMessage<Channel extends keyof SocketChannels> = {
	message: [Partial<SocketChannels[Channel]['serverEvents']>]
}

type ServerPayload<Channel extends keyof SocketChannels> =
	'serverPayload' extends keyof SocketChannels[Channel]
		? SocketChannels[Channel]['serverPayload'] | undefined
		: undefined

type EmitterObject<Channel extends keyof SocketChannels> = {
	events: EventEmitter<EventMessage<Channel>>
	sockets: Set<WebSocket>
	payload?: ServerPayload<Channel>
}

const emitterMaps: Partial<{
	[Channel in keyof SocketChannels]: Map<number, EmitterObject<Channel>>
}> = {}

export const notify: {
	[Channel in keyof SocketChannels]: ReturnType<typeof useNotifier<Channel>>
} = {
	friendships: useNotifier('friendships'),
	tournaments: useNotifier('tournaments'),
	matches: useNotifier('matches'),
}

type ServerEventsFriendship = SocketChannels['friendships']['serverEvents']

export async function notifyFriends<
	EventName extends keyof ServerEventsFriendship,
>(
	userId: number,
	eventName: EventName,
	data: ServerEventsFriendship[EventName],
) {
	const friendsId = await getFriendshipsId(userId)
	for (const userId of friendsId) {
		notify.friendships(userId, eventName, data)
	}
}

export function bindEmitterWithSocket<Channel extends keyof SocketChannels>(
	channel: Channel,
	emitterKey: number,
	socket: WebSocket,
	options: {
		onCreate?: () => void
		onOpen?: (payload: ServerPayload<Channel>) => ServerPayload<Channel>
		onClientEvent?: (
			payload: ServerPayload<Channel>,
			data: SocketChannels[Channel]['clientEvents'],
		) => void
		onClose?: (payload: ServerPayload<Channel>) => ServerPayload<Channel>
		onDestroy?: (payload: ServerPayload<Channel>) => void
	} = {},
) {
	const emitter = getEmitter(channel, emitterKey, options)
	if (options.onOpen) emitter.payload = options.onOpen(emitter.payload)
	const sender = (event: Partial<ServerEvents<Channel>>) => {
		socket.send(JSON.stringify(event))
	}
	emitter.events.on('message', sender)
	emitter.sockets.add(socket)
	if (options.onClientEvent) {
		socket.on('message', (rawData) => {
			const data = JSON.parse(
				rawData.toString('utf-8'),
			) as SocketChannels[Channel]['clientEvents']
			options.onClientEvent?.(emitter.payload, data)
		})
	}
	socket.on('close', (_message) => {
		if (options.onClose) emitter.payload = options.onClose(emitter.payload)
		emitter.events.off('message', sender)
		emitter.sockets.delete(socket)
		if (!emitter.sockets.size) {
			deleteEmitter(channel, emitterKey)
			if (options.onDestroy) options.onDestroy(emitter.payload)
		}
	})
}

export function deleteEmitter<Channel extends keyof SocketChannels>(
	channel: Channel,
	emitterKey: number,
) {
	const emitter = emitterMaps[channel]?.get(emitterKey)
	if (!emitter) return
	for (const socket of emitter.sockets) {
		socket.close()
	}
	emitterMaps[channel]?.delete(emitterKey)
}

function getEmitter<Channel extends keyof SocketChannels>(
	channel: Channel,
	emitterKey: number,
	{ onCreate }: { onCreate?: () => void } = {},
): EmitterObject<Channel> {
	if (!emitterMaps[channel]) {
		emitterMaps[channel] = new Map()
	}
	const emitter = emitterMaps[channel].get(emitterKey)
	if (emitter) return emitter
	const newEmitter = {
		events: new EventEmitter<EventMessage<Channel>>(),
		sockets: new Set<WebSocket>(),
	}
	onCreate?.()
	emitterMaps[channel].set(emitterKey, newEmitter)
	return newEmitter
}

function useNotifier<Channel extends keyof SocketChannels>(channel: Channel) {
	function notify<
		EventName extends keyof SocketChannels[Channel]['serverEvents'],
	>(
		emitterKey: number,
		eventName: EventName,
		data: Required<SocketChannels[Channel]['serverEvents']>[EventName],
	) {
		const { events: emitter } = getEmitter(channel, emitterKey)
		// @ts-ignore
		emitter.emit('message', { [eventName]: data })
	}
	return notify
}
