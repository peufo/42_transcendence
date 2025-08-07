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
	findParticipantsForTournament,
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
): Promise<Tournament> {
	const activeTournament = await getUserActiveTournament(userId)
	if (activeTournament && activeTournament.id !== tournamentId)
		throw server.httpErrors.forbidden(`Sorry, you're busy`)
	const tournament = await tournamentGetWithParticipants(tournamentId)
	const userIsParticipant = tournament.participants.find(
		({ user }) => user.id === userId,
	)
	if (!userIsParticipant) {
		if (tournament.participants.length >= tournament.numberOfPlayers) {
			throw server.httpErrors.forbidden(
				"Sorry, you can't join this tournament, it is full.",
			)
		}
	}
	insertParticipant(tournamentId, userId)
	return tournament
}

export function tournamentQuit(tournamentId: number, userId: number) {
	return deleteParticipant(tournamentId, userId)
}

export async function isTournamentEmpty(
	tournamentId: number,
): Promise<boolean> {
	const participantList = await findParticipantsForTournament(tournamentId)
	return participantList.length === 0
}
