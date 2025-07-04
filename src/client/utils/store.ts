import { createSignal } from './signal.js'
import type { User, UserBasic, Friend, Invitation } from '../../lib/type.js'

export const [getUser, setUser] = createSignal<User | undefined>(undefined)
export const [getUsers, setUsers] = createSignal<UserBasic[]>([])
export const [getFriends, setFriends] = createSignal<Friend[]>([])
export const [getInvitations, setInvitations] = createSignal<Invitation[]>([])
