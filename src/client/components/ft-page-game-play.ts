customElements.define(
	'ft-page-game-play',
	class extends HTMLElement {
		connectedCallback() {
			this.innerHTML = /*html*/ `
                <div class="max-w-lg m-auto">
                    <h2>TODO: a beautiful game (tournament)</h2>
                    <ul>
                        <li>Wait all players join...</li>
                    </ul>
                    <p>gameId: {{ gameId }}</p>
                </div>
			`
		}
	},
)
