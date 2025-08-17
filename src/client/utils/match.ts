import type { Match } from '../../lib/type.js'
import { $matchId, $user } from './store.js'

export function getMyMatch(stages: Match[][]) {
	const user = $user.get()
	if (!user) return undefined
	return stages.flat().find((m) => {
		return (
			(m.player1Id === user.id || m.player2Id === user.id) &&
			m.state === 'awaiting'
		)
	})
}

export function setMatchId(matchId: number) {
	const currentMatchId = $matchId.get()
	if (currentMatchId !== matchId) {
		$matchId.set(matchId)
		return true
	}
	return false
}
