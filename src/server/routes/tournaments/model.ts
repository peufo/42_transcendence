import { eq } from 'drizzle-orm'
import { Engine } from '../../../lib/engine/index.js'
import type {
	Match,
	Tournament,
	TournamentWithLookup,
} from '../../../lib/type.js'
import { db, matches, rounds, tournaments } from '../../db/index.js'
import { server } from '../../server.js'
import type { DB } from '../../types.js'
import { userBasicColumns } from '../friendships/model.js'
// import { notify } from '../ws/controller.js'
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

function getScoreToWin(stage: Match[]) {
	// TODO: update values
	switch (stage.length) {
		case 1: // finale
			return 3
		case 2: // demi finale
			return 2
		default: // le reste
			return 1
	}
}

async function tournamentLoop(tournamentId: number) {
	const tournament = await tournamentGet(tournamentId)
	let currentStageIndex = 0
	let currentStage = tournament.stages[currentStageIndex]

	while (currentStageIndex < tournament.stages.length) {
		await handleStage()
		incrementStage()
	}
	handleEnd()

	async function handleStage() {
		await Promise.all(currentStage.map(handleMatch))
	}

	function incrementStage() {
		currentStageIndex++
		if (currentStageIndex === tournament.stages.length) {
			return
		}
		currentStage = tournament.stages[currentStageIndex]
		//  tournament.notify('onNextStage')
	}

	function handleEnd() {
		// tournament.notify('onEnd')
	}

	function handleMatch(match: Match): Promise<void> {
		return new Promise((resolve) => {
			const engine = new Engine({
				scoreToWin: getScoreToWin(currentStage),
				async onRoundEnd(round) {
					await db.insert(rounds).values({
						matchId: match.id,
						scorer: round.scorer,
						rallyCount: round.rallyCount,
						ballPositionY: round.ballPositionY,
					})
					match.player1Score = round.scores.p1
					match.player2Score = round.scores.p2
					await db
						.update(matches)
						.set({
							player1Score: round.scores.p1,
							player2Score: round.scores.p2,
						})
						.where(eq(matches.id, match.id))
				},
				async onGameEnd(gameEnd) {
					match.state = 'finished'
					match.finishedAt = new Date(gameEnd.finishedAt)
					await db
						.update(matches)
						.set({
							state: match.state,
							finishedAt: match.finishedAt,
						})
						.where(eq(matches.id, match.id))
					const winnerId =
						match.player1Score > match.player2Score
							? match.player1Id
							: match.player2Id
					const nextStage = tournament.stages[currentStageIndex + 1]
					const childMatch =
						nextStage[Math.floor(currentStage.indexOf(match) / 2)]
					const player1Id = childMatch.player1Id || winnerId
					const player2Id = childMatch.player1Id ? winnerId : null
					childMatch.player1Id = player1Id
					childMatch.player2Id = player2Id
					await db
						.update(matches)
						.set({ player1Id, player2Id })
						.where(eq(matches.id, childMatch.id))
					resolve()
				},
				async onEvent() {
					// notify.tournaments(tournamentId, 'onEngineEvent',
					// data, versusId
					// : match.id,
					// )
				},
			})

			startMatch()

			async function startMatch() {
				engine.start() // TODO: check players are connected
				match.state = 'ongoing'
				await db
					.update(matches)
					.set({
						state: match.state,
					})
					.where(eq(matches.id, match.id))
			}
		})
	}
}

export async function tournamentStart(tournamentId: number) {
	const tournament = await tournamentGet(tournamentId)
	await tournamentUpdateState(tournament.id, 'ongoing')
	const participants = getRandomizedParticipants()
	const newMatches = await db
		.insert(matches)
		.values(Array(tournament.numberOfPlayers - 1).fill({ tournamentId }))
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

	await tournamentLoop(tournamentId)

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
