import { defineComponent } from '../utils/component.js'

defineComponent('ft-page-index', () => ({
	render: () => /*html*/ `
		<div class="max-w-md mx-auto p-4 mt-6">
			<ft-title></ft-title>
			<ft-game-selection></ft-game-selection>
		</div>
	`,
}))
