import { setUser } from './utils/store.js'

function useApiGetter<Result>(
	route: string,
	setter: (value: Result) => void,
): () => Promise<void> {
	return async () => {
		const res = await fetch(route)
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
}
