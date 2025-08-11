import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod/v4'
import { getSessionFromRequest } from '../auth/hooks.js'
import { tournamentGet } from '../tournaments/model.js'
import { setUserIsActive } from '../users/model.js'
import { bindEmitterWithSocket, notifyFriends } from './controller.js'

export const wsRoute: FastifyPluginCallbackZod = (server, _options, done) => {
	server.get('/friendships', { websocket: true }, async (socket, req) => {
		const session = await getSessionFromRequest(req)
		if (!session) {
			socket.close(3000, 'Authentification required')
			return
		}
		const { userId } = session
		bindEmitterWithSocket('friendships', userId, socket, {
			onCreate: async () => {
				await setUserIsActive(userId, true)
				await notifyFriends(userId, 'onFriendOnline', { userId })
			},
			onDestroy: async () => {
				await setUserIsActive(userId, false)
				await notifyFriends(userId, 'onFriendOffline', { userId })
			},
		})
	})

	server.get(
		'/tournaments',
		{
			websocket: true,
			schema: { querystring: z.object({ tournamentId: z.coerce.number() }) },
		},
		async (socket, req) => {
			const session = await getSessionFromRequest(req)
			// TODO: What is the behaviour of an http error here
			if (!session) {
				socket.close(3000, 'Authentification required')
				return
			}
			const { tournamentId } = req.query
			const tournament = await tournamentGet(tournamentId).catch((err) => {
				socket.close(3000, 'Tournament not exist')
				throw err
			})
			bindEmitterWithSocket('tournaments', tournament.id, socket)
		},
	)

	// server.get('/', { websocket: true }, (socket, _req) => {
	// 	const engine = new Engine({
	// 		onEvent: (event) => socket.send(JSON.stringify(event)),
	// 	})
	// 	engine.start() // event ?
	// 	socket.on('message', (message) => {
	// 		const json = JSON.parse(message.toString('utf-8'))
	// 		const input = z.safeParse(engineInputSchema, json)
	// 		if (input.error) {
	// 			console.error(input.error)
	// 			return
	// 		}
	// 		const { player, move, value } = input.data
	// 		engine.setInput(player, move, value)
	// 	})
	// 	socket.on('close', (_message) => {
	// 		engine.stop()
	// 	})
	// })

	done()
}
