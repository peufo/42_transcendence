import { and, eq, not, or } from 'drizzle-orm'
import type {
	Friend,
	Friendship,
	UserBasic,
	UserStats,
} from '../../../lib/type.js'
import { db, friendships, users } from '../../db/index.js'
import type { DB } from '../../types.ts'

export const userBasicColumns = {
	id: true,
	name: true,
	avatar: true,
	avatarPlaceholder: true,
} satisfies DB.Columns<UserBasic>

export const userStatsColumns = {
	...userBasicColumns,
	numberOfMatches: true,
	numberOfWin: true,
	numberOfGoals: true,
} satisfies DB.Columns<UserStats>

const friendColumns = {
	...userBasicColumns,
	isActive: true,
	lastLogin: true,
} satisfies DB.Columns<Friend>

export async function getFriendships(
	userId: number,
	state?: DB.FriendshipCreate['state'],
): Promise<Friendship[]> {
	return db.query.friendships
		.findMany({
			where: and(
				or(eq(friendships.user1Id, userId), eq(friendships.user2Id, userId)),
				state ? eq(friendships.state, state) : undefined,
			),
			with: {
				user1: {
					columns: friendColumns,
					with: { participations: { with: { tournament: true } } },
				},
				user2: {
					columns: friendColumns,
					with: { participations: { with: { tournament: true } } },
				},
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
		with: {
			participations: {
				with: {
					tournament: true,
				},
			},
		},
	})
	if (!friend) throw new Error('Friend not found')
	return friend
}

export async function getUserBasic(userId: number): Promise<UserBasic> {
	const user = await db.query.users.findFirst({
		where: eq(users.id, userId),
		columns: userBasicColumns,
	})
	if (!user) throw new Error('User not found')
	return user
}

export async function createFriendship(data: DB.FriendshipCreate) {
	const [friendship] = await db.insert(friendships).values(data).returning()
	return friendship
}

export async function acceptFriendship(
	friendshipId: number,
	invitedUserId: number,
) {
	const [friendship] = await db
		.update(friendships)
		.set({ state: 'friend' })
		.where(
			and(
				eq(friendships.id, friendshipId),
				eq(friendships.state, 'invited'),
				not(eq(friendships.createdBy, invitedUserId)),
				or(
					eq(friendships.user1Id, invitedUserId),
					eq(friendships.user2Id, invitedUserId),
				),
			),
		)
		.returning()
	return friendship
}

export async function deleteFriendship(friendshipId: number) {
	const [friendship] = await db
		.delete(friendships)
		.where(eq(friendships.id, friendshipId))
		.returning()
	return friendship
}
