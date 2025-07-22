import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod/v4'
import { notifyUser } from '../../events/session.js'
import { getSchema, permission, postSchema } from '../../utils/index.js'
import {
	acceptFriendship,
	createFriendship,
	deleteFriendship,
	getFriendships,
	getUserBasic,
	getUserFriend,
} from './model.js'

export const friendshipsRoute: FastifyPluginCallbackZod = (
	server,
	_options,
	done,
) => {
	server.get('/', getSchema('/friendships'), async (_req, res) => {
		const user = permission.user(res)
		const friendships = await getFriendships(user.id)
		// TODO: add gameId
		return res.send({ data: friendships })
	})

	server.post(
		'/new',
		postSchema('/friendships/new', { invitedUserId: z.coerce.number() }),
		async (req, res) => {
			const user = permission.user(res)
			const { invitedUserId } = req.body
			const [user1Id, user2Id] =
				user.id < invitedUserId
					? [user.id, invitedUserId]
					: [invitedUserId, user.id]
			const friendship = await createFriendship({
				user1Id,
				user2Id,
				state: 'invited',
				createdBy: user.id,
			})

			const withUser = await getUserBasic(user.id)
			if (!withUser) return res.badRequest()
			await notifyUser(invitedUserId, 'onFriendshipCreated', {
				friendship: { ...friendship, state: 'invited', withUser },
			})

			return res.send({ success: true })
		},
	)

	server.post(
		'/accept',
		postSchema('/friendships/accept', { friendshipId: z.coerce.number() }),
		async (req, res) => {
			const user = permission.user(res)
			const { friendshipId } = req.body
			const friendship = await acceptFriendship(friendshipId, user.id)
			const userId =
				friendship.createdBy === friendship.user1Id
					? friendship.user2Id
					: friendship.user1Id
			const withUser = await getUserFriend(userId)
			await notifyUser(friendship.createdBy, 'onFriendshipAccepted', {
				friendship: { ...friendship, state: 'friend', withUser },
			})
			return res.send({ success: true })
		},
	)

	server.post(
		'/delete',
		postSchema('/friendships/delete', { friendshipId: z.coerce.number() }),
		async (req, res) => {
			const user = permission.user(res)
			const { friendshipId } = req.body
			const { user1Id, user2Id } = await deleteFriendship(friendshipId)
			const concernedUserId = user1Id === user.id ? user2Id : user1Id
			notifyUser(concernedUserId, 'onFriendshipDeleted', { friendshipId })
			return res.send({ success: true })
		},
	)

	done()
}
