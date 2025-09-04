import type { Match } from '../../lib/type.js'
import { $match } from './store.js'

export function setMatch(match: Match | undefined) {
	const currentMatch = $match.get()
	if (currentMatch !== match) {
		console.log(`setting match:`)
		console.log({ currentMatch })
		console.log({ match })
		$match.set(match)
	}
}
