import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod/v4'
import { engineInputSchema } from '../schemas/engine.js'

export const authRoute: FastifyPluginCallbackZod = (server, _options, done) => {
	server.get('/session', { websocket: true }, (socket, _req) => {
		socket.on('message', (message) => {
			const json = JSON.parse(message.toString('utf-8'))
			const input = z.safeParse(engineInputSchema, json)
			if (input.error) {
				// TODO: how to handle error ?
				return
			}
			const { player, move, value } = input.data
			console.log('Do somthing with ', player, move, value)
		})
		socket.on('close', (_message) => {})
	})

	done()
}
