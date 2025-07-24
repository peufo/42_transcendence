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
	const { participants, numberOfPlayers } = await api.get('/tournaments', {
		id,
	})
	return async () => {
		const spinner = p.spinner()
		const waitingMessage = () =>
			`waiting for your friends (${participants.length} / ${numberOfPlayers})`
		spinner.start(waitingMessage())
		// TODO: wait on users and start tournament

		const action = await p.select({
			message: `${api.host()}/tournament?id=${id}`,
			options: [
				{
					label: 'Start tournament',
					value: () => {
						if (participants.length < numberOfPlayers) {
							spinner.stop('Tournament incomplet', 1)
							return createMenuTounament(id)
						}
						return menuMatch
					},
				},
				{
					label: 'Cancel tournament',
					value: () => {
						spinner.stop('Tournament canceled', 1)
						return menuMain
					},
				},
			],
		})
		if (p.isCancel(action)) exit(0)
		return action()
	}
}

const menuMatch: Scope = async () => {
	const isReady = await p.confirm({ message: 'Ready ?' })
	if (p.isCancel(isReady)) exit(0)
	p.log.warn('TODO: enter in the game')
	return menuMain
}
