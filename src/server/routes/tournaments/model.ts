import { eq } from 'drizzle-orm'
import { db, tournaments } from '../../db/index.js'
import { server } from '../../main.js'
import type { DB } from '../../types.js'
import { userBasicColumns } from '../friendships/model.js'

export async function createTournament(data: DB.TournamentCreate) {
	const [tournament] = await db.insert(tournaments).values(data).returning()
	return tournament
}

export async function getTournament(id: number) {
	const tournament = await db.query.tournaments.findFirst({
		where: eq(tournaments.id, id),
		with: {
			createdByUser: { columns: userBasicColumns },
			participants: {
				with: { user: { columns: userBasicColumns } },
			},
		},
	})
	if (!tournament) throw server.httpErrors.notFound()
	return tournament
}
