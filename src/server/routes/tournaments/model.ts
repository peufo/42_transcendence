import { eq } from 'drizzle-orm'
import { Engine } from '../../../lib/engine/index.js'
import { getVersusMaxDepth } from '../../../lib/tournament.js'
import type {
	Tournament,
	TournamentWithLookup,
	Versus,
} from '../../../lib/type.js'
import { db, matches, rounds, tournaments, versus } from '../../db/index.js'
import { server } from '../../server.js'
import type { DB } from '../../types.js'
import { notify } from '../ws/controller.js'
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

export async function tournamentGetWithParticipants(
	tournamentId: number,
): Promise<TournamentWithLookup> {
	const tournament = await findTournamentWithParticipants(tournamentId)
	if (!tournament) throw server.httpErrors.notFound()
	return { ...tournament, stages: await getTournamentStages(tournament.id) }
}

export async function tournamentGet(tournamentId: number): Promise<Tournament> {
	const tournament = await db.query.tournaments.findFirst({
		where: eq(tournaments.id, tournamentId),
	})
	if (!tournament) throw server.httpErrors.notFound()
	return { ...tournament, stages: await getTournamentStages(tournament.id) }
}

async function getTournamentStages(
	tournamentId: number,
): Promise<Tournament['stages']> {
	const results = await db.query.versus.findMany({
		where: eq(versus.tournamentId, tournamentId),
		with: {
			match: {
				with: {
					player1: true,
					player2: true,
					rounds: true,
				},
			},
		},
	})
	const stages: Versus[][] = []
	for (const vs of results) {
		if (!stages[vs.stage]) stages[vs.stage] = [vs]
		else stages[vs.stage].push(vs)
	}
	return stages
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

const SCORES_TO_WIN = {
	0: 2,
	1: 1,
	2: 1,
	3: 1,
}

async function tournamentLoop(tournamentId: number) {
	const stages = await getTournamentStages(tournamentId)
	if (!stages) return //TODO what to do ?
	let currentStageIndex: number = -1
	let currentVersusIndex: number = 0
	handleVersus()

	async function handleVersus() {
		const currentVersus = getCurrentVersus()
		if (!currentVersus) return
		const engine = new Engine(
			{
				onEvent: async (data) => {
					if (data.onRoundEnd) {
						await db.insert(rounds).values({
							matchId: currentVersus.match.id,
							scorer: data.onRoundEnd.scorer,
							rallyCount: data.onRoundEnd.rallyCount,
							ballPositionY: data.onRoundEnd.ballPositionY,
						})
						await db
							.update(matches)
							.set({
								player1Score: data.onRoundEnd.scores.p1,
								player2Score: data.onRoundEnd.scores.p2,
							})
							.where(eq(matches.id, currentVersus.match.id))
					}
					if (data.onGameEnd) {
						await db
							.update(matches)
							.set({
								finishedAt: new Date(data.onGameEnd.finishedAt),
								state: 'finished',
							})
							.where(eq(matches.id, currentVersus.match.id))
						handleVersus()
					}
					notify.tournaments(tournamentId, 'onEngineEvent', {
						data,
						versusId: currentVersus.id,
					})
				},
			},
			{
				//@ts-ignore
				scoreToWin: SCORES_TO_WIN[currentVersus.stage],
				//@ts-ignore
			},
		)
		engine.start()
	}

	function getCurrentVersus() {
		// let winnersId[]: number = null
		const stage = stages?.at(currentStageIndex)
		if (!stage) return null
		const versus = stage.at(currentVersusIndex)
		if (!versus) {
			// for(const previousVersus of stage)
			// {
			// 	if (!previousVersus.match) return
			// 	const winnerId = previousVersus.match.player1Score > previousVersus.match.player2Score ? previousVersus.match?.player1Id : previousVersus.match?.player2Id
			// 	winnersId.push(winnerId)
			// 	previousVersus.parentVersusId
			// }
			// generate matches for stage ?
			currentStageIndex--
			currentVersusIndex = 0
			return getCurrentVersus()
		}
		currentVersusIndex++
		return versus
	}
}

export async function tournamentStart(tournamentId: number) {
	const tournament = await tournamentGetWithParticipants(tournamentId)
	await tournamentUpdateState(tournament.id, 'ongoing')
	const maxDepth = getVersusMaxDepth(tournament.numberOfPlayers)
	const participants = getRandomizedParticipants()
	const [match] = await db.insert(matches).values({}).returning()
	const [finalVersus] = await db
		.insert(versus)
		.values({ matchId: match.id, tournamentId, stage: 0 })
		.returning()
	await createVersusChildren(finalVersus)
	await tournamentLoop(tournamentId)

	async function createVersusChildren(parent: DB.Versus) {
		const data = {
			tournamentId: tournament.id,
			parentVersusId: parent.id,
			stage: parent.stage + 1,
		}
		const [matchA] = await db.insert(matches).values({}).returning()
		const [matchB] = await db.insert(matches).values({}).returning()
		const [newVersusA, newVersusB] = await db
			.insert(versus)
			.values([
				{ ...data, matchId: matchA.id },
				{ ...data, matchId: matchB.id },
			])
			.returning()
		if (newVersusA.stage < maxDepth) {
			await Promise.all([
				createVersusChildren(newVersusA),
				createVersusChildren(newVersusB),
			])
			return
		}
		// TODO: put in separate function
		console.log(participants)
		await db
			.update(matches)
			.set({
				player1Id: participants.pop(),
				player2Id: participants.pop(),
			})
			.where(eq(matches.id, newVersusA.matchId))
		console.log(participants)
		await db
			.update(matches)
			.set({
				player1Id: participants.pop(),
				player2Id: participants.pop(),
			})
			.where(eq(matches.id, newVersusB.matchId))
	}

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
