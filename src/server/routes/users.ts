import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod/v4'
import { db, friendships, users } from '../db/index.js'
import { ne, and, or, eq, like, notInArray, inArray } from 'drizzle-orm'
import { getTableColumns } from 'drizzle-orm'
import '@fastify/cookie'
import type { Friendship } from '../types.js'

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

	server.get('/friends', async (req, res) => {
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

	server.get('/invitations', async (req, res) => {
		const user = res.locals?.user
		if (!user) return res.code(401).send()
		const invitations = await getInvitations(user.id)
		// TODO: add gameId
		return res.send({ data: invitations })
	})
	done()
}

async function getInvitations(userId: number) {
	const res = await db.query.friendships.findMany({
		where: and(
			or(eq(friendships.user1Id, userId), eq(friendships.user2Id, userId)),
			eq(friendships.state, 'invited'),
		),
		with: {
			user1: {
				columns: {
					passwordHash: false,
					createdAt: false,
					lastLogin: false,
					isActive: false,
				},
			},
			user2: {
				columns: {
					passwordHash: false,
					createdAt: false,
					lastLogin: false,
					isActive: false,
				},
			},
		},
	})
	return res.map((r) => {
		if (r.user1Id === userId)
			return { createdBy: r.createdBy, createdAt: r.createdAt, ...r.user2 }
		return { createdBy: r.createdBy, createdAt: r.createdAt, ...r.user1 }
	})
}

async function getUserFriendships(userId: number, state?: Friendship['state']) {
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

async function getUserFriendsId(userId: number, state?: Friendship['state']) {
	const friendships = await getUserFriendships(userId, state)

	return friendships.map((friendship) =>
		friendship.user1Id === userId ? friendship.user2Id : friendship.user1Id,
	)
}

export default auth
