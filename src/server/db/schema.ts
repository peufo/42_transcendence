import { relations } from 'drizzle-orm'
import { blob, int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
	id: int().primaryKey({ autoIncrement: true }),
	name: text().notNull().unique(),
	passwordHash: text().notNull(),
	avatar: text(),
	avatarPlaceholder: text().notNull(),
	createdAt: int({ mode: 'timestamp' }).notNull().default(new Date()),
	lastLogin: int({ mode: 'timestamp' }).notNull().default(new Date()),
	isActive: int({ mode: 'boolean' }).notNull().default(false),
})

export const usersRelations = relations(users, ({ many }) => ({
	friends: many(friendShips),
	tournaments: many(tournamentsParticipants),
}))

export const sessions = sqliteTable('sessions', {
	id: text().primaryKey(),
	userId: int()
		.notNull()
		.references(() => users.id),
	secretHash: blob({ mode: 'buffer' }).notNull().$type<Uint8Array>(),
	lastVerifiedAt: int({ mode: 'timestamp' }).notNull(),
	createdAt: int({ mode: 'timestamp' }).notNull(),
})

export const friendShips = sqliteTable('userRelation', {
	user1Id: int()
		.notNull()
		.references(() => users.id),
	user2Id: int()
		.notNull()
		.references(() => users.id),
	state: text({ enum: ['invited', 'friend'] }),
})

export const matches = sqliteTable('matches', {
	id: int().primaryKey({ autoIncrement: true }),
	player1Id: int()
		.notNull()
		.references(() => users.id),
	player2Id: int().references(() => users.id),
	botDifficulty: text({ enum: ['Baby', 'Kevin', 'Terminator'] })
		.notNull()
		.default('Kevin'),
	finished: int({ mode: 'boolean' }).notNull().default(false),
	pointsToWin: int().notNull(),
})

export const matchesRelations = relations(matches, ({ one }) => ({
	versus: one(versus),
}))

export const tournaments = sqliteTable('tournament', {
	id: int().primaryKey({ autoIncrement: true }),
	numberOfPlayers: int().notNull(),
	pointsToWin: int().notNull(),
	botDifficulty: text({ enum: ['Baby', 'Kevin', 'Terminator'] })
		.notNull()
		.default('Kevin'),
	lobbyLocked: int({ mode: 'boolean' }).notNull().default(false),
	createdAt: int({ mode: 'timestamp' }).notNull(),
	startedAt: int({ mode: 'timestamp' }).notNull(),
	finished: int({ mode: 'boolean' }).default(false),
})

// TODO: add relation type ? owner, etc..
export const tournamentsParticipants = sqliteTable('tournamentsParticipants', {
	tournamentId: int()
		.notNull()
		.references(() => tournaments.id),
	userId: int()
		.notNull()
		.references(() => users.id),
})

export const tournamentRelations = relations(tournaments, ({ many }) => ({
	users: many(tournamentsParticipants),
}))

export const versus = sqliteTable('versus', {
	id: int().primaryKey({ autoIncrement: true }),
	matchId: int()
		.unique()
		.notNull()
		.references(() => matches.id),
	tournamentId: int()
		.unique()
		.notNull()
		.references(() => tournaments.id),
	player1Id: int()
		.notNull()
		.unique()
		.references(() => users.id),
	player2Id: int()
		.notNull()
		.unique()
		.references(() => users.id),
	stage: int().notNull(),
})

export const versusRelations = relations(versus, ({ one }) => ({
	tournament: one(tournaments),
	match: one(matches),
}))

export const round = sqliteTable('round', {
	id: int().primaryKey({ autoIncrement: true }),
	player1Score: int().default(0),
	player2Score: int().default(0),
	matchId: int().references(() => matches.id),
	gamestates: text('', { mode: 'json' }),
	arenaSettings: text('', { mode: 'json' }),
})
