import { exit } from 'node:process'
import * as p from '@clack/prompts'
import { api } from './api.js'
import type { Scope } from './main.js'
import { menuMain } from './menuMain.js'

// let ownedTournamentId: number | null = null

export const menuNewTournament: Scope = async () => {
	const numberOfPlayers = await p.select({
		message: 'Number of player',
		options: [2, 4, 8, 16].map((nb) => ({ label: nb.toString(), value: nb })),
	})
	if (p.isCancel(numberOfPlayers)) exit(0)
	const { tournamentId } = await api.post('/tournaments/new', {
		numberOfPlayers,
	})

	p.log.success('Tournament created')
	// ownedTournamentId = tournamentId
	return await createMenuTounament(tournamentId)
}

export async function createMenuTounament(id: number): Promise<Scope> {
	const tournament = await api.get('/tournaments', { id })
	return async () => {
		const spinner = p.spinner()
		const waitingMessage = () =>
			`waiting for your friends (${tournament.participants.length} / ${tournament.numberOfPlayers})`
		spinner.start(waitingMessage())
		// TODO: wait on users and start tournament

		await p.select({
			message: 'Start tournament ?',
			options: [{ label: "Yes, I'm ready", value: menuMain }],
		})

		return menuMain
	}
}
