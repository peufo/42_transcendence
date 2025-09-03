import { eq } from 'drizzle-orm'
import { Engine, type RoundData } from '../../../lib/engine/index.js'
import { db, matches, rounds } from '../../db/index.js'
import type { DB } from '../../types.js'
import { tournamentGetStages } from '../tournaments/model.js'
import { deleteEmitter, notify } from './controller.js'

export function createMatchEngine(match: DB.Match): Engine {
	return new Engine({
		scoreToWin: match.scoreToWin,
		async onRoundEnd(round) {
			const updatedMatch = await updateMatchRound(match.id, round)
			if (match.tournamentId)
				notify.tournaments(match.tournamentId, 'onMatchChange', {
					match: updatedMatch,
				})
		},
		async onGameEnd({ finishedAt, finalRound }) {
			await updateMatchRound(match.id, finalRound)
			const updatedMatch = await updateMatchEnd(
				match.id,
				finalRound,
				new Date(finishedAt),
			)
			const tournamentId = match.tournamentId
			if (tournamentId) {
				notify.tournaments(tournamentId, 'onMatchChange', {
					match: updatedMatch,
				})
				await handleTournamentGameEnd({ ...updatedMatch, tournamentId })
			}
			deleteEmitter('matches', match.id)
		},
		async onEvent(data) {
			notify.matches(match.id, 'onEngineEvent', data)
		},
	})
}

export async function handleTournamentGameEnd(
	match: DB.Match & { tournamentId: number },
) {
	const winnerId =
		match.player1Score > match.player2Score ? match.player1Id : match.player2Id
	if (!winnerId) throw new Error('winner is not defined') // TODO: where is catched this error
	const stages = await tournamentGetStages(match.tournamentId)

	const matchStageIndex = stages.findIndex((stage) =>
		stage.find((m) => m.id === match.id),
	)
	if (matchStageIndex === -1) throw new Error('matchStage not found')
	const isTournamentEnd = matchStageIndex + 1 === stages.length
	if (isTournamentEnd) {
		// Close tournament socket ?
		// tournament state finished
		notify.tournaments(match.tournamentId, 'onEnd', null)
		return
	}

	const matchStage = stages[matchStageIndex]
	const nextStage = stages[matchStageIndex + 1]
	const nextMatchIndex = Math.floor(
		matchStage.findIndex((m) => m.id === match.id) / 2,
	)
	const nextMatch = nextStage.at(nextMatchIndex)
	if (!nextMatch) {
		console.log('Should not happen')
		return
	}
	await db
		.update(matches)
		.set({
			player1Id: nextMatch.player1Id || winnerId,
			player2Id: nextMatch.player1Id ? winnerId : null,
		})
		.where(eq(matches.id, nextMatch.id))

	const updatedNextMatch = await db.query.matches.findFirst({
		where: eq(matches.id, nextMatch.id),
		with: {
			player1: true,
			player2: true,
		},
	})
	if (!updatedNextMatch) {
		console.log('Should not happen')
		return
	}
	notify.tournaments(match.tournamentId, 'onMatchChange', {
		match: updatedNextMatch,
	})
}

async function updateMatchRound(matchId: number, round: RoundData) {
	const [results] = await Promise.all([
		db
			.update(matches)
			.set({
				player1Score: round.scores.p1,
				player2Score: round.scores.p2,
			})
			.where(eq(matches.id, matchId))
			.returning(),
		db.insert(rounds).values({ matchId, ...round }),
	])
	return results[0]
}

async function updateMatchEnd(
	matchId: number,
	round: RoundData,
	finishedAt: Date,
) {
	const [results] = await Promise.all([
		db
			.update(matches)
			.set({
				state: 'finished',
				finishedAt,
				player1Score: round.scores.p1,
				player2Score: round.scores.p2,
			})
			.where(eq(matches.id, matchId))
			.returning(),
		db.insert(rounds).values({ matchId, ...round }),
	])
	return results[0]
}

// export async function updateMatchSurrender(
// 	matchId: number,
// 	surrenderer: Player,
// ) {
// 	const [match] = await db
// 		.update(matches)
// 		.set({
// 			state: 'finished',
// 			finishedAt: new Date(),
// 			...(surrenderer === 'p1' ? { player1Score: -1 } : {}),
// 			...(surrenderer === 'p2' ? { player2Score: -1 } : {}),
// 		})
// 		.where(eq(matches.id, matchId))
// 		.returning()
// 	return match
// }
