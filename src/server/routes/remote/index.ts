// import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
// import { postSchema } from '../../utils/schema.js'

// export const remoteRoute: FastifyPluginCallbackZod = (
// 	server,
// 	_options,
// 	done,
// ) => {
// 	server.post('/new', postSchema('/remote/new', null), async (req, res) => {
// 	const { userId } = permission.session(res)
// 	const tournament = await tournamentCreate({
// 		...req.body,
// 		createdBy: userId,
// 	})
// 	const user = await getUserBasic(userId)
// 	await notifyFriends(userId, 'onTournamentJoin', { tournament, userId })
// 	notify.tournaments(tournament.id, 'onParticipantJoin', { user })
// 	return res.send({ success: true, tournamentId: tournament.id })
// })

// 	server.post(
// 		'/join',
// 		postSchema('/tournaments/join', tournamentIdSchema),
// 		async (req, res) => {
// 			const { userId } = permission.session(res)
// 			const { tournamentId } = req.body
// 			const { tournament, isTournamentFull } = await tournamentJoin(
// 				tournamentId,
// 				userId,
// 			)
// 			const user = await getUserBasic(userId)
// 			await notifyFriends(userId, 'onTournamentJoin', { tournament, userId })
// 			notify.tournaments(tournamentId, 'onParticipantJoin', { user })

// 			if (isTournamentFull) {
// 				setTimeout(() => tournamentStart(tournament.id), 1000) // TODO: is this the best way ? Probably not
// 			}

// 			res.send({ success: true, tournamentId })
// 		},
// 	)

// 	server.post(
// 		'/quit',
// 		postSchema('/tournaments/quit', tournamentIdSchema),
// 		async (req, res) => {
// 			const { userId } = permission.session(res)
// 			const { tournamentId } = req.body
// 			await tournamentQuit(tournamentId, userId)
// 			const user = await getUserBasic(userId)
// 			await notifyFriends(userId, 'onTournamentQuit', { userId: userId })
// 			notify.tournaments(tournamentId, 'onParticipantQuit', { user })
// 			if (await isTournamentEmptyAndOpen(tournamentId))
// 				await tournamentDelete(tournamentId)
// 			return res.send({ success: true })
// 		},
// 	)

// 	done()
// }
