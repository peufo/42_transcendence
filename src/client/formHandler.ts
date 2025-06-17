import { goto } from './goto.js'
import { transitionIn, slide, transitionOut } from './transition.js'

async function handleFormSubmit(event: SubmitEvent) {
	event.preventDefault()
	const form = event.target as HTMLFormElement
	const res = await fetch(form.action, {
		method: form.method,
		headers: {
			'Content-Type': form.enctype,
		},
		body: getFormBody(),
	})

	if (!res.ok) {
		const json = await res.json()
		parseErrorMessage(json.message)
		return
	}

	if (res.redirected) goto(res.url)
	parseErrorMessage()

	function getFormBody(): string | FormData {
		const formData = new FormData(form)
		if (form.enctype === 'multipart/formdata') {
			return formData
		}
		const urlEncoded = new URLSearchParams()
		for (const [key, value] of formData) {
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

	async function setError(input: HTMLInputElement, error?: string) {
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

		div = document.createElement('div')
		div.classList.add('badge', 'badge-red', 'w-max', 'my-1')
		div.textContent = error
		div.parentElement
		input.parentElement?.appendChild(div)
		transitionIn(div, slide, 250)
	}
}

window.handleFormSubmit = handleFormSubmit
