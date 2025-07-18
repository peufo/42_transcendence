import {
	and,
	eq,
	getTableColumns,
	inArray,
	like,
	ne,
	notInArray,
	or,
} from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod/v4'
import { db, friendships, users } from '../db/index.js'
import '@fastify/cookie'
import type { DB } from '../types.js'

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

			const friendsId = await getUserFriendsId(user.id)

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

	server.get('/friends', async (_req, res) => {
		const user = res.locals?.user
		if (!user) return res.code(401).send()

		const { passwordHash, createdAt, ...columns } = getTableColumns(users)

		const friendsId = await getUserFriendsId(user.id, 'friend')
		const friends = await db
			.select(columns)
			.from(users)
			.where(inArray(users.id, friendsId))
		// TODO: add gameId
		return res.send({ data: friends })
	})

	done()
}

async function getUserFriendships(
	userId: number,
	state?: DB.Friendship['state'],
) {
	return await db
		.select()
		.from(friendships)
		.where(
			and(
				or(eq(friendships.user1Id, userId), eq(friendships.user2Id, userId)),
				state ? eq(friendships.state, state) : undefined,
			),
		)
}

async function getUserFriendsId(
	userId: number,
	state?: DB.Friendship['state'],
) {
	const friendships = await getUserFriendships(userId, state)

	return friendships.map((friendship) =>
		friendship.user1Id === userId ? friendship.user2Id : friendship.user1Id,
	)
}
