import { api } from '../api.js'
import {
	type CleanEffect,
	createEffect,
	createSignal,
} from '../utils/signal.js'
import { slide, transitionIn, transitionOut } from '../utils/transition.js'
import './ft-page-404.js'
import './ft-page-index.js'
import './ft-page-me.js'
import './ft-page-login.js'
import './ft-page-signup.js'
import './ft-page-stats.js'
import './ft-page-account.js'
import './ft-page-local-new.js'
import './ft-page-local-play.js'
import './ft-page-game-new.js'
import './ft-page-game-play.js'
import './ft-page-local-play-babylon.js'
import {
	API_GET,
	API_POST,
	type ApiPostOption,
	PAGES,
	type PageOption,
	type RouteApiGet,
	type RouteApiPost,
	type RoutePage,
} from '../routes.js'
import { getUser } from '../utils/store.js'
import { toast } from './ft-toast.js'

const [getUrl, setUrl] = createSignal<URL>(new URL(document.location.href))

function goto(url: URL) {
	window.history.pushState({}, '', url)
	setUrl(url)
}

function onPopState() {
	setUrl(new URL(document.location.href))
}

customElements.define(
	'ft-router',
	class extends HTMLElement {
		private cleanEffect: CleanEffect

		connectedCallback() {
			document.addEventListener('submit', onSubmitForm)
			document.addEventListener('click', onClickLink)
			window.addEventListener('popstate', onPopState)
			this.cleanEffect = createEffect(async () => {
				const url = getUrl()
				const page = this.getPage(url.pathname)
				if (page.layoutData) {
					await Promise.all(page.layoutData.map((route) => api.get(route)))
				}
				const user = getUser()
				if (!page.isPublic && !user) {
					return goto(
						new URL(`/login?redirectTo=${url.pathname}`, document.baseURI),
					)
				}
				if (page.isPublic === 'only' && user) {
					return goto(new URL(`/me`, document.baseURI))
				}
				if (page.pageData) {
					await Promise.all(page.pageData.map((route) => api.get(route)))
				}
				this.innerHTML = /*html*/ `
					<${page.component}></${page.component}>
				`
			})
		}

		disconnectedCallback() {
			this.cleanEffect()
		}

		getPage(pathname: string): PageOption {
			const routePage = pathname as RoutePage
			if (!PAGES[routePage]) {
				return { component: 'ft-page-404', isPublic: true }
			}
			const page = PAGES[routePage] as PageOption
			const layoutData: RouteApiGet[] = []
			for (const [path, options] of Object.entries(PAGES)) {
				if ('layoutData' in options && pathname.startsWith(path)) {
					layoutData.push(...options.layoutData)
				}
			}
			return { ...page, layoutData }
		}
	},
)

function findAnchor(eventTarget: EventTarget | null): HTMLAnchorElement | null {
	let el: HTMLElement | null = eventTarget as HTMLElement
	while (el && el !== document.body) {
		if (el.nodeName.toUpperCase() === 'A' && el.hasAttribute('href')) {
			return el as HTMLAnchorElement
		}
		el = el.parentElement
	}
	return null
}

function onClickLink(event: MouseEvent) {
	if (event.button) return
	if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
	if (event.defaultPrevented) return

	const a = findAnchor(event.target)
	if (!a) {
		return
	}
	const url = new URL(a.href, document.baseURI)
	event.preventDefault()
	goto(url)
}

async function onSubmitForm(event: SubmitEvent) {
	event.preventDefault()
	const form = event.target as HTMLFormElement
	const route = new URL(form.action).pathname
	const options = API_POST[route as RouteApiPost] as ApiPostOption
	if (form.method === 'get') {
		if (!(route in API_GET)) throw new Error(`route "${route}" not exist`)
		return api.get(route as RouteApiGet, getFormQuery(new FormData(form)))
	}

	if (options.validation) {
		const errors = options.validation(form)
		if (errors) {
			setErrors(errors)
			return
		}
	}

	const res = await fetch(form.action, {
		method: form.method,
		headers: {
			'Content-Type': form.enctype,
		},
		body: getFormBody(),
	})

	const json = await res.json()
	if (!res.ok) {
		parseErrorMessage(json.message)
		return
	}
	clearErrors()
	setErrorSubmit()

	if ('message' in json) toast.success(json.message)

	if (!options) {
		console.log('TODO: comportement par défaut')
		return
	}

	options.onSuccess?.(json)
	if (options.redirectTo) {
		const pathname = options.redirectTo()
		return goto(new URL(pathname, document.location.origin))
	}
	if (options.invalidate) {
		for (const apiRoute of options.invalidate) {
			api.get(apiRoute)
		}
	}

	function getFormBody(): string | FormData {
		const formData = new FormData(form)
		if (form.enctype === 'multipart/formdata') {
			return formData
		}
		return getFormQuery(formData)
	}

	function getFormQuery(formData: FormData): string {
		const urlEncoded = new URLSearchParams()
		for (const [key, value] of formData.entries()) {
			if (typeof value === 'object')
				throw new Error('Please, set enctype="multipart/formdata"')
			urlEncoded.append(key, value)
		}
		return urlEncoded.toString()
	}

	function parseErrorMessage(msg: string) {
		const isFieldsError = msg.startsWith('body/')
		if (msg && !isFieldsError) {
			clearErrors()
			setErrorSubmit(msg)
			return
		}
		setErrorSubmit()
		const errors: Record<string, string> = {}
		if (msg) {
			for (const [, name, error] of msg.matchAll(/body\/(\w+) ([^,]+)/g)) {
				errors[name] = error
			}
		}
		setErrors(errors)
	}

	function setErrors(errors: Record<string, string>) {
		const inputs = form.querySelectorAll('input')
		for (const input of inputs) {
			setError(input, errors[input.name])
		}
	}
	function clearErrors() {
		const inputs = form.querySelectorAll('input')
		for (const input of inputs) {
			setError(input, '')
		}
	}

	function setErrorSubmit(error = '') {
		const submitButton = form.querySelector<HTMLElement>('button[type=submit]')
		if (submitButton) {
			setError(submitButton, error)
		}
	}

	async function setError(input: HTMLElement, error?: string) {
		let div = input.parentElement?.querySelector(
			'div.badge-red',
		) as HTMLDivElement | null

		if (!error) {
			if (div) {
				await transitionOut(div, slide, 250)
				div.remove()
			}
			return
		}

		if (div) {
			div.textContent = error
			div.classList.add('animate-shakeX')
			setTimeout(() => div?.classList.remove('animate-shakeX'), 600)
			return
		}
		// TODO use a Component instead
		div = document.createElement('div')
		div.classList.add('badge', 'badge-red', 'w-max', 'my-1')
		div.textContent = error
		input.parentElement?.appendChild(div)
		transitionIn(div, slide, 250)
	}
}
