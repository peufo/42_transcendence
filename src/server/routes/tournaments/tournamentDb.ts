import { and, eq, ne } from 'drizzle-orm'
import type { Tournament } from '../../../lib/type.js'
import { db, tournaments, tournamentsParticipants } from '../../db/index.js'
import type { DB } from '../../types.js'
import { userBasicColumns } from '../friendships/model.js'

export async function findTournament(tournamentId: number) {
	return db.query.tournaments.findFirst({
		where: eq(tournaments.id, tournamentId),
	})
}

export async function findTournamentById(tournamentId: number) {
	return db.query.tournaments.findFirst({
		where: eq(tournaments.id, tournamentId),
	})
}

export async function findActiveTournamentByUserId(
	userId: number,
): Promise<Tournament | null> {
	const participations = db
		.select()
		.from(tournamentsParticipants)
		.where(eq(tournamentsParticipants.userId, userId))
		.as('participations')
	const results = await db
		.select()
		.from(tournaments)
		.innerJoin(
			participations,
			and(
				eq(tournaments.id, participations.tournamentId),
				ne(tournaments.state, 'finished'),
			),
		)
	return results.at(0)?.tournaments || null
}

export async function findTournamentWithParticipants(tournamentId: number) {
	return db.query.tournaments.findFirst({
		where: eq(tournaments.id, tournamentId),
		with: {
			createdByUser: { columns: userBasicColumns },
			participants: {
				with: { user: { columns: userBasicColumns } },
			},
		},
	})
}

export async function createTournament(data: DB.TournamentCreate) {
	return db.transaction(async (tx) => {
		const [tournament] = await tx.insert(tournaments).values(data).returning()
		await tx
			.insert(tournamentsParticipants)
			.values({ tournamentId: tournament.id, userId: tournament.createdBy })
		return tournament
	})
}

export async function deleteTournament(tournamentId: number) {
	const [tournamentDeleted] = await db
		.delete(tournaments)
		.where(eq(tournaments.id, tournamentId))
		.returning()
	return tournamentDeleted
}

export async function insertParticipant(tournamentId: number, userId: number) {
	await db.insert(tournamentsParticipants).values({ tournamentId, userId })
}

export async function deleteParticipant(tournamentId: number, userId: number) {
	await db
		.delete(tournamentsParticipants)
		.where(
			and(
				eq(tournamentsParticipants.tournamentId, tournamentId),
				eq(tournamentsParticipants.userId, userId),
			),
		)
}

export async function findParticipantsForTournament(tournamentId: number) {
	return db
		.select()
		.from(tournamentsParticipants)
		.where(eq(tournamentsParticipants.tournamentId, tournamentId))
}
