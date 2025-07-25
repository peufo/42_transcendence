import { createSignal } from './signal.js'

export type UserBasic = {
	id: number
	name: string
	avatar?: string
	avatarPlaceholder: string
}

export type User = UserBasic & {
	isActive: boolean
	lastLogin: string
	createdAt: string
}

export type Friend = UserBasic & {
	isActive: boolean
	lastLogin: string
	gameId?: string
}

export type Invitation = UserBasic & {
	createdBy: number
	createdAt: string
	friendshipId: number
}

export const [getUser, setUser] = createSignal<User | undefined>(undefined)
export const [getUsers, setUsers] = createSignal<UserBasic[]>([])
export const [getFriends, setFriends] = createSignal<Friend[]>([])
export const [getInvitations, setInvitations] = createSignal<Invitation[]>([])
