import { eq } from 'drizzle-orm'
import { db, tournaments, tournamentsParticipants } from '../../db/index.js'
import { server } from '../../main.js'
import type { DB } from '../../types.js'
import { userBasicColumns } from '../friendships/model.js'

export async function createTournament(data: DB.TournamentCreate) {
	const tournamentId = await db.transaction(async (tx) => {
		const [{ id, createdBy }] = await tx
			.insert(tournaments)
			.values(data)
			.returning()
		await tx
			.insert(tournamentsParticipants)
			.values({ tournamentId: id, userId: createdBy })
			.returning()
		return id
	})
	return tournamentId
}

export async function deleteTournament(id: number, userId: number) {
	const tournament = await db.query.tournaments.findFirst({
		where: eq(tournaments.id, id),
	})
	if (!tournament) throw server.httpErrors.notFound()
	if (tournament.createdBy !== userId)
		throw server.httpErrors.forbidden('You are not the owner of tournament')
	if (tournament.state !== 'open')
		throw server.httpErrors.forbidden('Tournament is ongoing or finished')
	await db.delete(tournaments).where(eq(tournaments.id, id))
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
