import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod/v4'
import { db, users } from '../db/index.js'
import { like } from 'drizzle-orm'
import '@fastify/cookie'
import '../types.js'

const auth: FastifyPluginCallbackZod = (server, options, done) => {
	server.get(
		'/',
		{
			schema: {
				querystring: z.object({
					search: z.string().default(''),
				}),
			},
		},
		async (req, res) => {
			const { search } = req.query
			const foundUsers = await db.query.users.findMany({
				where: like(users.name, `%${search}%`),
				limit: 5,
				columns: {
					passwordHash: false,
				},
			})
			return res.send({ data: foundUsers })
		},
	)

	done()
}

export default auth
