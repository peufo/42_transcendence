import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import '@fastify/cookie'
import z from 'zod/v4'
import { getSchema, permission, postSchema } from '../../utils/index.js'
import { createTournament, getTournament } from './model.js'
import { tournamentSchema } from './schema.js'

export const tournamentsRoute: FastifyPluginCallbackZod = (
	server,
	_options,
	done,
) => {
	server.get(
		'/',
		getSchema('/tournaments', { id: z.coerce.number() }),
		async (req, res) => {
			permission.user(res)
			const { id } = req.query
			const tournament = await getTournament(id)
			return res.send({ data: tournament })
		},
	)

	server.post(
		'/new',
		postSchema('/tournaments/new', tournamentSchema),
		async (req, res) => {
			const user = permission.user(res)
			const tournament = await createTournament({
				...req.body,
				createdBy: user.id,
			})
			return res.send({ success: true, tournamentId: tournament.id })
		},
	)

	done()
}
