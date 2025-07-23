import type { RoutesGet, RoutesPost, User } from '../lib/type.js'

type ApiOptions = Partial<{
	host: string
	sessionToken: string
	user: User
}>

export const api = useApi()

function useApi() {
	let { host, sessionToken, user }: ApiOptions = {}

	async function apiGet<Route extends keyof RoutesGet>(
		route: Route,
		query: RoutesGet[Route]['query'] = null,
	): Promise<RoutesGet[Route]['res']['data']> {
		if (!host || !sessionToken) throw new Error('Login required')
		const url = new URL(route, host)
		if (query) {
			for (const [name, value] of Object.entries(query))
				url.searchParams.append(name, value as string)
		}
		const res = await fetch(url, {
			headers: {
				Cookie: sessionToken,
			},
		})
		if (!res.ok) await handleApiError(res)
		const json = (await res.json()) as RoutesGet[Route]['res']
		return json.data
	}

	async function apiPost<Route extends keyof RoutesPost>(
		route: Route,
		body: RoutesPost[Route]['body'],
	): Promise<RoutesPost[Route]['res']> {
		if (!host || !sessionToken) throw new Error('Login required')
		const url = new URL(route, host)
		const res = await fetch(url, {
			method: 'post',
			headers: {
				Cookie: sessionToken,
				'Content-type': 'application/json',
			},
			body: JSON.stringify(body),
		})
		if (!res.ok) await handleApiError(res)
		const json = (await res.json()) as { data: RoutesPost[Route]['res'] }
		return json.data
	}

	return {
		setOptions(options: ApiOptions) {
			;({ host, sessionToken, user } = options)
		},
		user: () => user,
		get: apiGet,
		post: apiPost,
	}
}

export async function handleApiError(res: Response) {
	if (res.headers.get('content-type')?.startsWith('application/json')) {
		const json = await res.json()
		if (json.message) throw new Error(json.message)
	}
	throw new Error(`${res.status}: ${res.statusText}`)
}
