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
	gameId?: string
}

export type FriendShip = {
	id: number
	user1Id: number
	user2Id: number
	state: 'invited' | 'friend'
	createdBy: number
	createdAt: Date
	user1: UserBasic
	user2: UserBasic
}

export type Match = {
	player1Id: number
	player2Id: number
	botDifficulty: string
	finishedAt: Date
	player1: UserBasic
	player2: UserBasic
	player1Score: number
	player2Score: number
}

export type SessionEvent = {
	onInvitationCreated: { friendship: FriendShip }
	onInvitationAccepted: { newFriend: Friend }
	onInvitationCancel: { friendshipId: number }
}
