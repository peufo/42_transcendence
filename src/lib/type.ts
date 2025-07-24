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
}

export type Friend = UserBasic & {
	isActive: boolean
	lastLogin: Date
	gameId?: string // TODO: add gameId
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

export type SessionEvent = {
	onFriendshipCreated: { friendship: Friendship }
	onFriendshipAccepted: { friendship: Friendship }
	onFriendshipDeleted: { friendshipId: number }
}

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
	createdByUser: UserBasic
	participants: { user: UserBasic }[]
	numberOfPlayers: number
}

type Get<Result, Query = null> = {
	query: Query
	res: { data: Result }
}

export type RoutesGet = {
	'/auth/user': Get<User | undefined>
	'/users': Get<UserBasic[], { search: string }> // TODO: /users/notMyFriends
	'/friendships': Get<Friendship[]>
	'/userstats': Get<Match[]>
	'/tournaments': Get<Tournament, { id: number }>
}

export type RoutesPost = {
	'/auth/login': {
		body: { name: string; password: string }
		res: { message: string; user: User }
	}
	'/auth/signup': {
		body: { name: string; password: string }
		res: { message: string; user: User }
	}
	'/auth/logout': {
		body: null
		res: { success: boolean }
	}
	'/tournaments/new': {
		body: { numberOfPlayers: number }
		res: { success: boolean; tournamentId: number }
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
	'/users/update': {
    	body: { name?: string; password?: string }
    	res: { success: boolean; user: User }
  	}
}
