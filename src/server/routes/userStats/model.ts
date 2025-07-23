import { and, eq, isNotNull, or } from 'drizzle-orm'
import { db, matches } from '../../db/index.js'
import { userBasicColumns } from '../friendships/model.js'

export function getMatches(userId: number) {
	return db.query.matches.findMany({
		where: and(
			or(eq(matches.player1Id, userId), eq(matches.player2Id, userId)),
			isNotNull(matches.finishedAt),
		),
		with: {
			player1: { columns: userBasicColumns },
			player2: { columns: userBasicColumns },
			rounds: {
				columns: {
					scorer: true,
					rallyCount: true,
					ballPositionY: true,
				},
			},
		},
	})
}
