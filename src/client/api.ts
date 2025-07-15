import { toast } from './components/ft-toast.js'
import {
	setFriends,
	setInvitations,
	setMatches,
	setUser,
	setUsers,
} from './utils/store.js'

type ApiGetter<Result = unknown> = (query?: string) => Promise<Result | null>

function useApiGetter<Result>(
	route: string,
	setter: (value: Result) => void,
): ApiGetter<Result> {
	return async (query) => {
		const url = query ? `${route}?${query}` : route
		const res = await fetch(url)
		if (!res.ok) {
			toast.error(`Error ${res.status} in "${route}"`, res.statusText)
			return null
		}
		const json = (await res.json()) as { data: Result }
		setter(json.data)
		return json.data
	}
}

export const api = {
	user: useApiGetter('/auth/user', setUser),
	users: useApiGetter('/users', setUsers),
	friends: useApiGetter('/users/friends', setFriends),
	invitations: useApiGetter('/invitations', setInvitations),
	matches: useApiGetter('/userstats', setMatches),
} satisfies Record<string, ApiGetter>

export type ApiKey = keyof typeof api
