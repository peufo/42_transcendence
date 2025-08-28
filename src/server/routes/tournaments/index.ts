import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import '@fastify/cookie'
import { getSchema, permission, postSchema } from '../../utils/index.js'
import { getUserBasic } from '../friendships/model.js'
import { notify, notifyFriends } from '../ws/controller.js'
import {
	isTournamentEmptyAndOpen,
	tournamentCreate,
	tournamentDelete,
	tournamentGet,
	tournamentJoin,
	tournamentQuit,
	tournamentStart,
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
			const tournament = await tournamentGet(tournamentId)
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
			const { tournament, isTournamentFull } = await tournamentJoin(
				tournamentId,
				userId,
			)
			const user = await getUserBasic(userId)
			await notifyFriends(userId, 'onTournamentJoin', { tournament, userId })
			notify.tournaments(tournamentId, 'onParticipantJoin', { user })

			if (isTournamentFull) {
				setTimeout(() => tournamentStart(tournament.id), 1000) // TODO: is this the best way ? Probably not
			}

			res.send({ success: true, tournamentId })
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
			if (await isTournamentEmptyAndOpen(tournamentId))
				await tournamentDelete(tournamentId)
			return res.send({ success: true })
		},
	)

	done()
}
