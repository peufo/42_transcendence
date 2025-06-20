customElements.define(
	'ft-page-game-new',
	class extends HTMLElement {
		connectedCallback() {
			this.innerHTML = /*html*/ `
				<div class="max-w-lg m-auto">
                    <h2>TODO: form setting tournament</h2>
                    <ul>
                        <li>Players number</li>
                        <li>Game duration</li>
                        <li>Public / Friends</li>
                    </ul>
                    <a href="/game/play?gameId=1243" class="btn btn-border">
                        Play
                    </a>
                </div>
			`
		}
	},
)
