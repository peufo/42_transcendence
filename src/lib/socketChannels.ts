import type { SocketChannels } from './type.js'
import { objectKeys, stringToDate } from './utils.js'

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
	},
	tournaments: {
		onNewParticipant: true,
	},
}

export const clientEvents: {
	[Channel in keyof SocketChannels]: Record<keyof ClientEvents<Channel>, true>
} = {
	friendships: {},
	tournaments: {},
}

export function openChannel<Channel extends keyof SocketChannels>(
	channel: Channel,
	handlers: {
		[EventName in keyof ServerEvents<Channel>]: (
			data: ServerEvents<Channel>[EventName],
		) => void
	},
) {
	console.log('Open socket in channel', channel)
	const socket = new WebSocket(`ws://${document.location.host}/ws/${channel}`)
	function onMessage(messageEvent: MessageEvent) {
		const data: ServerEvents<Channel> = JSON.parse(messageEvent.data)
		stringToDate(data)
		for (const serverEvent of objectKeys(
			serverEvents[channel],
		) as (keyof ServerEvents<Channel>)[]) {
			if (data[serverEvent]) {
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
			console.log('TODO: send event', eventName, data)
		},
	}
}
