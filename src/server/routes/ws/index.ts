import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod/v4'
import { Engine } from '../../../lib/engine/index.js'
import type { SessionEvent } from '../../../lib/type.js'
import { getSessionFromRequest } from '../auth/hooks.js'
import { engineInputSchema } from './schema.js'
import { createSessionEvent } from './sessionEvent.js'

const sessionsEventKeys: (keyof SessionEvent)[] = [
	'onFriendshipCreated',
	'onFriendshipAccepted',
	'onFriendshipDeleted',
]

export const wsRoute: FastifyPluginCallbackZod = (server, _options, done) => {
	server.get('/session', { websocket: true }, async (socket, req) => {
		const session = await getSessionFromRequest(req)
		if (!session) {
			socket.close(3000, 'Authentification required')
			return
		}
		const sessionEvent = createSessionEvent(session.id)
		function createEventSender<K extends keyof SessionEvent>(eventName: K) {
			const sender = (data: SessionEvent[K]) => {
				socket.send(JSON.stringify({ [eventName]: data }))
			}
			// @ts-ignore
			sessionEvent.on(eventName, sender)
			// @ts-ignore
			return () => sessionEvent.off(eventName, sender)
		}
		const sendersOff = sessionsEventKeys.map(createEventSender)
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
