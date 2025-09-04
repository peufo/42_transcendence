import { toast } from '../components/ft-toast.js'
import { setMatch } from '../utils/match.js'

customElements.define(
	'ft-page-remote-play',
	class extends HTMLElement {
		async connectedCallback() {
			this.innerHTML = await this.render()
			const button = this.querySelector('#invite')
			if (!button) return "invite button wasn't found"
			button.addEventListener('click', () => {
				console.log('test')
				navigator.clipboard.writeText(window.location.href)
				toast.success('Invitation link copied to clipboard')
			})
		}

		async render(): Promise<string> {
			const urlParams = new URLSearchParams(window.location.search)
			const matchId = urlParams.get('matchId')

			const res = await fetch('/remote/join', {
				method: 'post',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ matchId }),
			})
			if (!res.ok) return ''
			const { match } = await res.json()
			setMatch(match)
			return /*html*/ `
				<div class="grid grid-cols-4 gap-4 p-4 min-w-[1360px]">
					<div class="col-span-3">
						<ft-pong-remote></ft-pong-remote>
						<button id="invite" class="btn btn-border mt-5">Copy Invite Link</button>
					</div>
				</div>
			`
		}
	},
)
