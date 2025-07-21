import { and, getTableColumns, like, ne, notInArray } from 'drizzle-orm'
import { db, users } from '../../db/index.js'
import { getUserFriendsId } from '../friendship/model.js'

export async function findUsers(search: string, userId: number) {
	const friendsId = await getUserFriendsId(userId)

	const { passwordHash, isActive, lastLogin, createdAt, ...safeColumns } =
		getTableColumns(users)

	return db
		.select(safeColumns)
		.from(users)
		.where(
			and(
				like(users.name, `%${search}%`),
				ne(users.id, userId),
				notInArray(users.id, friendsId),
			),
		)
		.limit(5)
}
