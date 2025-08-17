import { eq } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod/v4'
import type { Player } from '../../../lib/engine/index.js'

import { db, matches } from '../../db/index.js'

import { getSessionFromRequest } from '../auth/hooks.js'
import { findTournament } from '../tournaments/tournamentDb.js'
import { setUserIsActive } from '../users/model.js'
import {
	bindEmitterWithSocket,
	deleteEmitter,
	notify,
	notifyFriends,
} from './controller.js'
import { createMatchEngine, updateMatchSurrender } from './match.js'

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
			const tournament = await findTournament(tournamentId)
			if (!tournament) {
				socket.close(3000, 'Tournament not exist')
				return
			}
			bindEmitterWithSocket('tournaments', tournament.id, socket)
		},
	)

	server.get(
		'/matches',
		{
			websocket: true,
			schema: { querystring: z.object({ matchId: z.coerce.number() }) },
		},
		async (socket, req) => {
			const session = await getSessionFromRequest(req)
			if (!session) {
				socket.close(3000, 'Authentification required')
				return
			}
			const { matchId } = req.query
			const match = await db.query.matches.findFirst({
				where: eq(matches.id, matchId),
			})
			if (!match) {
				socket.close(3000, 'Match not exist')
				return
			}

			let player: Player | null = null
			if (session.userId === match.player1Id) player = 'p1'
			else if (session.userId === match.player2Id) player = 'p2'

			if (!player) {
				socket.close(3000, 'Only players can open this channel')
				return
			}

			bindEmitterWithSocket('matches', matchId, socket, {
				onOpen(payload) {
					if (!payload) {
						return {
							player1Ready: player === 'p1',
							player2Ready: player === 'p2',
							engine: createMatchEngine(match),
						}
					}
					if (payload.player1Ready && payload.player2Ready) {
						socket.close(3000, 'Only one session is authorized')
						return
					}
					if (player === 'p1') payload.player1Ready = true
					if (player === 'p2') payload.player2Ready = true
					if (payload.player1Ready && payload.player2Ready) {
						payload.engine.start()
					}
					return payload
				},
				onClose(payload) {
					if (!payload) return undefined
					// get match
					if (match.state === 'awaiting') {
						if (player === 'p1') payload.player1Ready = false
						if (player === 'p2') payload.player2Ready = false
						return payload
					}
					if (match.state === 'ongoing') {
						payload.engine.stop()
						updateMatchSurrender(match.id, player).then((updatedMatch) => {
							notify.matches(matchId, 'onSurrender', updatedMatch)
							deleteEmitter('matches', match.id)
						})
					}
				},
			})
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
