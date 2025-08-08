export function getVersusMaxDepth(numberOfPlayers: number): number {
	let depth_max = 0
	for (let i = numberOfPlayers / 2; i > 1; i /= 2) depth_max++
	return depth_max
}
