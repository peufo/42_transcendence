import type { Match, MatchBasic } from './type.ts'

export function getCurrentStage<M extends MatchBasic>(
	stages: M[][],
): M[] | undefined {
	return stages.find((stage) => !!stage.find((m) => m.state !== 'finished'))
}

export function getNextStage<M extends MatchBasic>(
	stages: M[][],
): M[] | undefined {
	let isCurrentFound = false
	return stages.find((stage) => {
		if (isCurrentFound) return true
		isCurrentFound = !!stage.find((m) => m.state !== 'finished')
		return false
	})
}

export function getAwaitingMatchFromStages(userId: number, stages: Match[][]) {
	return stages.flat().find((m) => {
		return (
			(m.player1Id === userId || m.player2Id === userId) &&
			m.state === 'awaiting'
		)
	})
}
