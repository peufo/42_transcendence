import { type CleanEffect, createEffect } from './signal.js'

export function defineComponent(
	name: string,
	getComponent: () => {
		onMount?: (element: HTMLElement) => void
		onRender?: (element: HTMLElement) => void
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
				this.component.onMount?.(this)
				this.cleanEffect = createEffect(() => {
					if (this.component.render) {
						this.innerHTML = this.component.render()
					}
					this.component.onRender?.(this)
				})
			}
			disconnectedCallback() {
				this.cleanEffect()
				this.component.onDestroy?.(this)
			}
		},
	)
}
