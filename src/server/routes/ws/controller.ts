import EventEmitter from 'node:events'
import type { WebSocket } from 'ws'
import { type ServerEvents, serverEvents } from '../../../lib/socketChannels.js'
import type { SocketChannels } from '../../../lib/type.js'
import { objectKeys } from '../../../lib/utils.js'
import { getFriendshipsId } from '../friendships/model.js'

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
			{
				emitter: EventEmitter<EventMap<Channel>>
				sockets: Set<WebSocket>
			}
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

export function bindEmitterWithSocket<Chanel extends keyof SocketChannels>(
	channel: Chanel,
	emitterKey: number,
	socket: WebSocket,
	options: {
		onDestroy?: () => void
		onCreate?: () => void
	} = {},
) {
	const { emitter, sockets } = getEmitter(channel, emitterKey, options)

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

	sockets.add(socket)
	socket.on('close', (_message) => {
		for (const senderOff of sendersOff) senderOff()
		sockets.delete(socket)
		if (!sockets.size) {
			emitterMaps[channel].delete(emitterKey)
			if (options.onDestroy) options.onDestroy()
		}
	})
}

function getEmitter<Channel extends keyof SocketChannels>(
	channel: Channel,
	emitterKey: number,
	{ onCreate }: { onCreate?: () => void } = {},
) {
	const emitter = emitterMaps[channel].get(emitterKey)
	if (emitter) return emitter
	const newEmitter = {
		emitter: new EventEmitter<EventMap<Channel>>(),
		sockets: new Set<WebSocket>(),
	}
	emitterMaps[channel].set(emitterKey, newEmitter)
	if (onCreate) onCreate()
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
		const { emitter } = getEmitter(channel, emitterKey)
		// @ts-ignore
		emitter.emit(eventName, data)
	}
	return notify
}
