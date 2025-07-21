import type {
	Friendship,
	Match,
	Tournament,
	User,
	UserBasic,
} from '../../lib/type.js'
import { createSignal } from './signal.js'

export const $user = createSignal<User | undefined>(undefined)
export const $users = createSignal<UserBasic[]>([])
export const $friendships = createSignal<Friendship[]>([])
export const $matches = createSignal<Match[]>([])
export const $tournament = createSignal<Tournament | undefined>(undefined)
