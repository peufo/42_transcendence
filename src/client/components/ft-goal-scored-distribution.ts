import { ARENA_HEIGHT } from '../../lib/engine/index.js'
import type { Match, UserBasic } from '../../lib/type.js'
import { createEffect } from '../utils/signal.js'
import { $matches, $user } from '../utils/store.js'

customElements.define(
	'ft-goal-scored-distribution',
	class extends HTMLElement {
		private user = $user.get()

		connectedCallback() {
			this.classList.add(
				'flex',
				'flex-col',
				'flex-wrap',
				'items-center',
				'justify-around',
				'gap-3',
				'rounded-xl',
				'p-5',
			)
			createEffect(() => {
				this.innerHTML = this.renderContent()
			})
		}
		renderContent(): string {
			if (!this.user) return ''
			const matches = $matches.get()
			if (matches.length === 0) {
				const html = /*html*/ `
					<h2 class="flex flex-row p-2 items-center justify-center gap-2 font-bold">Best scoring zones</h2>
					<div class="flex pl-4 p-2 items-center justify-around gap-2">
					Not enough matches to calculate statistics.
					</div>
				`
				return html
			}
			const goalTScoredY = getGoalScoredY(matches, this.user)
			const distributionPercentage = convertToPercentage(goalTScoredY)
			const html = /*html*/ `
				<h2 class="flex flex-row p-2 items-center justify-center gap-2 font-bold">
					Best scoring zones
					<div class="relative group inline-block">
						<ft-icon name="message-circle-question" class="mb-3"></ft-icon>
						<div class="absolute left-1/2 top-full transform -translate-x-1/2 p-4 border border-gray-400 rounded-2xl bg-white shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300 z-12 h-auto w-100">
							This graph displays the zones where you scored the most goals. The more blue a zone is, the more you generally score there.
						</div>
					</div>
				</h2>
				<div class="flex flex-row w-max items-center justify-center pr-1 gap-4 border-black border-r-2 border-b-2 border-t-2">
					<div class="w-5 h-50 rounded-4xl"></div>
					${drawRectangle(distributionPercentage, 'scored')}
				</div>
			`
			return html
		}
	},
)

function getGoalScoredY(matches: Match[], user: UserBasic): number[] {
	const goalScoredY: number[] = []
	for (const match of matches) {
		for (const round of match.rounds) {
			if (
				(match.player1Id === user.id && round.scorer === 'p1') ||
				(match.player2Id === user.id && round.scorer === 'p2')
			)
				goalScoredY.push(round.ballPositionY)
		}
	}
	return goalScoredY
}

function convertToPercentage(goalTakenY: number[]): number[] {
	const distribution: number[] = []
	let correctedDistribution: number[] = []
	for (let i = 0; i < 100; i++) distribution.push(0)
	for (const value of goalTakenY)
		distribution[Math.round((value * 100) / ARENA_HEIGHT)]++
	correctedDistribution = distribution.map((e) => (e * 100) / goalTakenY.length)
	return correctedDistribution
}

function drawRectangle(values: number[], mode: string): string {
	let html = '<div class="flex flex-col items-center">'
	const maxValue = Math.max(...values)
	const targetColors = {
		conceded: { r: 187, g: 77, b: 0 },
		scored: { r: 67, g: 45, b: 215 },
	}
	for (const value of values) {
		let r: number, g: number, b: number
		const factor = value / maxValue
		if (mode === 'conceded') {
			r = Math.floor(255 + factor * (targetColors.conceded.r - 255))
			g = Math.floor(255 + factor * (targetColors.conceded.g - 255))
			b = Math.floor(255 + factor * (targetColors.conceded.b - 255))
		} else {
			r = Math.floor(255 + factor * (targetColors.scored.r - 255))
			g = Math.floor(255 + factor * (targetColors.scored.g - 255))
			b = Math.floor(255 + factor * (targetColors.scored.b - 255))
		}
		html += /*html*/ `
		<div class="w-1 h-1 rounded-full" style="background-color:rgb(${r}, ${g}, ${b})"></div>
		`
	}
	html += '</div>'
	return html
}
