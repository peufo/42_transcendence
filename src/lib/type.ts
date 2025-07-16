import { StringifyOptions } from 'querystring'

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

export type Match = {
	player1Id: number
	player2Id: number
	botDifficulty: string
	finishedAt: string
	player1: UserBasic
	player2: UserBasic
}
