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

export type RoutesGet = {
	'/auth/user': User | undefined
	'/users': UserBasic[] // TODO: /users/notMyFriends
	'/friendships': Friendship[]
	'/userstats': Match[]
	'/tournaments': Tournament
}

export type RoutesPost = {
	'/auth/login': { message: string; user: User }
	'/auth/signup': { message: string; user: User }
	'/auth/logout': { success: boolean }
	'/tournaments/new': { success: boolean; tournamentId: number }
	'/friendships/new': { success: boolean; invitedUserId: number }
	'/friendships/accept': { success: boolean; acceptedUserId: number }
	'/friendships/delete': { success: boolean }
}
