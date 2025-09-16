import { and, eq } from 'drizzle-orm'
import type { Tournament, TournamentWithLookup } from '../../../lib/type.js'
import {
	db,
	matches,
	tournaments,
	tournamentsParticipants,
} from '../../db/index.js'
import { server } from '../../server.js'
import type { DB } from '../../types.js'
import { userBasicColumns } from '../friendships/model.js'
import { notify } from '../ws/controller.js'
import {
	createTournament,
	deleteTournament,
	findTournament,
	getUserActiveTournament,
	insertParticipant,
} from './tournamentDb.js'

export async function tournamentGet(
	tournamentId: number,
): Promise<TournamentWithLookup> {
	const tournament = await db.query.tournaments.findFirst({
		where: eq(tournaments.id, tournamentId),
		with: {
			createdByUser: { columns: userBasicColumns },
			participants: {
				with: { user: { columns: userBasicColumns } },
			},
			matches: {
				with: {
					player1: true,
					player2: true,
					rounds: true,
				},
			},
		},
	})
	if (!tournament) throw server.httpErrors.notFound()
	const { matches, ...restTournament } = tournament
	return {
		...restTournament,
		stages: getMatchesByStages(tournament.numberOfPlayers, matches),
	}
}

export async function tournamentGetStages(tournamentId: number) {
	const tournament = await db.query.tournaments.findFirst({
		where: eq(tournaments.id, tournamentId),
		with: { matches: true },
	})
	if (!tournament) throw server.httpErrors.notFound()
	return getMatchesByStages(tournament.numberOfPlayers, tournament.matches)
}
export function tournamentGetWithParticipants(tournamentId: number) {
	return db.query.tournaments.findFirst({
		where: eq(tournaments.id, tournamentId),
		with: { participants: true },
	})
}

function getMatchesByStages<M extends DB.Match>(
	numberOfPlayers: number,
	matches: M[],
): M[][] {
	matches.sort((a, b) => a.id - b.id)
	const matchesByStages: M[][] = []
	let index = 0
	for (let stageSize = numberOfPlayers / 2; stageSize >= 1; stageSize /= 2) {
		matchesByStages.push(matches.slice(index, index + stageSize))
		index += stageSize
	}
	return matchesByStages
}

export async function tournamentCreate(
	data: DB.TournamentCreate & {
		pointsToWin: Record<string, number>
	},
) {
	const activeTournament = await getUserActiveTournament(data.createdBy)
	if (activeTournament)
		throw server.httpErrors.forbidden(`You are already in a tournament`)
	return createTournament(data)
}

export async function tournamentDelete(tournamentId: number) {
	const tournament = await findTournament(tournamentId)
	if (!tournament) throw server.httpErrors.notFound()
	if (tournament.state !== 'open')
		throw server.httpErrors.forbidden('Tournament is ongoing or finished')
	await db.delete(matches).where(eq(matches.tournamentId, tournamentId))
	return deleteTournament(tournamentId)
}

export async function deleteOpenTournaments() {
	await db.delete(tournaments).where(eq(tournaments.state, 'open'))
}

export async function tournamentJoin(
	tournamentId: number,
	userId: number,
): Promise<{
	tournament: Tournament
	joinedAt: Date
}> {
	const activeTournament = await getUserActiveTournament(userId)
	if (activeTournament && activeTournament.id !== tournamentId)
		throw server.httpErrors.forbidden(`You are already in a tournament`)
	const tournament = await tournamentGet(tournamentId)
	const participantInTournament = tournament.participants.find(
		({ user }) => user.id === userId,
	)
	let nbParticipants = tournament.participants.length
	if (!participantInTournament) {
		if (nbParticipants >= tournament.numberOfPlayers) {
			throw server.httpErrors.forbidden(
				"Sorry, you can't join this tournament, it is full.",
			)
		}
		if (tournament.state !== 'open') {
			throw server.httpErrors.forbidden('The tournament is not open anymore.')
		}
		const participants = await insertParticipant(tournamentId, userId)
		nbParticipants++
		return {
			tournament,
			joinedAt: participants.at(0)?.joinedAt ?? new Date(),
		}
	}
	return {
		tournament,
		joinedAt: new Date(),
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

export function tournamentQuitOngoing(tournamentId: number, userId: number) {
	return db
		.update(tournamentsParticipants)
		.set({ isActive: false })
		.where(
			and(
				eq(tournamentsParticipants.tournamentId, tournamentId),
				eq(tournamentsParticipants.userId, userId),
			),
		)
}

export function tournamentQuitOpen(tournamentId: number, userId: number) {
	return db
		.delete(tournamentsParticipants)
		.where(
			and(
				eq(tournamentsParticipants.tournamentId, tournamentId),
				eq(tournamentsParticipants.userId, userId),
			),
		)
}

export async function tournamentStart(tournamentId: number) {
	await tournamentUpdateState(tournamentId, 'ongoing')
	const tournament = await tournamentGet(tournamentId)
	const participants = getRandomizedParticipants()
	await Promise.all(
		tournament.stages[0].map((match) =>
			db
				.update(matches)
				.set({
					player1Id: participants.pop(),
					player2Id: participants.pop(),
				})
				.where(eq(matches.id, match.id)),
		),
	)

	const tournamentUpdated = await tournamentGet(tournamentId)
	notify.tournaments(tournamentId, 'onStart', {
		stages: tournamentUpdated.stages,
	})

	function getRandomizedParticipants(): number[] {
		const randomNumbers = new Array(tournament.numberOfPlayers)
			.fill(1)
			.map(() => Math.random())
		const sorted = [...randomNumbers].sort()
		return randomNumbers
			.map((n) => sorted.indexOf(n))
			.map((i) => tournament.participants[i].user.id)
	}
}
