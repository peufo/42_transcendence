import argon2 from 'argon2'
import { and, eq, like, ne, notInArray } from 'drizzle-orm'
import type { User } from '../../../lib/type.js'
import { db, users } from '../../db/index.js'
import { server } from '../../server.js'
import { getFriendshipsId, userBasicColumns } from '../friendships/model.js'

export async function setUserIsActive(userId: number, isActive: boolean) {
	await db.update(users).set({ isActive }).where(eq(users.id, userId))
}

export async function searchUsersAsNotFriends(userId: number, search: string) {
	const friendsId = await getFriendshipsId(userId)

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
	data: { name?: string; password?: string },
): Promise<User> {
	const updateData: Partial<typeof users.$inferInsert> = {}
	const existingUser = await db.query.users.findFirst({
		where: eq(users.id, userId),
	})
	if (!existingUser) throw server.httpErrors.notFound('User not found')
	if (data.name) {
		if (data.name !== existingUser.name) updateData.name = data.name
		else
			throw server.httpErrors.badRequest('Please choose a different username')
	}

	if (!existingUser.isOAuth2 && data.password && existingUser.passwordHash) {
		const isSame = await argon2.verify(existingUser.passwordHash, data.password)
		if (!isSame) updateData.passwordHash = await argon2.hash(data.password)
		else
			throw server.httpErrors.badRequest('Please choose a different password')
	}

	const [user] = await db
		.update(users)
		.set(updateData)
		.where(eq(users.id, userId))
		.returning()

	return user
}
