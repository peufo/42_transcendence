import type { Match } from '../../lib/type.js'
import { $match } from './store.js'

export function setMatch(match: Match | undefined) {
	const currentMatch = $match.get()
	if (!currentMatch || currentMatch.id !== match?.id) {
		$match.set(match)
	}
}
