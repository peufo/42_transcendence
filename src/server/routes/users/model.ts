import { and, like, ne, notInArray } from 'drizzle-orm'
import { db, users } from '../../db/index.js'
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

import { eq } from 'drizzle-orm'
import argon2 from 'argon2'

export async function updateUser(userId: number, data: { name?: string, password?: string }) {
    const updateData: Partial<typeof users.$inferInsert> = {}

    if (data.name) {
        updateData.name = data.name
    }

    if (data.password) {
        updateData.passwordHash = await argon2.hash(data.password)
    }

    if (Object.keys(updateData).length === 0) return null

    const [user] = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, userId))
        .returning({
            id: users.id,
            name: users.name,
            avatar: users.avatar,
            avatarPlaceholder: users.avatarPlaceholder,
        })

    return user
}

