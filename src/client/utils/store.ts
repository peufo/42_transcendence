import type {
	Friend,
	FriendShip,
	Match,
	User,
	UserBasic,
} from '../../lib/type.js'
import { createSignal } from './signal.js'

export const [getUser, setUser] = createSignal<User | undefined>(undefined)
export const [getUsers, setUsers] = createSignal<UserBasic[]>([])
export const [getFriends, setFriends, updateFriends] = createSignal<Friend[]>(
	[],
)
export const [getInvitations, setInvitations, updateInvitations] = createSignal<
	FriendShip[]
>([])
export const [getMatches, setMatches] = createSignal<Match[]>([])
