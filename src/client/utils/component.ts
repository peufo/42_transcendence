import { type CleanEffect, createEffect } from '../../lib/signal.js'

export function defineComponent(
	name: string,
	getComponent: () => {
		onLoad?:
			| ((element: HTMLElement) => void)
			| ((element: HTMLElement) => () => void)
		postRender?: (element: HTMLElement) => void | Promise<void>
		onDestroy?: (element: HTMLElement) => void
		render?: (element: HTMLElement) => string
	},
	...props: string[]
) {
	customElements.define(
		name,
		class extends HTMLElement {
			static observedAttributes = props

			private cleanEffect: CleanEffect | undefined
			private component = getComponent()
			private onDestroy:
				| ReturnType<Required<typeof this.component>['onLoad']>
				| undefined

			private effectFunction = () => {
				if (this.component.render) this.innerHTML = this.component.render(this)
				this.component.postRender?.(this)
			}

			connectedCallback() {
				this.onDestroy = this.component.onLoad?.(this)
				this.cleanEffect = createEffect(this.effectFunction)
			}
			disconnectedCallback() {
				this.cleanEffect?.()
				this.component.onDestroy?.(this)
				this.onDestroy?.()
			}
			attributeChangedCallback() {
				this.effectFunction()
			}
		},
	)
}
