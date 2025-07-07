import {
	setFriends,
	setInvitations,
	setMatches,
	setUser,
	setUsers,
} from './utils/store.js'

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
		console.log(json.data)
		setter(json.data)
	}
}

export const api: Record<string, (query?: string) => Promise<void>> = {
	user: useApiGetter('/auth/user', setUser),
	users: useApiGetter('/users', setUsers),
	friends: useApiGetter('/users/friends', setFriends),
	invitations: useApiGetter('/invitations', setInvitations),
	matches: useApiGetter('/stats', setMatches),
} as const
