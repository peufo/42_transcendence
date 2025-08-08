import { eq } from 'drizzle-orm'
import type { Tournament } from '../../../lib/type.js'
import { db, tournaments } from '../../db/index.js'
import { server } from '../../main.js'
import type { DB } from '../../types.js'
import { userBasicColumns } from '../friendships/model.js'
import {
	createTournament,
	deleteParticipant,
	deleteTournament,
	findActiveTournamentByUserId,
	findTournament,
	findTournamentWithParticipants,
	insertParticipant,
} from './tournamentDb.js'

async function getUserActiveTournament(
	userId: number,
): Promise<Tournament | null> {
	return findActiveTournamentByUserId(userId)
}

export async function tournamentGetWithParticipants(tournamentId: number) {
	const tournament = await findTournamentWithParticipants(tournamentId)
	if (!tournament) throw server.httpErrors.notFound()
	return tournament
}

// export async function tournamentGet(tournamentId: number) {
// 	const tournament = findTournamentWithParticipants(tournamentId)
// 	if (!tournament) throw server.httpErrors.notFound()
// 	return tournament
// }

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

export async function tournamentCreate(data: DB.TournamentCreate) {
	const activeTournament = await getUserActiveTournament(data.createdBy)
	if (activeTournament) throw server.httpErrors.forbidden(`Sorry, you're busy`)
	return createTournament(data)
}

export async function tournamentDelete(tournamentId: number) {
	const tournament = await findTournament(tournamentId)
	if (!tournament) throw server.httpErrors.notFound()
	if (tournament.state !== 'open')
		throw server.httpErrors.forbidden('Tournament is ongoing or finished')
	return deleteTournament(tournamentId)
}

export async function getActiveTournament(userId: number) {
	return findActiveTournamentByUserId(userId)
}

export async function deleteOpenTournaments() {
	await db.delete(tournaments).where(eq(tournaments.state, 'open'))
}

export async function tournamentJoin(
	tournamentId: number,
	userId: number,
): Promise<{ tournament: Tournament; isTournamentFull: boolean }> {
	const activeTournament = await getUserActiveTournament(userId)
	if (activeTournament && activeTournament.id !== tournamentId)
		throw server.httpErrors.forbidden(`Sorry, you're busy`)
	const tournament = await tournamentGetWithParticipants(tournamentId)
	const userIsParticipant = tournament.participants.find(
		({ user }) => user.id === userId,
	)
	let nbParticipants = tournament.participants.length
	if (!userIsParticipant) {
		if (nbParticipants >= tournament.numberOfPlayers) {
			throw server.httpErrors.forbidden(
				"Sorry, you can't join this tournament, it is full.",
			)
		}
		if (tournament.state !== 'open') {
			throw server.httpErrors.forbidden('The tournament is not open anymore.')
		}
		insertParticipant(tournamentId, userId)
		nbParticipants++
	}
	return {
		tournament,
		isTournamentFull: nbParticipants === tournament.numberOfPlayers,
	}
}

export function tournamentUpdateState(
	tournamentId: number,
	newState: Tournament['state'],
) {
	return db
		.update(tournaments)
		.set({ state: newState })
		.where(eq(tournaments.id, tournamentId))
}

export function tournamentQuit(tournamentId: number, userId: number) {
	return deleteParticipant(tournamentId, userId)
}

export async function isTournamentEmptyAndOpen(
	tournamentId: number,
): Promise<boolean> {
	const tournament = await db.query.tournaments.findFirst({
		where: eq(tournaments.id, tournamentId),
		with: { participants: true },
	})
	if (!tournament) return false
	return tournament.state === 'open' && tournament.participants.length === 0
}
