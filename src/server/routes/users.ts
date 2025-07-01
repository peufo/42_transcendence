import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod/v4'
import { db, friendShips, users } from '../db/index.js'
import { like, and, ne } from 'drizzle-orm'
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
			const user = res.locals?.user
			if (!user) return res.code(401).send()

			const { search } = req.query
			const foundUsers = await db.query.users.findMany({
				where: and(
					like(users.name, `%${search}%`),
					// TODO: don't return users that are already friend
					// ne(friendShips.user1Id, user.id),
					// ne(friendShips.user2Id, user.id),
				),
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
