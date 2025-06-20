import { createSignal } from './signal.js'

export type User = {
	id: number
	name: string
	avatar: string | null
	avatarPlaceholder: string
}

export const [getUser, setUser] = createSignal<User | undefined>(undefined)
