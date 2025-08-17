import type {
	FriendshipFriend,
	FriendshipInvitation,
	Match,
	Tournament,
	TournamentWithLookup,
	UserBasic,
	UserStats,
	UserWithTournament,
} from '../../lib/type.js'
import { createSignal } from './signal.js'

export const $url = createSignal<URL>(new URL(document.location.href))
export const $user = createSignal<UserWithTournament | undefined>(undefined)
export const $users = createSignal<UserBasic[]>([])
export const $friendshipsFriend = createSignal<FriendshipFriend[]>([])
export const $friendshipsInvitation = createSignal<FriendshipInvitation[]>([])
export const $matches = createSignal<Match[]>([])
export const $rankedUsers = createSignal<UserStats[]>([])
export const $tournament = createSignal<
	(Tournament & { createdByUser: UserBasic }) | undefined
>(undefined)
export const $participants = createSignal<TournamentWithLookup['participants']>(
	[],
)
export const $stages = createSignal<TournamentWithLookup['stages']>([])
export const $matchId = createSignal<number>(-1)
