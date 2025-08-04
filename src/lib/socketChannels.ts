import type { SocketChannels } from './type.js'
import { deserialize, objectKeys } from './utils.js'

export type ServerEvents<Channel extends keyof SocketChannels> =
	SocketChannels[Channel]['serverEvents']
export type ClientEvents<Channel extends keyof SocketChannels> =
	SocketChannels[Channel]['clientEvents']

export const serverEvents: {
	[Channel in keyof SocketChannels]: Record<keyof ServerEvents<Channel>, true>
} = {
	friendships: {
		onAccepted: true,
		onCreated: true,
		onDeleted: true,
		onTournamentCreated: true,
		onTournamentDeleted: true,
		onFriendOnline: true,
		onFriendOffline: true,
	},
	tournaments: {
		onDeleted: true,
		onParticipantJoin: true,
		onParticipantQuit: true,
	},
}

export const clientEvents: {
	[Channel in keyof SocketChannels]: Record<keyof ClientEvents<Channel>, true>
} = {
	friendships: {},
	tournaments: {},
}

export type ChannelSocket<Channel extends keyof SocketChannels> = ReturnType<
	typeof openChannel<Channel>
>

export function openChannel<Channel extends keyof SocketChannels>(
	channel: Channel,
	query: SocketChannels[Channel]['query'],
	handlers: {
		[EventName in keyof ServerEvents<Channel>]: (
			data: ServerEvents<Channel>[EventName],
		) => void
	},
) {
	console.log('Open socket in channel', channel)
	const searchParams = new URLSearchParams(Object.entries(query || {}))
	const socket = new WebSocket(
		`ws://${document.location.host}/ws/${channel}?${searchParams.toString()}`,
	)
	function onMessage(messageEvent: MessageEvent) {
		const data: ServerEvents<Channel> = JSON.parse(messageEvent.data)
		deserialize(data)
		for (const serverEvent of objectKeys(
			serverEvents[channel],
		) as (keyof ServerEvents<Channel>)[]) {
			if (serverEvent in data) {
				handlers[serverEvent](data[serverEvent])
			}
		}
	}

	socket.addEventListener('message', onMessage)

	return {
		close() {
			socket.removeEventListener('message', onMessage)
			socket.close()
		},
		emit<EventName extends keyof ClientEvents<Channel>>(
			eventName: EventName,
			data: ClientEvents<Channel>[EventName],
		) {
			console.log('TODO: send event from client', eventName, data)
		},
	}
}
