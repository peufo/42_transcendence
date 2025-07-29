import { and, eq, ne } from 'drizzle-orm'
import type { UserBasic } from '../../../lib/type.js'
import { db, tournaments, tournamentsParticipants } from '../../db/index.js'
import { server } from '../../main.js'
import type { DB } from '../../types.js'
import { getUserBasic, userBasicColumns } from '../friendships/model.js'

async function getUserBusy(userId: number): Promise<boolean> {
	const participations = db
		.select()
		.from(tournamentsParticipants)
		.where(eq(tournamentsParticipants.userId, userId))
		.as('participations')
	const tournamentOpenOrOngoing = await db
		.select()
		.from(tournaments)
		.innerJoin(participations, ne(tournaments.state, 'finished'))
	return !!tournamentOpenOrOngoing.length
}

export async function tournamentCreate(data: DB.TournamentCreate) {
	const userIsBusy = await getUserBusy(data.createdBy)
	if (userIsBusy) throw server.httpErrors.forbidden('Sorry, your busy')
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

export async function tournamentDelete(tournamentId: number, ownerId: number) {
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

export async function tournamentGet(tournamentId: number) {
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

export async function tournamentJoin(
	tournamentId: number,
	userId: number,
): Promise<UserBasic> {
	const userIsBusy = await getUserBusy(userId)
	if (userIsBusy) throw server.httpErrors.forbidden('Sorry, your busy')
	const tournament = await tournamentGet(tournamentId)
	if (tournament.participants.length >= tournament.numberOfPlayers)
		throw server.httpErrors.forbidden(
			"Sorry, you can't join this tournament, he's full.",
		)
	if (!tournament.participants.find(({ user }) => user.id === userId))
		await db.insert(tournamentsParticipants).values({ tournamentId, userId })
	return getUserBasic(userId)
}

export async function tournamentQuit(
	tournamentId: number,
	userId: number,
): Promise<UserBasic> {
	await db
		.delete(tournamentsParticipants)
		.where(
			and(
				eq(tournamentsParticipants.tournamentId, tournamentId),
				eq(tournamentsParticipants.userId, userId),
			),
		)
	return getUserBasic(userId)
}
