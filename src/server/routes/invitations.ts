import { and, eq, or } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod/v4'
import { db, friendships, users } from '../db/index.js'
import '@fastify/cookie'
import '../types.js'
import type { UserBasic } from '../../lib/type.js'
import { notifyUser } from '../events/session.js'
import type { Friendship, UserColumns } from '../types.js'

export const invitationsRoute: FastifyPluginCallbackZod = (
	server,
	_options,
	done,
) => {
	server.get('/', async (_req, res) => {
		const user = res.locals?.user
		if (!user) return res.code(401).send()
		const invitations = await getInvitations(user.id)
		// TODO: add gameId
		return res.send({ data: invitations })
	})

	server.post(
		'/accept',
		{
			schema: {
				body: z.object({
					friendshipId: z.coerce.number(),
				}),
			},
		},
		async (req, res) => {
			const user = res.locals?.user
			if (!user) return res.code(401).send()
			const { friendshipId } = req.body
			console.log({ friendshipId })
			const result = await db
				.update(friendships)
				.set({ state: 'friend' })
				.where(
					and(
						eq(friendships.id, friendshipId),
						eq(friendships.state, 'invited'),
						or(
							eq(friendships.user1Id, user.id),
							eq(friendships.user2Id, user.id),
						),
					),
				)

			console.log({ result })
			if (!result.rowsAffected) return res.code(400).send()
			return res.send({ success: true })
		},
	)

	server.post(
		'/new',
		{
			schema: {
				body: z.object({
					invitedUserId: z.coerce.number(),
				}),
			},
		},
		async (req, res) => {
			const user = res.locals?.user
			if (!user) return res.code(401).send()
			const { invitedUserId } = req.body
			const [user1Id, user2Id] =
				user.id < invitedUserId
					? [user.id, invitedUserId]
					: [invitedUserId, user.id]
			const [invitation] = await db
				.insert(friendships)
				.values({
					user1Id,
					user2Id,
					state: 'invited',
					createdBy: user.id,
				})
				.returning()
			console.log({ invitation })
			if (!invitation) return res.code(400).send()

			const [user1, user2] = await Promise.all([
				getUserBasic(invitation.user1Id),
				getUserBasic(invitation.user2Id),
			])
			if (!user1 || !user2) return res.code(400).send()
			await notifyUser(invitedUserId, 'onNewFriend', {
				invitation: {
					...invitation,
					createdAt: invitation.createdAt.toJSON(),
					user1,
					user2,
				},
			})

			return res.send({ success: true })
		},
	)
	server.post(
		'/cancel',
		{
			schema: {
				body: z.object({
					friendshipId: z.coerce.number(),
				}),
			},
		},
		async (req, res) => {
			const user = res.locals?.user
			if (!user) return res.code(401).send()
			const { friendshipId } = req.body
			const result = await db
				.delete(friendships)
				.where(eq(friendships.id, friendshipId))
			console.log({ result })
			if (!result.rowsAffected) return res.code(400).send()
			return res.send({ success: true })
		},
	)
	server.post(
		'/remove',
		{
			schema: {
				body: z.object({
					friendId: z.coerce.number(),
				}),
			},
		},
		async (req, res) => {
			const user = res.locals?.user
			if (!user) return res.code(401).send()
			const { friendId } = req.body
			if (user.id < friendId) {
				const result = await db
					.delete(friendships)
					.where(
						and(
							eq(friendships.user1Id, user.id),
							eq(friendships.user2Id, friendId),
						),
					)
				console.log({ result })
				if (!result.rowsAffected) return res.code(400).send()
				return res.send({ success: true })
			}
			const result = await db
				.delete(friendships)
				.where(
					and(
						eq(friendships.user1Id, friendId),
						eq(friendships.user2Id, user.id),
					),
				)
			console.log({ result })
			if (!result.rowsAffected) return res.code(400).send()
			return res.send({ success: true })
		},
	)

	done()
}

const userBasicColumns = {
	passwordHash: false,
	createdAt: false,
	lastLogin: false,
	isActive: false,
} satisfies UserColumns

async function getUserBasic(userId: number) {
	return db.query.users.findFirst({
		where: eq(users.id, userId),
		columns: userBasicColumns,
	})
}

type FriendshipWithUsers = Friendship & { user1: UserBasic; user2: UserBasic }

async function getInvitations(userId: number): Promise<FriendshipWithUsers[]> {
	return db.query.friendships.findMany({
		where: and(
			or(eq(friendships.user1Id, userId), eq(friendships.user2Id, userId)),
			eq(friendships.state, 'invited'),
		),
		with: {
			user1: { columns: userBasicColumns },
			user2: { columns: userBasicColumns },
		},
	})
}
