import { and, eq, not, or } from 'drizzle-orm'
import type {
	Friend,
	FriendshipFriend,
	FriendshipInvitation,
	UserBasic,
	UserStats,
} from '../../../lib/type.js'
import { db, friendships, tournaments, users } from '../../db/index.js'
import type { DB } from '../../types.ts'

export const userBasicColumns = {
	id: true,
	name: true,
	hasAvatar: true,
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

export async function getFriendshipsId(userId: number): Promise<number[]> {
	return db.query.friendships
		.findMany({
			columns: {
				user1Id: true,
				user2Id: true,
			},
			where: or(
				eq(friendships.user1Id, userId),
				eq(friendships.user2Id, userId),
			),
		})
		.then((values) =>
			values.map(({ user1Id, user2Id }) =>
				user1Id === userId ? user2Id : user1Id,
			),
		)
}

export async function getFriendshipsInvitation(
	userId: number,
): Promise<FriendshipInvitation[]> {
	return db.query.friendships
		.findMany({
			where: and(
				or(eq(friendships.user1Id, userId), eq(friendships.user2Id, userId)),
				eq(friendships.state, 'invited'),
			),
			with: {
				user1: { columns: userBasicColumns },
				user2: { columns: userBasicColumns },
			},
		})
		.then((values) =>
			values.map(({ user1, user2, ...friendship }) => {
				const withUser = user1.id === userId ? user2 : user1
				return { ...friendship, withUser } as FriendshipInvitation
			}),
		)
}

export async function getFriendshipsFriend(
	userId: number,
): Promise<FriendshipFriend[]> {
	return db.query.friendships
		.findMany({
			where: and(
				or(eq(friendships.user1Id, userId), eq(friendships.user2Id, userId)),
				eq(friendships.state, 'friend'),
			),
			with: {
				user1: {
					columns: friendColumns,
					with: {
						tournaments: {
							where: eq(tournaments.state, 'open'),
						},
					},
				},
				user2: {
					columns: friendColumns,
					with: {
						tournaments: {
							where: eq(tournaments.state, 'open'),
						},
					},
				},
			},
		})
		.then((values) =>
			values.map(({ user1, user2, ...friendship }) => {
				const withUser = user1.id === userId ? user2 : user1
				return { ...friendship, withUser } as FriendshipFriend
			}),
		)
}

export async function getUserFriend(userId: number): Promise<Friend> {
	const friend = await db.query.users.findFirst({
		where: eq(users.id, userId),
		columns: friendColumns,
		with: {
			tournaments: {
				where: eq(tournaments.state, 'open'),
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
