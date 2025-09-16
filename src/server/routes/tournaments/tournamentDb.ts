import { and, eq, ne } from 'drizzle-orm'
import type { Tournament } from '../../../lib/type.js'
import {
	db,
	matches,
	tournaments,
	tournamentsParticipants,
} from '../../db/index.js'
import type { DB } from '../../types.js'
import { userBasicColumns } from '../friendships/model.js'

export async function findTournament(tournamentId: number) {
	return db.query.tournaments.findFirst({
		where: eq(tournaments.id, tournamentId),
	})
}

export async function getUserActiveTournament(
	userId: number,
): Promise<Tournament | null> {
	const participations = db
		.select()
		.from(tournamentsParticipants)
		.where(
			and(
				eq(tournamentsParticipants.userId, userId),
				eq(tournamentsParticipants.isActive, true),
			),
		)
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

const stageOrder: Record<number, string> = {
	0: 'final',
	1: 'semifinals',
	2: 'quarterfinals',
	3: 'eighthfinals',
}

export async function createTournament(
	data: DB.TournamentCreate & {
		pointsToWin: Record<string, number>
	},
) {
	return db.transaction(async (tx) => {
		const [tournament] = await tx.insert(tournaments).values(data).returning()
		await tx
			.insert(tournamentsParticipants)
			.values({ tournamentId: tournament.id, userId: tournament.createdBy })
		await tx.insert(matches).values(
			Array(tournament.numberOfPlayers - 1)
				.fill(0)
				.map((_, index) => {
					const stageIndex = Math.floor(
						Math.log2(tournament.numberOfPlayers - index - 1),
					)
					const stageName = stageOrder[stageIndex]
					const pointsToWin = data.pointsToWin[stageName] ?? 3
					return {
						tournamentId: tournament.id,
						pointsToWin,
					}
				}),
		)
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
	return await db
		.insert(tournamentsParticipants)
		.values({ tournamentId, userId, joinedAt: new Date() })
		.returning()
}

export async function findParticipantsForTournament(tournamentId: number) {
	return db
		.select()
		.from(tournamentsParticipants)
		.where(eq(tournamentsParticipants.tournamentId, tournamentId))
}
