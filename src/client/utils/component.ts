import { type CleanEffect, createEffect } from './signal.js'

export function defineComponent(
	name: string,
	getComponent: () => {
		onLoad?:
			| ((element: HTMLElement) => void)
			| ((element: HTMLElement) => () => void)
		postRender?: (element: HTMLElement) => void | Promise<void>
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

			private effectFunction = () => {
				if (this.component.render) this.innerHTML = this.component.render()
				this.component.postRender?.(this)
			}

			constructor() {
				super()
				this.onDestroy = undefined
				this.cleanEffect = createEffect(this.effectFunction)
			}
			connectedCallback() {
				this.onDestroy = this.component.onLoad?.(this)
			}
			disconnectedCallback() {
				this.cleanEffect()
				this.component.onDestroy?.(this)
				this.onDestroy?.()
			}
			attributeChangedCallback() {
				this.effectFunction()
			}
		},
	)
}
