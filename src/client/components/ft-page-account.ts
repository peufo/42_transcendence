customElements.define(
	'ft-page-account',
	class extends HTMLElement {
		connectedCallback() {
			this.innerHTML = /*html*/ `
				<h2>Acount pageTODO:</h2>
                <ul>
                    <li>Update username</li>
                    <li>Update avatar</li>
                </ul>
			`
		}
	},
)
