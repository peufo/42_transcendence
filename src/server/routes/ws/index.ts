import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod/v4'
import { Engine } from '../../../lib/engine/index.js'
import type { FriendshipEvents } from '../../../lib/type.js'
import { getSessionFromRequest } from '../auth/hooks.js'
import { engineInputSchema } from './schema.js'
import { createUserEmitter } from './userEmitter.js'

const friendshipEvents: Record<keyof FriendshipEvents, true> = {
	onAccepted: true,
	onCreated: true,
	onDeleted: true,
}

export const wsRoute: FastifyPluginCallbackZod = (server, _options, done) => {
	server.get('/friendship', { websocket: true }, async (socket, req) => {
		const session = await getSessionFromRequest(req)
		if (!session) {
			socket.close(3000, 'Authentification required')
			return
		}
		const userEmitter = createUserEmitter(session.userId)
		function createEventSender<K extends keyof FriendshipEvents>(eventName: K) {
			const sender = (data: FriendshipEvents[K]) => {
				socket.send(JSON.stringify({ [eventName]: data }))
			}
			// @ts-ignore
			userEmitter.on(eventName, sender)
			// @ts-ignore
			return () => userEmitter.off(eventName, sender)
		}
		const sendersOff = Object.keys(friendshipEvents).map((eventName) => {
			return createEventSender(eventName as keyof FriendshipEvents)
		})
		socket.on('close', (_message) => {
			for (const senderOff of sendersOff) senderOff()
		})
	})

	server.get('/', { websocket: true }, (socket, _req) => {
		const engine = new Engine({
			onEvent: (event) => socket.send(JSON.stringify(event)),
		})
		engine.start() // event ?
		socket.on('message', (message) => {
			const json = JSON.parse(message.toString('utf-8'))
			const input = z.safeParse(engineInputSchema, json)
			if (input.error) {
				console.error(input.error)
				return
			}
			const { player, move, value } = input.data
			engine.setInput(player, move, value)
		})
		socket.on('close', (_message) => {
			engine.stop()
		})
	})

	done()
}
