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
		private cleanEffect: CleanEffect

		connectedCallback() {
			this.cleanEffect = createEffect(() => {
				this.innerHTML = this.render()
			})
		}

		disconnectedCallback() {
			console.log('DISCONNECTED')
			this.cleanEffect()
		}

		render(): string {
			console.log('PROUT')
			this.renderCount++
			const valueA = $valueA.get()
			const valueB = $valueB.get()

			return /*html*/ `
				<h3>PROUT</h3>
				<h3>VALUE_A: ${valueA}</h3>
                <h3>VALUE_B: ${valueB}</h3>
                <h3>RENDERING: ${this.renderCount}</h3>
				<ft-pipi></ft-pipi>
			`
		}
	},
)

customElements.define(
	'ft-pipi',
	class extends HTMLElement {
		private cleanEffect: CleanEffect
		private renderCount = 0

		connectedCallback() {
			this.cleanEffect = createEffect(() => {
				this.innerHTML = this.render()
			})
		}

		disconnectedCallback() {
			console.log('DISCONNECTED')
			this.cleanEffect()
		}

		render(): string {
			console.log('PIPI')
			this.renderCount++
			const valueA = $valueA.get()
			const valueB = $valueB.get()

			return /*html*/ `
				<h3>PIPI</h3>
                <h3>VALUE_A: ${valueA}</h3>
                <h3>VALUE_B: ${valueB}</h3>
                <h3>RENDERING: ${this.renderCount}</h3>
			`
		}
	},
)
