customElements.define(
	'ft-page-local-play',
	class extends HTMLElement {
		connectedCallback() {
			this.innerHTML = /*html*/ `
                <h2>TODO: a beautiful pong (local)</h2>
                <p>Versus: {{ playerA }} vs {{ playerB }}</p>
                <p>or</p>
                <p>Bot: {{ bot }}</p>

                <canvas>
                    GAME
                </canvas>
			`
		}
	},
)
