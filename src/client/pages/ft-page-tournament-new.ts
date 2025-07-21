customElements.define(
	'ft-page-tournament-new',
	class extends HTMLElement {
		connectedCallback() {
			const nbPlayersOptions = [2, 4, 8, 16]
				.map(
					(nb) => /*html*/ `
                        <li class="w-full border-b border-gray-200 sm:border-b-0 sm:border-r">
                            <div class="flex items-center ps-3">
                                <input id="opt-${nb}" type="radio" ${nb === 4 ? 'checked' : ''} value="${nb}" name="numberOfPlayers" class="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300">
                                <label for="opt-${nb}" class="w-full py-3 ms-2 text-gray-900">${nb}</label>
                            </div>
                        </li>
                    `,
				)
				.join('')

			this.innerHTML = /*html*/ `
                <div class="sm:mx-auto sm:w-full sm:max-w-sm">
                    <h2 class="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">Tournament settings</h2>
                </div>
				<div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form action="/tournament/new" method="post" class="space-y-6">
                        <fieldset>
                            <legend class="my-2">Player count</legend>
                            <ul class="items-center w-full text-md font-medium text-gray-900 bg-white border border-gray-200 rounded-lg sm:flex">
                                ${nbPlayersOptions}
                            </ul>
                        </fieldset>
                        <button type="submit" class="btn btn-primary w-full">
                            Create tournament
                        </button>
                    </form>
                </div>
			`
		}
	},
)
