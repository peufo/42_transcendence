import { eq } from 'drizzle-orm'
import type { UserBasic } from '../../../lib/type.js'
import { db, tournaments, tournamentsParticipants } from '../../db/index.js'
import { server } from '../../main.js'
import type { DB } from '../../types.js'
import { getUserBasic, userBasicColumns } from '../friendships/model.js'

export async function createTournament(data: DB.TournamentCreate) {
	const tournamentId = await db.transaction(async (tx) => {
		const [{ id, createdBy }] = await tx
			.insert(tournaments)
			.values(data)
			.returning()
		await tx
			.insert(tournamentsParticipants)
			.values({ tournamentId: id, userId: createdBy })
		return id
	})
	return tournamentId
}

export async function deleteTournament(tournamentId: number, ownerId: number) {
	const tournament = await db.query.tournaments.findFirst({
		where: eq(tournaments.id, tournamentId),
	})
	if (!tournament) throw server.httpErrors.notFound()
	if (tournament.createdBy !== ownerId)
		throw server.httpErrors.forbidden('You are not the owner of tournament')
	if (tournament.state !== 'open')
		throw server.httpErrors.forbidden('Tournament is ongoing or finished')
	await db.delete(tournaments).where(eq(tournaments.id, tournamentId))
}

export async function getTournament(tournamentId: number) {
	const tournament = await db.query.tournaments.findFirst({
		where: eq(tournaments.id, tournamentId),
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

export async function joinTournament(
	tournamentId: number,
	userId: number,
): Promise<UserBasic> {
	const tournament = await getTournament(tournamentId)
	if (tournament.participants.length >= tournament.numberOfPlayers)
		throw server.httpErrors.forbidden(
			"Sorry, you can't join this tournament, he's full.",
		)
	if (!tournament.participants.find(({ user }) => user.id === userId))
		await db.insert(tournamentsParticipants).values({ tournamentId, userId })
	return getUserBasic(userId)
}
