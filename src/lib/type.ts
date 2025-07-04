export type UserBasic = {
	id: number
	name: string
	avatar?: string
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

export type Invitation = UserBasic & {
	createdBy: number
	createdAt: string
	friendshipId: number
}
