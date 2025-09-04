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
		private labStores = { $valueA, $valueB }

		connectedCallback() {
			console.log('LABO CONNECTED')
			this.cleanEffect = createEffect(() => {
				this.innerHTML = this.render()
			})
			const buttons = Object.entries(this.labStores).map(([key, value]) => {
				const btn = document.createElement('button')
				btn.addEventListener('click', () => {
					console.clear()
					value.update((v) => v + 1)
				})
				btn.classList.add('btn', 'btn-border')
				btn.innerHTML = key
				return btn
			})
			this.prepend(...buttons)
		}

		disconnectedCallback() {
			console.log('LABO DISCONNECTED')
			this.cleanEffect()
		}

		render(): string {
			console.log('LABO RENDER')
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
			console.log('PROUT CONNECTED')
			this.cleanEffect = createEffect(() => {
				this.innerHTML = this.render()
			})
		}

		disconnectedCallback() {
			console.log('PROUT DISCONNECTED')
			this.cleanEffect()
		}

		render(): string {
			console.log('PROUT RENDER')
			this.renderCount++
			console.log('PROUT GET VALUE_A')
			const valueA = $valueA.get()
			console.log('PROUT GET VALUE_B')
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
		private instanceId = Math.random().toFixed(3)

		connectedCallback() {
			console.log(`PIPI CONNECTED`, this.instanceId)
			this.cleanEffect = createEffect(() => {
				this.innerHTML = this.render()
			})
		}

		disconnectedCallback() {
			console.log('PIPI DISCONNECTED', this.instanceId)
			this.cleanEffect()
		}

		render(): string {
			console.log('PIPI RENDER', this.instanceId)
			this.renderCount++
			console.log('PIPI GET VALUE_A')
			const valueA = $valueA.get()
			console.log('PIPI GET VALUE_B')
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
