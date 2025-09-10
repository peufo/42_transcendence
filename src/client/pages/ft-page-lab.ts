import { defineComponent } from '../utils/component.js'
import { createSignal } from '../utils/signal.js'

const $valueA = createSignal(1)
const $valueB = createSignal(1)

defineComponent('ft-page-lab', () => {
	let renderCount = 0
	const labStores = { $valueA, $valueB }
	const buttons = Object.entries(labStores).map(([key, value]) => {
		const btn = document.createElement('button')
		btn.addEventListener('click', () => {
			console.clear()
			value.update((v) => v + 1)
		})
		btn.classList.add('btn', 'btn-border')
		btn.innerHTML = key
		return btn
	})

	return {
		postRender(element) {
			console.log('LABO CONNECTED')
			element.prepend(...buttons)
		},
		onDestroy() {
			console.log('LABO DISCONNECTED')
		},
		render() {
			console.log('LABO RENDER')
			renderCount++
			return /*html*/ `
					<h3>LABO</h3>
					<h3>RENDERING: ${renderCount}</h3>
					<ft-prout></ft-prout>
				`
		},
	}
})

defineComponent('ft-prout', () => {
	let renderCount = 0

	return {
		onLoad() {
			console.log('PROUT CONNECTED')
		},
		onDestroy() {
			console.log('PROUT DISCONNECTED')
		},
		render() {
			console.log('PROUT RENDER')
			renderCount++
			console.log('PROUT GET VALUE_A')
			const valueA = $valueA.get()
			console.log('PROUT GET VALUE_B')
			const valueB = $valueB.get()

			return /*html*/ `
				<h3>PROUT</h3>
				<h3>VALUE_A: ${valueA}</h3>
                <h3>VALUE_B: ${valueB}</h3>
                <h3>RENDERING: ${renderCount}</h3>
				<ft-pipi></ft-pipi>
			`
		},
	}
})

defineComponent('ft-pipi', () => {
	let renderCount = 0

	return {
		onLoad() {
			console.log('PIPI CONNECTED')
		},
		onDestroy() {
			console.log('PIPI DISCONNECTED')
		},
		render() {
			console.log('PIPI RENDER')
			renderCount++
			console.log('PIPI GET VALUE_A')
			const valueA = $valueA.get()
			console.log('PIPI GET VALUE_B')
			const valueB = $valueB.get()

			return /*html*/ `
				<h3>PIPI</h3>
                <h3>VALUE_A: ${valueA}</h3>
                <h3>VALUE_B: ${valueB}</h3>
                <h3>RENDERING: ${renderCount}</h3>
			`
		},
	}
})
