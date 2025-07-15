import { type ApiKey, api } from '../api.js'
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

type PageOption = {
	component: string
	pageData?: ApiKey[]
	layoutData?: ApiKey[]
}

const PAGES: Record<string, PageOption> = {
	'/': {
		component: 'ft-page-index',
		layoutData: ['user'],
		pageData: ['friends', 'invitations'],
	},
	'/login': { component: 'ft-page-login' },
	'/stats': { component: 'ft-page-stats', pageData: ['matches'] },
	'/account': { component: 'ft-page-account' },
	'/local/new': { component: 'ft-page-local-new' },
	'/local/play': { component: 'ft-page-local-play' },
	'/game/new': { component: 'ft-page-game-new' },
	'/game/play': { component: 'ft-page-game-play' },
	'/local/play/babylon': { component: 'ft-page-local-play-babylon' },
} as const

const [getUrl, setUrl] = createSignal<URL>(new URL(document.location.href))

function apiCallAll() {
	for (const callApi of Object.values(api)) {
		callApi()
	}
}

function goto(url: URL, invalidateAll = false) {
	window.history.pushState({}, '', url)
	setUrl(url)
	if (invalidateAll) {
		// TODO More granularity ? More generic ?
		apiCallAll()
	}
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
			const { component, callsApi } = this.getPage(url.pathname)

			// TODO: A beautiful loader ?
			await Promise.all(callsApi.map((call) => api[call]()))
			return /*html*/ `
				<${component}></${component}>
			`
		}

		getPage(pathname: string): { component: string; callsApi: ApiKey[] } {
			if (!PAGES[pathname]) {
				return { component: 'ft-page-404', callsApi: [] }
			}
			const { component, pageData = [] } = PAGES[pathname]
			const callsApi: ApiKey[] = [...pageData]
			for (const [path, { layoutData = [] }] of Object.entries(PAGES)) {
				if (pathname.startsWith(path)) {
					callsApi.push(...layoutData)
				}
			}
			return { component, callsApi }
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

export async function onSubmitForm(event: SubmitEvent) {
	event.preventDefault()
	const form = event.target as HTMLFormElement
	if (form.method === 'get') {
		const apikey = form.dataset.api as ApiKey
		if (!apikey)
			throw new Error(
				`Attribute data-api="resource" is needed in form element when method="get"`,
			)
		if (!api[apikey])
			throw new Error(
				`form data-api="${apikey}" does not exist in client/api.ts`,
			)
		return api[apikey](getFormQuery(new FormData(form)))
	}

	const res = await fetch(form.action, {
		method: form.method,
		headers: {
			'Content-Type': form.enctype,
		},
		body: getFormBody(),
	})

	if (!res.ok) {
		if (res.status === 401) {
			const submitButton = form.querySelector<HTMLElement>(
				'button[type=submit]',
			)
			if (submitButton) {
				setError(submitButton, 'Unauthorized')
			}
			parseErrorMessage()
			return
		}
		const json = await res.json()
		parseErrorMessage(json.message)
		return
	}

	if (res.redirected) {
		return goto(new URL(res.url), true)
	}
	const json = await res.json()
	console.log('TODO: type and handle standard response', json)
	if (json.redirectTo) {
		return goto(new URL(json.redirectTo, document.location.origin), true)
	}
	parseErrorMessage()
	apiCallAll()

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
