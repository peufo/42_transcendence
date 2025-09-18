import { type CleanEffect, createEffect } from './signal.js'

export function defineComponent(
	name: string,
	getComponent: () => {
		onLoad?:
			| ((element: HTMLElement) => void)
			| ((element: HTMLElement) => () => void)
		postRender?: (element: HTMLElement) => void
		onDestroy?: (element: HTMLElement) => void
		render?: () => string
	},
	...props: string[]
) {
	customElements.define(
		name,
		class extends HTMLElement {
			static observedAttributes = props

			private cleanEffect: CleanEffect
			private component = getComponent()
			private onDestroy: ReturnType<Required<typeof this.component>['onLoad']>

			constructor() {
				super()
				this.onDestroy = undefined
				this.cleanEffect = createEffect(() => {
					if (this.component.render) this.innerHTML = this.component.render()
					this.component.postRender?.(this)
				})
			}
			connectedCallback() {
				this.onDestroy = this.component.onLoad?.(this)
			}
			disconnectedCallback() {
				this.cleanEffect()
				this.component.onDestroy?.(this)
				this.onDestroy?.()
			}
		},
	)
}
