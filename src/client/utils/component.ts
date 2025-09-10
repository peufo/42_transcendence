import { type CleanEffect, createEffect } from './signal.js'

export function defineComponent(
	name: string,
	getComponent: () => {
		onLoad?: (element: HTMLElement) => void
		postRender?: (element: HTMLElement) => void
		onDestroy?: (element: HTMLElement) => void
		render?: () => string
	},
) {
	customElements.define(
		name,
		class extends HTMLElement {
			private cleanEffect: CleanEffect
			private component = getComponent()

			connectedCallback() {
				this.component.onLoad?.(this)
				this.cleanEffect = createEffect(() => {
					if (this.component.render) this.innerHTML = this.component.render()
					this.component.postRender?.(this)
				})
			}
			disconnectedCallback() {
				this.cleanEffect()
				this.component.onDestroy?.(this)
			}
		},
	)
}
