export type UserBasic = {
	id: number
	name: string
	avatar: string | null
	avatarPlaceholder: string
}

export type User = UserBasic & {
	isActive: boolean
	lastLogin: string
	createdAt: string
}

export type Friend = UserBasic & {
	isActive: boolean
	lastLogin: string
	gameId?: string
}

export type Invitation = {
	id: number
	user1Id: number
	user2Id: number
	state: 'invited' | 'friend'
	createdBy: number
	createdAt: string
	user1: UserBasic
	user2: UserBasic
}

export type Match = {
	player1Id: number
	player2Id: number
	botDifficulty: string
	finishedAt: string
	player1: UserBasic
	player2: UserBasic
	player1Score: number
	player2Score: number
}

export type SessionEvent = {
	onNewFriend: { invitation: Invitation }
}
