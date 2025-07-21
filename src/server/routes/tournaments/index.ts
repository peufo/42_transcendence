import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import '@fastify/cookie'
import z from 'zod/v4'
import { schemaBody, schemaQuery } from '../../utils.js'
import { createTournament, getTournament } from './model.js'
import { tournamentSchema } from './schema.js'

export const tournamentsRoute: FastifyPluginCallbackZod = (
	server,
	_options,
	done,
) => {
	server.post('/new', schemaBody(tournamentSchema), async (req, res) => {
		const user = res.locals?.user
		if (!user) return res.code(401).send()
		const tournament = await createTournament({
			...req.body,
			createdBy: user.id,
		})

		return res.send({ success: true, tournamentId: tournament.id })
	})

	server.get('/', schemaQuery({ id: z.coerce.number() }), async (req, res) => {
		const { id } = req.query
		const tournament = await getTournament(id)
		return res.send({ data: tournament })
	})

	done()
}
