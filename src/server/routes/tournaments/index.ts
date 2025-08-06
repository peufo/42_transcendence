import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import '@fastify/cookie'
import { getSchema, permission, postSchema } from '../../utils/index.js'
import { notify, notifyFriends } from '../ws/controller.js'
import {
	isTournamentEmpty,
	tournamentCreate,
	tournamentDelete,
	tournamentGet,
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
			await notifyFriends(userId, 'onTournamentCreated', { tournament })
			return res.send({ success: true, tournamentId: tournament.id })
		},
	)

	// server.post(
	// 	'/delete',
	// 	postSchema('/tournaments/delete', tournamentIdSchema),
	// 	async (req, res) => {
	// 		const { userId } = permission.session(res)
	// 		const { tournamentId } = req.body
	// 		const tournament = await tournamentDelete(tournamentId, userId)
	// 		await notifyFriends(userId, 'onTournamentDeleted', { tournament })
	// 		return res.send({ success: true, message: 'Tournament deleted' })
	// 	},
	// )

	server.post(
		'/join',
		postSchema('/tournaments/join', tournamentIdSchema),
		async (req, res) => {
			const { userId } = permission.session(res)
			const { tournamentId } = req.body
			const user = await tournamentJoin(tournamentId, userId)
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
			const user = await tournamentQuit(tournamentId, userId)
			notify.tournaments(tournamentId, 'onParticipantQuit', { user })
			if (await isTournamentEmpty(tournamentId))
				await tournamentDelete(tournamentId)
			return res.send({ success: true })
		},
	)

	done()
}
