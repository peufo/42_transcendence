import { createSignal, type Signal } from '../../lib/signal.js'
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

export const $url = createSignal<URL>(new URL(document.location.href))
export const $user = createSignal<UserWithTournament | undefined>(undefined)
export const $users = createSignal<UserBasic[]>([])
export const $friendshipsFriend = createSignal<FriendshipFriend[]>([])
export const $friendshipsInvitation = createSignal<FriendshipInvitation[]>([])
export const $matches = createSignal<Match[]>([])
export const $rankedUsers = createSignal<UserStats[]>([])
export const $tournament = createSignal<
	(Tournament & { createdByUser: UserBasic; stages: number[][] }) | undefined
>(undefined)
export const $participants = createSignal<TournamentWithLookup['participants']>(
	[],
)

// export const $match = createSignal<Match | undefined>(undefined)
export const $matchId = createSignal<number | undefined>(undefined)
export const $matchState = createSignal<Match['state'] | undefined>(undefined)
export const matchMap = new Map<number, Signal<Match>>()

export const $myRenderer = createSignal<'2D' | '3D'>(
	(window.localStorage.getItem('rendering') ?? '2D') as '2D' | '3D',
)
