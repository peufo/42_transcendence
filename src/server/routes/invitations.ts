import { and, eq, or } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod/v4'
import { db, friendships } from '../db/index.js'
import '@fastify/cookie'
import '../types.js'

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
			console.log(friendshipId)
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

			console.log(result)
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
			console.log(invitedUserId)
			if (user.id < invitedUserId) {
				const result = await db.insert(friendships).values({
					user1Id: user.id,
					user2Id: invitedUserId,
					state: 'invited',
					createdBy: user.id,
				})
				console.log(result)
				if (!result.rowsAffected) return res.code(400).send()
				return res.send({ success: true })
			}
			const result = await db.insert(friendships).values({
				user1Id: invitedUserId,
				user2Id: user.id,
				state: 'invited',
				createdBy: user.id,
			})
			console.log(result)
			if (!result.rowsAffected) return res.code(400).send()
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
			console.log(result)
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
				console.log(result)
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
			console.log(result)
			if (!result.rowsAffected) return res.code(400).send()
			return res.send({ success: true })
		},
	)

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
		const friendship = {
			createdBy: r.createdBy,
			createdAt: r.createdAt,
			friendshipId: r.id,
		}
		if (r.user1Id === userId) return { ...friendship, ...r.user2 }
		return { ...friendship, ...r.user1 }
	})
}
