import { setUser, setUsers } from './utils/store.js'

function useApiGetter<Result>(
	route: string,
	setter: (value: Result) => void,
): (query?: string) => Promise<void> {
	return async (query) => {
		const url = query ? `${route}?${query}` : route
		const res = await fetch(url)
		if (!res.ok) {
			console.warn('TODO: handle fetch failed... Notifiy ?')
			return
		}
		const json = (await res.json()) as { data: Result }
		setter(json.data)
	}
}

export const api = {
	user: useApiGetter('/auth/user', setUser),
	users: useApiGetter('/users', setUsers),
} as const
