import { createSignal } from './signal.js'

export type User = {
	id: number
	name: string
	isActive: boolean
	avatar?: string
	avatarPlaceholder: string
}

export type Friend = User & {
	isOnline: boolean
	gameId?: string
}

export const [getUser, setUser] = createSignal<User | undefined>(undefined)
export const [getUsers, setUsers] = createSignal<User[]>([])
