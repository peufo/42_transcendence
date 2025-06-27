import { Many, relations } from 'drizzle-orm'
import { boolean } from 'drizzle-orm/gel-core'
import { mysqlEnum } from 'drizzle-orm/mysql-core'
import { blob, int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
	id: int().primaryKey({ autoIncrement: true }),
	name: text().notNull().unique(),
	passwordHash: text().notNull(),
	avatar: text(),
	avatarPlaceholder: text().notNull(),
	createdAt: int({ mode: 'timestamp' }).notNull().default(new Date()),
	lastLogin: int({ mode: 'timestamp' }).notNull().default(new Date()),
	isActive: boolean().notNull().default(false),
	userStatid: int().unique(),
})

export const usersRelations = relations(users, ({ many }) => ({
	friends: many(users),
}))

export const sessions = sqliteTable('sessions', {
	id: int().primaryKey({ autoIncrement: true }),
	userId: int()
		.notNull()
		.references(() => users.id),
	secretHash: blob({ mode: 'buffer' }).notNull().$type<Uint8Array>(),
	lastVerifiedAt: int({ mode: 'timestamp' }).notNull(),
	createdAt: int({ mode: 'timestamp' }).notNull(),
})

export const match = sqliteTable('match', {
	id: int().primaryKey({ autoIncrement: true }),
	player1Id: int()
		.notNull()
		.references(() => users.id()),
	player2Id: int().references(() => users.id()),
	botDifficulty: mysqlEnum(['Baby', 'Kevin', 'Terminator']).default('Kevin'),
	finished: boolean().notNull().default(false),
	pointsToWin: int().notNull(),
})

export const matchRelations = relations(match, ({ one }) => ({
	pointsToWin: one(versus, {
		fields: [match.pointsToWin],
		references: [versus.id],
	}),
}))

export const tournament = sqliteTable('tournament', {
	id: int().primaryKey({ autoIncrement: true }),
	numberOfPlayers: int().notNull(),
	pointsToWin: int().notNull(),
	botDifficulty: mysqlEnum(['Baby', 'Kevin', 'Terminator'])
		.notNull()
		.default('Kevin'),
	lobbyLocked: boolean().notNull().default(false),
	createdAt: int({ mode: 'timestamp' }).notNull(),
	startedAt: int({ mode: 'timestamp' }).notNull(),
	finished: boolean().default(false),
})

export const tournamentRelations = relations(tournament, ({ many }) => ({
	playersId: many(users),
}))

export const versus = sqliteTable('versus', {
	id: int().primaryKey({ autoIncrement: true }),
	matchId: int()
		.unique()
		.notNull()
		.references(() => match.id()),
	pointsToWin: int().notNull(),
	tournamentId: int()
		.unique()
		.notNull()
		.references(() => tournament.id()),
	player1Id: int()
		.notNull()
		.unique()
		.references(() => users.id()),
	player2Id: int()
		.notNull()
		.unique()
		.references(() => users.id()),
	stage: int().notNull(),
})

export const versusRelations = relations(versus, ({ one }) => ({
	pointsToWin: one(tournament, {
		fields: [versus.pointsToWin],
		references: [tournament.id],
	}),
}))

export const round = sqliteTable('round', {
	id: int().primaryKey({ autoIncrement: true }),
	player1Score: int().default(0),
	player2Score: int().default(0),
	matchId: int().references(() => match.id()),
	//Need to add gamestats
	//Need to add arenaSettings
})
