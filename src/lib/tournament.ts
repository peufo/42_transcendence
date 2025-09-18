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

export function getCurrentMatchFromStages(userId: number, stages: Match[][]) {
	const stagesArray = stages.flat()
	const ongoing = stagesArray.find(
		(m) =>
			(m.player1Id === userId || m.player2Id === userId) &&
			m.state === 'ongoing',
	)
	if (ongoing) return ongoing
	return stagesArray.find(
		(m) =>
			(m.player1Id === userId || m.player2Id === userId) &&
			m.state === 'awaiting',
	)
}
