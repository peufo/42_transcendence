import type {
	FriendshipFriend,
	FriendshipInvitation,
	Match,
	MatchBasic,
	Tournament,
	TournamentWithLookup,
	UserBasic,
	UserStats,
	UserWithTournament,
} from '../../lib/type.js'
import { createSignal } from './signal.js'

export const $url = createSignal<URL>(new URL(document.location.href)) // ft-router
export const $user = createSignal<UserWithTournament | undefined>(undefined) // ft-router
export const $users = createSignal<UserBasic[]>([]) // ft-users
export const $friendshipsFriend = createSignal<FriendshipFriend[]>([]) // ft-friends
export const $friendshipsInvitation = createSignal<FriendshipInvitation[]>([]) // ft-invitations
export const $matches = createSignal<Match[]>([]) // ft-stats, ft-goal-distribution, ft-match-history
export const $rankedUsers = createSignal<UserStats[]>([]) // ft-stats, ft-ranking
export const $tournament = createSignal<
	(Tournament & { createdByUser: UserBasic }) | undefined
>(undefined) // ft-page-tournament-play
export const $participants = createSignal<TournamentWithLookup['participants']>(
	[],
) // ft-page-tournament-open
export const $stages = createSignal<TournamentWithLookup['stages']>([]) // ft-bracket
export const $match = createSignal<MatchBasic | undefined>(undefined)
export const $oauth2 = createSignal<Response | undefined>(undefined)
