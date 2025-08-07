import type { WebSocket } from 'ws'
import { getUserBasic } from '../friendships/model.js'
import { tournamentJoin, tournamentQuit } from '../tournaments/model.js'
import { notify, notifyFriends } from './controller.js'

const userTournamentSocketsMap = new Map<number, Set<WebSocket>>()

export async function useUserTournamentSocket(
	userId: number,
	tournamentId: number,
	socket: WebSocket,
) {
	let socketsSet = userTournamentSocketsMap.get(userId)
	if (!socketsSet) {
		const tournament = await tournamentJoin(tournamentId, userId)
		const user = await getUserBasic(userId)
		notify.tournaments(tournamentId, 'onParticipantJoin', { user })
		await notifyFriends(userId, 'onTournamentJoin', { tournament, userId })
		socketsSet = new Set<WebSocket>()
		userTournamentSocketsMap.set(userId, socketsSet)
	}

	socket.addEventListener('close', async () => {
		socketsSet.delete(socket)
		if (!socketsSet.size) {
			userTournamentSocketsMap.delete(userId)
			await tournamentQuit(tournamentId, userId)
			const user = await getUserBasic(userId)
			notify.tournaments(tournamentId, 'onParticipantQuit', { user })
			await notifyFriends(userId, 'onTournamentQuit', { userId })
		}
	})
}
