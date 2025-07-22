import type { Friendship, User } from '../lib/type.js'

type ApiOptions = Partial<{
	host: string
	sessionToken: string
	user: User
}>

export const api = useApi()

function useApi() {
	let { host, sessionToken, user }: ApiOptions = {}

	function useApiGetter<Result>(
		route: string,
	): (query?: string) => Promise<Result> {
		return async (query) => {
			if (!host || !sessionToken) throw new Error('Login required')
			const url = host + (query ? `${route}?${query}` : route)
			const res = await fetch(url, {
				headers: {
					Cookie: sessionToken,
				},
			})
			if (!res.ok) await handleApiError(res)
			const json = (await res.json()) as { data: Result }
			return json.data
		}
	}
	function useApiPost<Body>(route: string): (body: Body) => Promise<void> {
		return async (body) => {
			if (!host || !sessionToken) throw new Error('Login required')
			const url = host + route
			const res = await fetch(url, {
				method: 'post',
				headers: {
					Cookie: sessionToken,
					'Content-type': 'application/json',
				},
				body: JSON.stringify(body),
			})
			if (!res.ok) await handleApiError(res)
			return
		}
	}

	return {
		setOptions(options: ApiOptions) {
			;({ host, sessionToken, user } = options)
		},
		user: () => user,
		friendships: useApiGetter<Friendship[]>('/friendships'),
		friendshipsAccept: useApiPost<{ friendshipId: number }>(
			'/friendships/accept',
		),
		friendshipsDelete: useApiPost<{ friendshipId: number }>(
			'/friendships/delete',
		),
	}
}

export async function handleApiError(res: Response) {
	if (res.headers.get('content-type')?.startsWith('application/json')) {
		const json = await res.json()
		if (json.message) throw new Error(json.message)
	}
	throw new Error(`${res.status}: ${res.statusText}`)
}
