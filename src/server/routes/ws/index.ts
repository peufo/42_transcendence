import { eq } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod/v4'
import type { Player } from '../../../lib/engine/index.js'
import { db, matches } from '../../db/index.js'
import { getSessionFromRequest } from '../auth/hooks.js'
import { findTournament } from '../tournaments/tournamentDb.js'
import { setUserIsActive } from '../users/model.js'
import { bindEmitterWithSocket, notify, notifyFriends } from './controller.js'
import { createMatchEngine } from './match.js'

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
			bindEmitterWithSocket('tournaments', tournament.id, socket, {
				onOpen(payload) {
					if (!payload) {
						const set = new Set<number>()
						set.add(session.userId)
						return { users: set }
					}
					payload.users.add(session.userId)
					return payload
				},
				onClose(payload) {
					payload?.users.delete(session.userId)
					return payload
				},
			})
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
				with: {
					player1: true,
					player2: true,
				},
			})

			if (!match) {
				socket.close(3000, 'Match not exist')
				return
			}
			if (match.state === 'finished') {
				socket.close(3000, 'Match is over')
				return
			}
			console.log(
				`SOCKET CONNECTION TO MATCH ${match.id}, user ${session.userId}`,
			)
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
							engine: undefined,
							player1Ready: player === 'p1',
							player2Ready: player === 'p2',
						}
					}
					if (payload.player1Ready && payload.player2Ready) {
						socket.close(3000, 'Only one session is authorized')
						return
					}
					if (player === 'p1') payload.player1Ready = true
					if (player === 'p2') payload.player2Ready = true
					if (payload.player1Ready && payload.player2Ready) {
						console.log(`engine creation ${matchId}`)
						payload.engine = createMatchEngine(match)
						db.update(matches)
							.set({ state: 'ongoing' })
							.where(eq(matches.id, matchId))
							.then(() => {
								match.state = 'ongoing'
								notify.matches(matchId, 'matchReady', {
									p1: match.player1?.name ?? 'Player 1',
									p2: match.player2?.name ?? 'Player 2',
								})
								payload.engine?.start()
							})
					}
					return payload
				},
				onClientEvent(payload, event) {
					if (event.onPlayerInput) {
						const { player, move, value } = event.onPlayerInput
						payload?.engine?.setInput(player, move, value)
					}
				},
				onClose(payload) {
					if (!payload) return undefined
					if (match.state === 'awaiting') {
						if (player === 'p1') payload.player1Ready = false
						if (player === 'p2') payload.player2Ready = false
						return payload
					}
				},
			})
		},
	)
	done()
}
