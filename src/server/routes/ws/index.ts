import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod/v4'
import { Engine } from '../../../lib/engine/index.js'
import { getSessionFromRequest } from '../auth/hooks.js'
import { bindEmitterWithSocket, getEmitter } from './controller.js'
import { engineInputSchema } from './schema.js'

export const wsRoute: FastifyPluginCallbackZod = (server, _options, done) => {
	server.get('/friendships', { websocket: true }, async (socket, req) => {
		const session = await getSessionFromRequest(req)
		if (!session) {
			socket.close(3000, 'Authentification required')
			return
		}
		const emitter = getEmitter('friendships', session.userId)
		bindEmitterWithSocket('friendships', emitter, socket)
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
