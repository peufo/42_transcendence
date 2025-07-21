import { and, eq, or } from 'drizzle-orm'
import { db, friendships } from '../../db/index.js'
import type { Friendship } from '../../types.js'

export async function getUserFriendships(
	userId: number,
	state?: Friendship['state'],
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

export async function getUserFriendsId(
	userId: number,
	state?: Friendship['state'],
) {
	const all = await getUserFriendships(userId, state)
	return all.map((f) => (f.user1Id === userId ? f.user2Id : f.user1Id))
}
