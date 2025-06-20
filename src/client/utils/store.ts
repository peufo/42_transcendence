import { createSignal } from './signal.js'

export type User = {
	id: number
	name: string
	avatar?: string
	avatarPlaceholder: string
}

export type Friend = User & {
	isOnline: boolean
	gameId?: string
}

export const [getUser, setUser] = createSignal<User | undefined>(undefined)
