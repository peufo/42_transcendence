import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import '@fastify/cookie'
import { createTournament } from './model.js'
import { tournamentSchema } from './schema.js'

export const tournamentsRoute: FastifyPluginCallbackZod = (
	server,
	_options,
	done,
) => {
	server.post('/', { schema: { body: tournamentSchema } }, async (req, res) => {
		const user = res.locals?.user
		if (!user) return res.code(401).send()
		const tournament = await createTournament({
			...req.body,
			createdBy: user.id,
		})
		return res.send({ success: true, tournamentId: tournament.id })
	})

	done()
}
