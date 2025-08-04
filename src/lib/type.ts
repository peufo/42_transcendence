export type UserBasic = {
	id: number
	name: string
	avatar: string | null
	avatarPlaceholder: string
}

export type User = UserBasic & {
	isActive: boolean
	lastLogin: Date
	createdAt: Date
	numberOfMatches: number
	numberOfWin: number
	numberOfGoals: number
}

export type UserStats = UserBasic & {
	numberOfMatches: number
	numberOfWin: number
	numberOfGoals: number
}

export type Friend = UserBasic & {
	isActive: boolean
	lastLogin: Date
	tournaments: Tournament[]
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

export type Match = {
	player1Id: number
	player2Id: number
	finishedAt: Date | null
	player1: UserBasic
	player2: UserBasic
	player1Score: number | null
	player2Score: number | null
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
			onTournamentCreated: { tournament: Tournament }
			onTournamentDeleted: { tournament: Tournament }
			onFriendOnline: { userId: number }
			onFriendOffline: { userId: number }
		}
	}
	tournaments: {
		query: { tournamentId: string }
		clientEvents: null
		serverEvents: {
			onDeleted: null
			onParticipantJoin: { user: UserBasic }
			onParticipantQuit: { user: UserBasic }
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
	'/auth/user': Get<User | undefined>
	'/users': Get<UserBasic[], { search: string }> // TODO: /users/notMyFriends
	'/friendships/invitation': Get<FriendshipInvitation[]>
	'/friendships/friend': Get<FriendshipFriend[]>
	'/userstats': Get<Match[]>
	'/allusersstats': Get<UserStats[]>
	'/tournaments': Get<TournamentWithLookup, { tournamentId: number }>
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
		res: { success: boolean; tournamentId: number }
	}
	'/users/update': {
		body: { name?: string; password?: string }
		res: { success: boolean; message: string; user: User }
	}
}
