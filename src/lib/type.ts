import type { Engine, EngineEventData, Move, Player } from './engine/index.js'

export type UserBasic = {
	id: number
	name: string
	hasAvatar: boolean
	avatarPlaceholder: string
}

export type User = UserBasic & {
	isActive: boolean
	lastLogin: Date
	createdAt: Date
	numberOfMatches: number
	numberOfWin: number
	numberOfGoals: number
	isOAuth2: boolean
}

export type UserWithTournament = User & {
	tournament: Tournament | null
}

export type UserStats = UserBasic & {
	numberOfMatches: number
	numberOfWin: number
	numberOfGoals: number
}

export type Friend = UserBasic & {
	isActive: boolean
	lastLogin: Date
	tournament: Tournament | null
}

type FriendshipBase = {
	id: number
	createdBy: number
	createdAt: Date
}

export type FriendshipFriend = FriendshipBase & {
	state: 'friend'
	withUser: Friend
}
export type FriendshipInvitation = FriendshipBase & {
	state: 'invited'
	withUser: UserBasic
}

export type Friendship = FriendshipFriend | FriendshipInvitation

export type Round = {
	scorer: 'p1' | 'p2'
	rallyCount: number
	ballPositionY: number
}

export type MatchBasic = {
	id: number
	state: 'awaiting' | 'ongoing' | 'finished'
	player1Id: number | null
	player2Id: number | null
	player1Score: number
	player2Score: number
	finishedAt: Date | null
	tournamentId: number | null
}

export type Match = MatchBasic & {
	player1: UserBasic | null
	player2: UserBasic | null
	rounds: Round[]
}

export type Tournament = {
	id: number
	createdAt: Date
	state: 'open' | 'ongoing' | 'finished'
	createdBy: number
	numberOfPlayers: number
}

export type TournamentWithLookup = Tournament & {
	stages: Match[][]
	createdByUser: UserBasic
	participants: { user: UserBasic }[]
}

// ◦ ────────────────────────────── ◦
// │        Sockets events          │
// ◦ ────────────────────────────── ◦

export type SocketChannels = {
	friendships: {
		query: null
		clientEvents: null
		serverEvents: {
			onCreated: { friendship: FriendshipInvitation }
			onAccepted: { friendship: FriendshipFriend }
			onDeleted: { friendshipId: number }
			onTournamentJoin: { tournament: Tournament; userId: number }
			onTournamentQuit: { userId: number }
			onFriendOnline: { userId: number }
			onFriendOffline: { userId: number }
		}
	}
	tournaments: {
		query: { tournamentId: string }
		clientEvents: null
		serverEvents: {
			onParticipantJoin: { user: UserBasic }
			onParticipantQuit: { user: UserBasic }
			onStart: { stages: Match[][] }
			onMatchChange: { match: MatchBasic }
			onEnd: null
		}
	}
	matches: {
		query: { matchId: string }
		clientEvents: {
			onPlayerInput: {
				player: Player
				move: Move
				value: boolean
			}
		}
		serverEvents: {
			onEngineEvent: EngineEventData
			onSurrender: MatchBasic
		}
		serverPayload: {
			engine: Engine
			player1Ready: boolean
			player2Ready: boolean
		}
	}
}

// ◦ ────────────────────────────── ◦
// │            Routes              │
// ◦ ────────────────────────────── ◦

type Get<Result, Query = null> = {
	query: Query
	res: { data: Result }
}

export type RoutesGet = {
	'/auth/user': Get<UserWithTournament | undefined>
	'/users': Get<UserBasic[], { search: string }> // TODO: /users/notMyFriends
	'/friendships/invitation': Get<FriendshipInvitation[]>
	'/friendships/friend': Get<FriendshipFriend[]>
	'/tournaments': Get<TournamentWithLookup, { tournamentId: number }>
	'/stats/me': Get<Match[]>
	'/stats/all': Get<UserStats[]>
	'/auth/oauth/google': Get<Response>
}

export type RoutesPost = {
	'/auth/login': {
		body: { name: string; password: string }
		res: { message: string; user: User }
	}
	'/auth/signup': {
		body: { name: string; password: string; avatarPlaceholder: string }
		res: { message: string; user: User }
	}
	'/auth/logout': {
		body: null
		res: { success: boolean }
	}
	'/friendships/new': {
		body: { invitedUserId: number }
		res: { success: boolean; invitedUserId: number }
	}
	'/friendships/accept': {
		body: { friendshipId: number }
		res: { success: boolean; acceptedUserId: number }
	}
	'/friendships/delete': {
		body: { friendshipId: number }
		res: { success: boolean }
	}
	'/tournaments/new': {
		body: { numberOfPlayers: number }
		res: { success: boolean; tournamentId: number }
	}
	'/tournaments/delete': {
		body: { tournamentId: number }
		res: { success: boolean; message: string }
	}
	'/tournaments/join': {
		body: { tournamentId: number }
		res: { success: boolean; tournamentId: number }
	}
	'/tournaments/quit': {
		body: { tournamentId: number }
		res: { success: boolean }
	}
	'/users/update': {
		body: { name?: string; password?: string }
		res: { message: string; success: boolean; user: User }
	}
	'/users/update/avatar': {
		body: null
		res: { message: string; success: boolean }
	}
}
