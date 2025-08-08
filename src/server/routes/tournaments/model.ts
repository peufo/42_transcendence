import { eq } from 'drizzle-orm'
import type {
	Tournament,
	TournamentWithLookup,
	Versus,
} from '../../../lib/type.js'
import { db, matches, tournaments, versus } from '../../db/index.js'
import { server } from '../../server.js'
import type { DB } from '../../types.js'
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

export async function tournamentStart(tournamentId: number) {
	const tournament = await tournamentGetWithParticipants(tournamentId)
	await tournamentUpdateState(tournament.id, 'ongoing')

	const deep = getVersusMaxDepth()
	const participants = getRandomizedParticipants()
	const [finalVersus] = await db
		.insert(versus)
		.values({ tournamentId, stage: 0 })
		.returning()
	await createVersusChildren(finalVersus)

	function getVersusMaxDepth(): number {
		let depth_max = 0
		for (let i = tournament.numberOfPlayers / 2; i > 1; i /= 2) depth_max++
		return depth_max
	}

	async function createVersusChildren(parent: DB.Versus) {
		const data = {
			tournamentId: tournament.id,
			parentVersusId: parent.id,
			stage: parent.stage + 1,
		}
		const [newVersusA, newVersusB] = await db
			.insert(versus)
			.values([data, data])
			.returning()
		if (newVersusA.stage < deep) {
			await Promise.all([
				createVersusChildren(newVersusA),
				createVersusChildren(newVersusB),
			])
			return
		}
		await db.insert(matches).values([
			{
				versusId: newVersusA.id,
				player1Id: participants.pop() || 0,
				player2Id: participants.pop() || 0,
			},
			{
				versusId: newVersusB.id,
				player1Id: participants.pop() || 0,
				player2Id: participants.pop() || 0,
			},
		])
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
