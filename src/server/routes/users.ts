import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod/v4'
import { db, friendShips, users } from '../db/index.js'
import { ne, and, like } from 'drizzle-orm'
import '@fastify/cookie'
import '../types.js'
import { fr } from 'zod/v4/locales'

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
			const otherUsers = db
				.select()
				.from(users)
				.where(and(like(users.name, `%${search}%`), ne(users.id, user.id)))
				.as('otherUsers')
			const foundUsers = await db
				.select()
				.from(friendShips)
				.leftJoin(
					otherUsers,
					and(
						ne(friendShips.user1Id, otherUsers.id),
						ne(friendShips.user2Id, otherUsers.id),
					),
				)
			return res.send({ data: foundUsers })
		},
	)

	done()
}

export default auth
