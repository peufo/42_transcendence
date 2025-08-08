import EventEmitter from 'node:events'
import type { WebSocket } from 'ws'
import type { ServerEvents } from '../../../lib/socketChannels.js'
import type { SocketChannels } from '../../../lib/type.js'
import { getFriendshipsId } from '../friendships/model.js'

type EventMessage<Channel extends keyof SocketChannels> = {
	message: [Partial<SocketChannels[Channel]['serverEvents']>]
}

const emitterMaps: Partial<{
	[Channel in keyof SocketChannels]: Map<
		number,
		{
			emitter: EventEmitter<EventMessage<Channel>>
			sockets: Set<WebSocket>
		}
	>
}> = {}

export const notify: {
	[Channel in keyof SocketChannels]: ReturnType<typeof useNotifier<Channel>>
} = {
	friendships: useNotifier('friendships'),
	tournaments: useNotifier('tournaments'),
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
		onDestroy?: () => void
		onCreate?: () => void
	} = {},
) {
	const { emitter, sockets } = getEmitter(channel, emitterKey, options)

	const sender = (event: Partial<ServerEvents<Channel>>) => {
		socket.send(JSON.stringify(event))
	}
	emitter.on('message', sender)
	sockets.add(socket)
	socket.on('close', (_message) => {
		emitter.off('message', sender)
		sockets.delete(socket)
		if (!sockets.size) {
			deleteEmitter(channel, emitterKey)
			if (options.onDestroy) options.onDestroy()
		}
	})
}

function deleteEmitter<Channel extends keyof SocketChannels>(
	channel: Channel,
	emitterKey: number,
) {
	if (!emitterMaps[channel]) return
	emitterMaps[channel].delete(emitterKey)
}

function getEmitter<Channel extends keyof SocketChannels>(
	channel: Channel,
	emitterKey: number,
	{ onCreate }: { onCreate?: () => void } = {},
) {
	if (!emitterMaps[channel]) {
		emitterMaps[channel] = new Map()
	}
	const emitter = emitterMaps[channel].get(emitterKey)
	if (emitter) return emitter
	const newEmitter = {
		emitter: new EventEmitter<EventMessage<Channel>>(),
		sockets: new Set<WebSocket>(),
	}
	emitterMaps[channel].set(emitterKey, newEmitter)
	if (onCreate) onCreate()
	return newEmitter
}

function useNotifier<Channel extends keyof SocketChannels>(channel: Channel) {
	function notify<
		EventName extends keyof SocketChannels[Channel]['serverEvents'],
	>(
		emitterKey: number,
		eventName: EventName,
		data: SocketChannels[Channel]['serverEvents'][EventName],
	) {
		const { emitter } = getEmitter(channel, emitterKey)
		// @ts-ignore
		emitter.emit('message', { [eventName]: data })
	}
	return notify
}
