import {
	type CleanEffect,
	createEffect,
	createSignal,
} from '../utils/signal.js'

type ToastType = 'info' | 'success' | 'error'
type ToastOption = {
	type: ToastType
	title: string
	content?: string
}

const [getToast, setToast] = createSignal<ToastOption | null>(null)

const useToast = (type: ToastType) => (title: string, content?: string) =>
	setToast({ type, title, content })

export const toast = {
	info: useToast('info'),
	success: useToast('success'),
	error: useToast('error'),
}

const TOAST_CLASSES: Record<ToastType, string[]> = {
	info: ['border-gray-200', 'bg-white'],
	success: ['border-green-800', 'bg-green-50'],
	error: ['border-red-800', 'bg-red-50'],
}
const TOAST_CLASSES_ALL = Object.values(TOAST_CLASSES).flat()
const TOAST_HIDE = 'translate-y-[calc(100%+8px)]'
const TOAST_DURATION = 4000

customElements.define(
	'ft-toast',
	class extends HTMLElement {
		timeoutId: NodeJS.Timeout | null = null
		cleanEffet: CleanEffect
		constructor() {
			super()
			this.classList.add('fixed', 'bottom-2', 'right-2')
			this.classList.add('flex', 'items-center', 'w-full', 'max-w-xs', 'p-4')
			this.classList.add('text-sm', 'text-gray-700')
			this.classList.add('rounded-lg', 'shadow-sm', 'border')
			this.classList.add(TOAST_HIDE)
			setTimeout(() => this.classList.add('transition-transform'), 0)
			this.cleanEffet = createEffect(() => {
				const toast = getToast()
				if (!toast) {
					this.innerHTML = ''
					return
				}
				this.classList.remove(...TOAST_CLASSES_ALL)
				this.classList.add(...TOAST_CLASSES[toast.type])
				this.classList.remove(TOAST_HIDE)
				if (this.timeoutId) clearTimeout(this.timeoutId)
				this.timeoutId = setTimeout(() => {
					this.classList.add(TOAST_HIDE)
					this.timeoutId = null
				}, TOAST_DURATION)
				let html = /*html*/ `
                    <h4 class="font-semibold text-gray-900">${toast.title}</h4>
                `
				if (toast.content) {
					html += /*html*/ `<p>${toast.content}</p>`
				}
				this.innerHTML = /*html*/ `<div>${html}</div>`
			})
		}

		disconnectedCallback() {
			if (this.timeoutId) clearTimeout(this.timeoutId)
			this.cleanEffet()
		}
	},
)
