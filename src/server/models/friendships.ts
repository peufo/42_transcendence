import { and, eq, or } from 'drizzle-orm'
import type { Friend, Friendship, UserBasic } from '../../lib/type.js'
import { db, friendships, users } from '../db/index.js'
import type { DB } from '../types.js'

export const userBasicColumns = {
	id: true,
	name: true,
	avatar: true,
	avatarPlaceholder: true,
} satisfies DB.Columns<UserBasic>

const friendColumns = {
	...userBasicColumns,
	isActive: true,
	lastLogin: true,
	// TODO: gameId: true
} satisfies DB.Columns<Friend>

export async function getFriendships(
	userId: number,
	state?: DB.Friendship['state'],
): Promise<Friendship[]> {
	return db.query.friendships
		.findMany({
			where: and(
				or(eq(friendships.user1Id, userId), eq(friendships.user2Id, userId)),
				state ? eq(friendships.state, state) : undefined,
			),
			with: {
				user1: { columns: friendColumns },
				user2: { columns: friendColumns },
			},
		})
		.then(
			(values) =>
				values.map(({ user1, user2, ...friendship }) => {
					const withUser = user1.id === userId ? user2 : user1
					if (friendship.state === 'friend') return { ...friendship, withUser }
					const { lastLogin, isActive, ...withFriend } = withUser
					return { ...friendship, withUser: withFriend }
				}) as Friendship[],
		)
}

export async function getUserFriend(userId: number): Promise<Friend> {
	const friend = await db.query.users.findFirst({
		where: eq(users.id, userId),
		columns: friendColumns,
	})
	if (!friend) throw new Error('Friend not found')
	return friend
}

export async function getUserBasic(userId: number) {
	return db.query.users.findFirst({
		where: eq(users.id, userId),
		columns: userBasicColumns,
	})
}
