import { defineComponent } from '../utils/component.js'

defineComponent('ft-page-tournament-new', () => {
	let selectedValue = 4
	const stagesByPlayers: Record<number, string[]> = {
		2: ['Final'],
		4: ['Semifinals', 'Final'],
		8: ['Quarterfinals', 'Semifinals', 'Final'],
		16: ['Eighthfinals', 'Quarterfinals', 'Semifinals', 'Final'],
	}
	const defaultsScoresToWin: Record<string, number> = {
		Final: 7,
		Semifinals: 5,
		Quarterfinals: 3,
		Eighthfinals: 2,
	}

	return {
		render() {
			const nbPlayersOptions = [2, 4, 8, 16]
				.map(
					(nb) => /*html*/ `
                        <li class="w-full border-b border-gray-200 sm:border-b-0 sm:border-r">
                            <div class="flex items-center ps-3">
                            <input id="opt-${nb}" type="radio"
                                ${nb === selectedValue ? 'checked' : ''}
                                value="${nb}" name="numberOfPlayers"
                                class="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300">
                            <label for="opt-${nb}" class="w-full py-3 ms-2 text-gray-900">${nb}</label>
                            </div>
                        </li>
                    `,
				)
				.join('')

			return /*html*/ `
				<div class="max-w-md mx-auto p-4 mt-6">
					<ft-title>Tournament settings</ft-title>

					<form action="/tournaments/new" method="post" class="flex flex-col gap-6 card p-5 space-y-6">
						<fieldset>
							<legend class="my-2 font-bold">Player count</legend>
							<ul class="items-center w-full text-md font-medium text-gray-900 bg-white border border-gray-200 rounded-lg sm:flex">
								${nbPlayersOptions}
							</ul>
						</fieldset>
						<input type="hidden" name="pointsToWin" id="points-to-win-json">
						<div id="points-to-win-container"></div>
						<button type="submit" class="btn btn-primary w-full">
						Create tournament
						</button>
					</form>
					
                </div>
            `
		},
		postRender(element) {
			const hiddenInput = element.querySelector<HTMLInputElement>(
				'#points-to-win-json',
			)
			const updateHidden = () => {
				const obj: Record<string, number> = {}
				element
					.querySelectorAll<HTMLInputElement>("input[id^='points-to-win-']")
					.forEach((el) => {
						if (el.id === 'points-to-win-json') return
						const match = el.id.match(/^points-to-win-(.+)$/)
						if (match) obj[match[1]] = Number(el.value)
					})
				if (hiddenInput) hiddenInput.value = JSON.stringify(obj)
			}

			const renderSliders = (playerCount: number) => {
				const container = element.querySelector('#points-to-win-container')
				container?.classList.add('grid', 'grid-col-2')
				if (!container) return
				container.innerHTML =
					/* html */ `
                    <div class="font-bold col-span-2">Points to win</div>
                    ` +
					stagesByPlayers[playerCount]
						.map(
							(round) => /*html*/ `
                                <label class= "flex flex-row justify-center items-center" for="points-to-win-${round.toLowerCase()}">${round}</label>
								<div class="flex flex-row justify-center items-center">
									<input
										type="range"
										id="points-to-win-${round.toLowerCase()}"
										min="1" max="10" value="${defaultsScoresToWin[round]}"
										class="text-center">
									<span class="h-auto w-15 text-center" id="points-to-win-${round.toLowerCase()}-info">${defaultsScoresToWin[round]}</span>
								</div>
                            `,
						)
						.join('')

				updateHidden()
				stagesByPlayers[playerCount].forEach((round) => {
					const id = `points-to-win-${round.toLowerCase()}`
					const slider = element.querySelector<HTMLInputElement>(`#${id}`)
					const info = element.querySelector<HTMLSpanElement>(`#${id}-info`)
					if (slider && info) {
						slider.addEventListener('input', () => {
							updateHidden()
							info.textContent = slider.value
						})
					}
				})
			}

			renderSliders(selectedValue)

			element
				.querySelectorAll<HTMLInputElement>('input[name="numberOfPlayers"]')
				.forEach((input) => {
					input.addEventListener('change', (e) => {
						selectedValue = parseInt((e.target as HTMLInputElement).value, 10)
						renderSliders(selectedValue)
					})
				})
		},
	}
})
