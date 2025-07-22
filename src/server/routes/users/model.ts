import { and, like, ne, notInArray } from 'drizzle-orm'
import { db, users } from '../../db/index.js'
import { getFriendships, userBasicColumns } from '../friendships/model.js'

export async function searchUsersAsNotFriends(userId: number, search: string) {
	const friendsId = await getFriendships(userId, 'friend').then((values) =>
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
