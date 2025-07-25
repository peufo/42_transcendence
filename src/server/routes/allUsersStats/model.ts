import { desc } from 'drizzle-orm'
import { db, users } from '../../db/index.js'
import { userStatsColumns } from '../friendships/model.js'

export async function getUsersSortedByGoals() {
	return db.query.users.findMany({
		orderBy: [desc(users.numberOfGoals)],
		columns: userStatsColumns,
	})
}
