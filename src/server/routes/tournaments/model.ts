import { eq } from 'drizzle-orm'
import type { Tournament, TournamentWithLookup } from '../../../lib/type.js'
import { db, matches, tournaments } from '../../db/index.js'
import { server } from '../../server.js'
import type { DB } from '../../types.js'
import { userBasicColumns } from '../friendships/model.js'
import { notify } from '../ws/controller.js'
import {
	createTournament,
	deleteParticipant,
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
	return {
		...tournament,
		stages: getMatchesByStages(tournament.numberOfPlayers, tournament.matches),
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
	const tournament = await tournamentGet(tournamentId)
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

function tournamentUpdateState(
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

function getScoreToWin(stageIndex: number) {
	// TODO: update values
	switch (stageIndex) {
		case 0: // finale
			return 3
		case 1: // demi finale
			return 2
		default: // le reste
			return 1
	}
}

export async function tournamentStart(tournamentId: number) {
	await tournamentUpdateState(tournamentId, 'ongoing')
	const tournament = await tournamentGet(tournamentId)
	const participants = getRandomizedParticipants()
	const newMatches = await db
		.insert(matches)
		.values(
			Array(tournament.numberOfPlayers - 1)
				.fill(0)
				.map((_, index) => {
					const stageIndex = Math.floor(
						Math.log2(tournament.numberOfPlayers - index - 1),
					)
					const scoreToWin = getScoreToWin(stageIndex)
					return {
						tournamentId,
						scoreToWin,
					}
				}),
		)
		.returning()
	const matchesByStage = getMatchesByStages(
		tournament.numberOfPlayers,
		newMatches,
	)
	await Promise.all(
		matchesByStage[0].map((match) =>
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
