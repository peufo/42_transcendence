import type { Friendship, Match, User, UserBasic } from '../../lib/type.js'
import { createSignal } from './signal.js'

export const [getUser, setUser] = createSignal<User | undefined>(undefined)
export const [getUsers, setUsers] = createSignal<UserBasic[]>([])
export const [getFriendships, setFriendships, updateFriendships] = createSignal<
	Friendship[]
>([])
export const [getMatches, setMatches] = createSignal<Match[]>([])
