import type { SocketChannels } from './type.js'
import { deserialize, objectKeys } from './utils.js'

export type ServerEvents<Channel extends keyof SocketChannels> =
	SocketChannels[Channel]['serverEvents']
export type ClientEvents<Channel extends keyof SocketChannels> =
	SocketChannels[Channel]['clientEvents']

type RawData = string | Buffer | ArrayBuffer | Buffer[]

export type ChannelSocket<Channel extends keyof SocketChannels> = {
	close(): void
	emit<EventName extends keyof ClientEvents<Channel>>(
		eventName: EventName,
		data: ClientEvents<Channel>[EventName],
	): void
}

export function useSocketChannel(
	origin: string,
	createWebSocket = (url: string) => new WebSocket(url),
) {
	return function socketChannel<Channel extends keyof SocketChannels>(
		channel: Channel,
		query: SocketChannels[Channel]['query'],
		handlers: {
			[EventName in keyof ServerEvents<Channel>]: (
				data: ServerEvents<Channel>[EventName],
			) => void
		},
	): ChannelSocket<Channel> {
		const searchParams = new URLSearchParams(Object.entries(query || {}))
		const [protocol, host] = origin.split('//')
		const wsProtocol = protocol.startsWith('https') ? 'wss' : 'ws'
		const url = `${wsProtocol}://${host}/ws/${channel}?${searchParams.toString()}`
		function onMessage(event: { data: RawData }) {
			const data: ServerEvents<Channel> = JSON.parse(event.data.toString())
			deserialize(data)
			for (const eventName of objectKeys(handlers)) {
				if (data[eventName]) handlers[eventName](data[eventName])
			}
		}
		const socket = createWebSocket(url)
		socket.addEventListener('message', onMessage)
		return {
			close() {
				socket.removeEventListener('message', onMessage)
				socket.close()
			},
			emit(eventName, data) {
				if (socket.readyState === socket.OPEN) {
					socket.send(JSON.stringify({ [eventName]: data }))
				}
			},
		}
	}
}
