import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import '@fastify/cookie'
import { getSchema, permission, postSchema } from '../../utils/index.js'
import { getUserBasic } from '../friendships/model.js'
import { notify, notifyFriends } from '../ws/controller.js'
import {
	isTournamentEmpty,
	tournamentCreate,
	tournamentDelete,
	tournamentGetWithParticipants,
	tournamentJoin,
	tournamentQuit,
} from './model.js'
import { tournamentIdSchema, tournamentSchemaCreate } from './schema.js'

export const tournamentsRoute: FastifyPluginCallbackZod = (
	server,
	_options,
	done,
) => {
	server.get(
		'/',
		getSchema('/tournaments', tournamentIdSchema),
		async (req, res) => {
			permission.user(res)
			const { tournamentId } = req.query
			const tournament = await tournamentGetWithParticipants(tournamentId)
			return res.send({ data: tournament })
		},
	)

	server.post(
		'/new',
		postSchema('/tournaments/new', tournamentSchemaCreate),
		async (req, res) => {
			const { userId } = permission.session(res)
			const tournament = await tournamentCreate({
				...req.body,
				createdBy: userId,
			})
			const user = await getUserBasic(userId)
			await notifyFriends(userId, 'onTournamentJoin', { tournament, userId })
			notify.tournaments(tournament.id, 'onParticipantJoin', { user })
			return res.send({ success: true, tournamentId: tournament.id })
		},
	)

	server.post(
		'/join',
		postSchema('/tournaments/join', tournamentIdSchema),
		async (req, res) => {
			const { userId } = permission.session(res)
			const { tournamentId } = req.body
			const tournament = await tournamentJoin(tournamentId, userId)
			const user = await getUserBasic(userId)
			await notifyFriends(userId, 'onTournamentJoin', { tournament, userId })
			notify.tournaments(tournamentId, 'onParticipantJoin', { user })
			return res.send({ success: true, tournamentId })
		},
	)

	server.post(
		'/quit',
		postSchema('/tournaments/quit', tournamentIdSchema),
		async (req, res) => {
			const { userId } = permission.session(res)
			const { tournamentId } = req.body
			await tournamentQuit(tournamentId, userId)
			const user = await getUserBasic(userId)
			await notifyFriends(userId, 'onTournamentQuit', { userId: userId })
			notify.tournaments(tournamentId, 'onParticipantQuit', { user })
			if (await isTournamentEmpty(tournamentId))
				await tournamentDelete(tournamentId)
			return res.send({ success: true })
		},
	)

	done()
}
