import type {
	FriendshipFriend,
	FriendshipInvitation,
	Match,
	TournamentWithLookup,
	User,
	UserBasic,
	UserStats,
} from '../../lib/type.js'
import { createSignal } from './signal.js'

export const $url = createSignal<URL>(new URL(document.location.href))
export const $user = createSignal<User | undefined>(undefined)
export const $users = createSignal<UserBasic[]>([])
export const $friendshipsFriend = createSignal<FriendshipFriend[]>([])
export const $friendshipsInvitation = createSignal<FriendshipInvitation[]>([])
export const $matches = createSignal<Match[]>([])
export const $rankedUsers = createSignal<UserStats[]>([])
export const $tournament = createSignal<TournamentWithLookup | undefined>(
	undefined,
)
