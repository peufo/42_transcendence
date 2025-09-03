import {
	type CleanEffect,
	createEffect,
	createSignal,
} from '../utils/signal.js'

const $valueA = createSignal(1)
const $valueB = createSignal(1)

customElements.define(
	'ft-page-lab',
	class extends HTMLElement {
		private cleanEffect: CleanEffect
		private renderCount = 0
		private interval: NodeJS.Timeout

		connectedCallback() {
			this.cleanEffect = createEffect(() => {
				this.innerHTML = this.render()
			})
			this.interval = setInterval(() => {
				$valueA.update((v) => v + 1)
				$valueB.update((v) => v + 1)
			}, 1000)
		}

		disconnectedCallback() {
			this.cleanEffect()
			clearInterval(this.interval)
		}

		render(): string {
			this.renderCount++
			return /*html*/ `
                <h3>LABO</h3>
				<h3>RENDERING: ${this.renderCount}</h3>
                <ft-prout></ft-prout>
			`
		}
	},
)

customElements.define(
	'ft-prout',
	class extends HTMLElement {
		private renderCount = 0

		connectedCallback() {
			this.innerHTML = this.render()
		}

		disconnectedCallback() {
			console.log('DISCONNECTED')
		}

		render(): string {
			this.renderCount++
			const valueA = $valueA.get()
			const valueB = $valueB.get()

			return /*html*/ `
				<h3>CHILD</h3>
                <h3>VALUE_A: ${valueA}</h3>
                <h3>VALUE_B: ${valueB}</h3>
                <h3>RENDERING: ${this.renderCount}</h3>
			`
		}
	},
)
