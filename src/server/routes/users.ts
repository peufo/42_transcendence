import { and, getTableColumns, like, ne, notInArray } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod/v4'
import { db, users } from '../db/index.js'
import '@fastify/cookie'
import { getFriendships } from './friendships/model.js'

export const usersRoute: FastifyPluginCallbackZod = (
	server,
	_options,
	done,
) => {
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

			const friendsId = await getFriendships(user.id, 'friend').then((values) =>
				values.map(({ withUser }) => withUser.id),
			)

			const results = await db
				.select(columns)
				.from(users)
				.where(
					and(
						like(users.name, `%${search}%`),
						ne(users.id, user.id),
						notInArray(users.id, friendsId),
					),
				)
				.limit(5)

			return res.send({ data: results })
		},
	)

	done()
}
