import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod/v4'
import { db, friendships, users } from '../db/index.js'
import { ne, and, or, eq, like } from 'drizzle-orm'
import { getTableColumns } from 'drizzle-orm'
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
			const { passwordHash, isActive, lastLogin, createdAt, ...columns } =
				getTableColumns(users)

			const results = await db
				.select(columns)
				.from(users)
				.rightJoin(
					friendships,
					or(
						eq(friendships.user1Id, users.id),
						eq(friendships.user2Id, users.id),
					),
				)
				.where(
					and(
						like(users.name, `%${search}%`),
						ne(users.id, user.id),
						or(
							ne(friendships.user1Id, users.id),
							ne(friendships.user2Id, users.id),
						),
					),
				)
				.groupBy(users.id)

			return res.send({ data: results })
		},
	)

	done()
}

export default auth
