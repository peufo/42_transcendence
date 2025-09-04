import type { Match } from '../../lib/type.js'
import { $match } from './store.js'

export function setMatch(match: Match | undefined) {
	const currentMatch = $match.get()
	if (currentMatch !== match) {
		$match.set(match)
	}
}
