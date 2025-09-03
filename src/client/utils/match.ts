import type { Match, MatchBasic } from '../../lib/type.js'
import { $match, $user } from './store.js'

export function getMyAwaitingMatchFromStages(stages: Match[][]) {
	const user = $user.get()
	if (!user) return undefined
	return stages.flat().find((m) => {
		return (
			(m.player1Id === user.id || m.player2Id === user.id) &&
			m.state === 'awaiting'
		)
	})
}

export function setMatch(match: MatchBasic | undefined) {
	const currentMatch = $match.get()
	if (currentMatch !== match) {
		console.log(`setting match:`)
		console.log({ currentMatch })
		console.log({ match })
		$match.set(match)
	}
}
