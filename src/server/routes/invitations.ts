import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod/v4'
import { db, friendships } from '../db/index.js'
import { and, or, eq } from 'drizzle-orm'
import '@fastify/cookie'
import '../types.js'

export const invitationsRoute: FastifyPluginCallbackZod = (
	server,
	options,
	done,
) => {
	server.get('/', async (req, res) => {
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
