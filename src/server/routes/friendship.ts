import { and, eq, not, or } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod/v4'
import { db, friendships } from '../db/index.js'
import '@fastify/cookie'
import '../types.js'
import { notifyUser } from '../events/session.js'
import {
	getFriendships,
	getUserBasic,
	getUserFriend,
} from '../models/friendships.js'

function schemaBody<Shape extends z.ZodRawShape>(shape: Shape) {
	return {
		schema: {
			body: z.object(shape),
		},
	}
}

export const friendshipsRoute: FastifyPluginCallbackZod = (
	server,
	_options,
	done,
) => {
	server.get('/', async (_req, res) => {
		const user = res.locals?.user
		if (!user) return res.code(401).send()
		const friendships = await getFriendships(user.id)
		// TODO: add gameId
		return res.send({ data: friendships })
	})

	server.post(
		'/new',
		schemaBody({ invitedUserId: z.coerce.number() }),
		async (req, res) => {
			const user = res.locals?.user
			if (!user) return res.code(401).send()
			const { invitedUserId } = req.body
			const [user1Id, user2Id] =
				user.id < invitedUserId
					? [user.id, invitedUserId]
					: [invitedUserId, user.id]
			const [friendship] = await db
				.insert(friendships)
				.values({
					user1Id,
					user2Id,
					state: 'invited',
					createdBy: user.id,
				})
				.returning()
			if (!friendship) return res.code(400).send()

			const withUser = await getUserBasic(user.id)
			if (!withUser) return res.code(400).send()
			await notifyUser(invitedUserId, 'onFriendshipCreated', {
				friendship: { ...friendship, state: 'invited', withUser },
			})

			return res.send({ success: true })
		},
	)

	server.post(
		'/accept',
		schemaBody({ friendshipId: z.coerce.number() }),
		async (req, res) => {
			const user = res.locals?.user
			if (!user) return res.code(401).send()
			const { friendshipId } = req.body
			const [friendship] = await db
				.update(friendships)
				.set({ state: 'friend' })
				.where(
					and(
						eq(friendships.id, friendshipId),
						eq(friendships.state, 'invited'),
						not(eq(friendships.createdBy, user.id)),
						or(
							eq(friendships.user1Id, user.id),
							eq(friendships.user2Id, user.id),
						),
					),
				)
				.returning()

			if (!friendship) return res.code(400).send()
			const userId =
				friendship.createdBy === friendship.user1Id
					? friendship.user2Id
					: friendship.user1Id
			const withUser = await getUserFriend(userId)
			if (!withUser) return res.code(400).send()
			await notifyUser(friendship.createdBy, 'onFriendshipAccepted', {
				friendship: { ...friendship, state: 'friend', withUser },
			})
			return res.send({ success: true })
		},
	)

	server.post(
		'/delete',
		schemaBody({ friendshipId: z.coerce.number() }),
		async (req, res) => {
			const user = res.locals?.user
			if (!user) return res.code(401).send()
			const { friendshipId } = req.body
			const [friendship] = await db
				.delete(friendships)
				.where(eq(friendships.id, friendshipId))
				.returning()
			if (!friendship) return res.code(400).send()
			const { user1Id, user2Id } = friendship
			const concernedUserId = user1Id === user.id ? user2Id : user1Id
			notifyUser(concernedUserId, 'onFriendshipDeleted', { friendshipId })
			return res.send({ success: true })
		},
	)

	done()
}
