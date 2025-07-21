import { and, eq, or } from 'drizzle-orm'
import { db, friendships } from '../../db/index.js'

export async function findInvitations(userId: number) {
	return db.query.friendships.findMany({
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
}

export async function acceptFriendship(friendshipId: number, userId: number) {
	return db
		.update(friendships)
		.set({ state: 'friend' })
		.where(
			and(
				eq(friendships.id, friendshipId),
				eq(friendships.state, 'invited'),
				or(eq(friendships.user1Id, userId), eq(friendships.user2Id, userId)),
			),
		)
}

export async function createFriendship(userId: number, invitedUserId: number) {
	const [user1Id, user2Id] =
		userId < invitedUserId ? [userId, invitedUserId] : [invitedUserId, userId]

	return db.insert(friendships).values({
		user1Id,
		user2Id,
		state: 'invited',
		createdBy: userId,
	})
}

export async function cancelFriendship(friendshipId: number) {
	return db.delete(friendships).where(eq(friendships.id, friendshipId))
}

export async function removeFriendship(userId: number, friendId: number) {
	const [user1Id, user2Id] =
		userId < friendId ? [userId, friendId] : [friendId, userId]

	return db
		.delete(friendships)
		.where(
			and(eq(friendships.user1Id, user1Id), eq(friendships.user2Id, user2Id)),
		)
}
