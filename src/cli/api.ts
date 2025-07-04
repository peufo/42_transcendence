import type { Friend } from '../lib/type.js'

export function useApi(host: string, sessionToken: string) {
	function useApiGetter<Result>(
		route: string,
	): (query?: string) => Promise<Result> {
		return async (query) => {
			const url = host + (query ? `${route}?${query}` : route)
			const res = await fetch(url, {
				headers: {
					Cookie: sessionToken,
				},
			})
			if (!res.ok) {
				throw new Error(`Failed to fetch ${url}`)
			}
			const json = (await res.json()) as { data: Result }
			return json.data
		}
	}

	return {
		friends: useApiGetter<Friend[]>('/users/friends'),
	}
}
