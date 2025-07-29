import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import '@fastify/cookie'
import { getSchema, permission, postSchema } from '../../utils/index.js'
import { notify } from '../ws/controller.js'
import {
	createTournament,
	deleteTournament,
	getTournament,
	joinTournament,
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
			const tournament = await getTournament(tournamentId)
			return res.send({ data: tournament })
		},
	)

	server.post(
		'/new',
		postSchema('/tournaments/new', tournamentSchemaCreate),
		async (req, res) => {
			const user = permission.user(res)
			const tournamentId = await createTournament({
				...req.body,
				createdBy: user.id,
			})
			return res.send({ success: true, tournamentId })
		},
	)

	server.post(
		'/delete',
		postSchema('/tournaments/delete', tournamentIdSchema),
		async (req, res) => {
			const user = permission.user(res)
			const { tournamentId } = req.body
			await deleteTournament(tournamentId, user.id)
			notify.tournaments(tournamentId, 'onDeleted', null)
			return res.send({ success: true, message: 'Tournament deleted' })
		},
	)

	server.post(
		'/join',
		postSchema('/tournaments/join', tournamentIdSchema),
		async (req, res) => {
			const user = permission.user(res)
			const { tournamentId } = req.body
			const participant = await joinTournament(tournamentId, user.id)
			notify.tournaments(tournamentId, 'onParticipantJoin', { participant })
			return res.send({ success: true, tournamentId })
		},
	)

	// TODO: /quit

	done()
}
