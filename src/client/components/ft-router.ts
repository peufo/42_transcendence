import { api } from '../api.js'
import { createEffect, createSignal } from '../utils/signal.js'
import { slide, transitionIn, transitionOut } from '../utils/transition.js'
import './ft-page-404.js'
import './ft-page-index.js'
import './ft-page-login.js'
import './ft-page-stats.js'
import './ft-page-account.js'
import './ft-page-local-new.js'
import './ft-page-local-play.js'
import './ft-page-game-new.js'
import './ft-page-game-play.js'
import './ft-page-local-play-babylon.js'
import {
	API_POST,
	type ApiPostOption,
	PAGES,
	type PageOption,
	type RouteApiGet,
	type RouteApiPost,
	type RoutePage,
} from '../routes.js'

const [getUrl, setUrl] = createSignal<URL>(new URL(document.location.href))

function goto(url: URL) {
	window.history.pushState({}, '', url)
	setUrl(url)
}

customElements.define(
	'ft-router',
	class extends HTMLElement {
		connectedCallback() {
			document.addEventListener('submit', onSubmitForm)
			document.addEventListener('click', onClickLink)
			window.addEventListener('popstate', onPopState)
			createEffect(async () => {
				this.innerHTML = await this.render()
			})
		}

		async render(): Promise<string> {
			const url = getUrl()
			const { component, routesApi } = this.getPage(url.pathname)

			// TODO: A beautiful loader ?
			await Promise.all(routesApi.map((route) => api.get(route)))
			return /*html*/ `
				<${component}></${component}>
			`
		}

		getPage(pathname: string): { component: string; routesApi: RouteApiGet[] } {
			const routePage = pathname as RoutePage
			if (!PAGES[routePage]) {
				return { component: 'ft-page-404', routesApi: [] }
			}
			const { component, pageData = [] } = PAGES[routePage] as PageOption
			const callsApi: RouteApiGet[] = [...pageData]
			for (const [path, options] of Object.entries(PAGES)) {
				if ('layoutData' in options && pathname.startsWith(path)) {
					callsApi.push(...options.layoutData)
				}
			}
			return { component, routesApi: callsApi }
		}
	},
)

function onPopState() {
	setUrl(new URL(document.location.href))
}

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
	if (form.method === 'get') {
		// TODO: use action instead
		// const apikey = form.dataset.api as RouteApiGet
		// if (!apikey)
		// 	throw new Error(
		// 		`Attribute data-api="resource" is needed in form element when method="get"`,
		// 	)
		// if (!api[apikey])
		// 	throw new Error(
		// 		`form data-api="${apikey}" does not exist in client/api.ts`,
		// 	)
		// return api[apikey](getFormQuery(new FormData(form)))
		return
	}

	const res = await fetch(form.action, {
		method: form.method,
		headers: {
			'Content-Type': form.enctype,
		},
		body: getFormBody(),
	})

	if (res.status === 401) {
		const submitButton = form.querySelector<HTMLElement>('button[type=submit]')
		if (submitButton) {
			setError(submitButton, 'Unauthorized')
		}
		parseErrorMessage()
		return
	}
	if (!res.ok) {
		const json = await res.json()
		parseErrorMessage(json.message)
		return
	}
	const json = await res.json()
	parseErrorMessage()
	const route = new URL(form.action).pathname
	const options = API_POST[route as RouteApiPost] as ApiPostOption
	if (!options) {
		console.log('TODO: comportement par défaut')
		return
	}
	options.onSuccess?.(json.data)
	if (options.redirect) {
		return goto(new URL(options.redirect, document.location.origin))
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

	function parseErrorMessage(msg = '') {
		const inputs = form.querySelectorAll('input')
		const errors: Record<string, string> = {}
		for (const [, name, error] of msg.matchAll(/body\/(\w+) ([^,]+)/g)) {
			errors[name] = error
		}
		for (const input of inputs) {
			setError(input, errors[input.name])
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
