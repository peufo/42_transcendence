import argon2 from 'argon2'
import { and, eq, like, ne, notInArray } from 'drizzle-orm'
import type { User } from '../../../lib/type.js'
import { db, users } from '../../db/index.js'
import { HttpError } from '../../utils/HttpError.js'
import { getFriendships, userBasicColumns } from '../friendships/model.js'

export async function searchUsersAsNotFriends(userId: number, search: string) {
	const friendsId = await getFriendships(userId).then((values) =>
		values.map(({ withUser }) => withUser.id),
	)

	return db.query.users.findMany({
		where: and(
			like(users.name, `%${search}%`),
			ne(users.id, userId),
			notInArray(users.id, friendsId),
		),
		columns: userBasicColumns,
		limit: 5,
	})
}

export async function updateUser(
	userId: number,
	data: { name: string; password: string },
): Promise<User> {
	const updateData: Partial<typeof users.$inferInsert> = {}

	const existingUser = await db.query.users.findFirst({
		where: eq(users.id, userId),
	})
	if (!existingUser) throw new HttpError('User undefined', 404)
	if (data.name !== '') {
		if (data.name !== existingUser.name) updateData.name = data.name
		else throw new HttpError('Please choose a different username', 400)
	}

	if (data.password !== '') {
		const isSame = await argon2.verify(existingUser.passwordHash, data.password)
		if (!isSame) updateData.passwordHash = await argon2.hash(data.password)
		else throw new HttpError('Please choose a different password', 400)
	}

	const [user] = await db
		.update(users)
		.set(updateData)
		.where(eq(users.id, userId))
		.returning({
			id: users.id,
			name: users.name,
			avatar: users.avatar,
			avatarPlaceholder: users.avatarPlaceholder,
			isActive: users.isActive,
			lastLogin: users.lastLogin,
			createdAt: users.createdAt,
		})

	return user
}
