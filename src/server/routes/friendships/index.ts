import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod/v4'
import { getSchema, permission, postSchema } from '../../utils/index.js'
import { notify } from '../ws/controller.js'
import {
	acceptFriendship,
	createFriendship,
	deleteFriendship,
	getFriendshipsFriend,
	getFriendshipsInvitation,
	getUserBasic,
	getUserFriend,
} from './model.js'

export const friendshipsRoute: FastifyPluginCallbackZod = (
	server,
	_options,
	done,
) => {
	server.get(
		'/invitation',
		getSchema('/friendships/invitation', null),
		async (_req, res) => {
			const user = permission.user(res)
			const friendships = await getFriendshipsInvitation(user.id)
			return res.send({ data: friendships })
		},
	)
	server.get(
		'/friend',
		getSchema('/friendships/friend', null),
		async (_req, res) => {
			const user = permission.user(res)
			const friendships = await getFriendshipsFriend(user.id)
			return res.send({ data: friendships })
		},
	)

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
			notify.friendships(invitedUserId, 'onCreated', {
				friendship: { ...friendship, state: 'invited', withUser },
			})
			return res.send({ success: true, invitedUserId })
		},
	)

	server.post(
		'/accept',
		postSchema('/friendships/accept', { friendshipId: z.coerce.number() }),
		async (req, res) => {
			const user = permission.user(res)
			const { friendshipId } = req.body
			const friendship = await acceptFriendship(friendshipId, user.id)
			const acceptedUserId =
				friendship.createdBy === friendship.user1Id
					? friendship.user2Id
					: friendship.user1Id
			const withUser = await getUserFriend(acceptedUserId)
			notify.friendships(friendship.createdBy, 'onAccepted', {
				friendship: { ...friendship, state: 'friend', withUser },
			})
			return res.send({ success: true, acceptedUserId })
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
			notify.friendships(concernedUserId, 'onDeleted', { friendshipId })
			return res.send({ success: true })
		},
	)

	done()
}
