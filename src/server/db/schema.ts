import { relations, sql } from 'drizzle-orm'
import {
	blob,
	check,
	int,
	sqliteTable,
	text,
	unique,
} from 'drizzle-orm/sqlite-core'

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
	friends: many(friendships),
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

export const friendships = sqliteTable(
	'friendships',
	{
		id: int().primaryKey({ autoIncrement: true }),
		user1Id: int()
			.notNull()
			.references(() => users.id),
		user2Id: int()
			.notNull()
			.references(() => users.id),
		state: text({ enum: ['invited', 'friend'] }).default('invited'),
		createdBy: int()
			.notNull()
			.references(() => users.id),
		createdAt: int({ mode: 'timestamp' }).notNull().default(new Date()),
	},
	(table) => [
		unique().on(table.user1Id, table.user2Id),
		check('user1Id_lower_user2Id', sql`${table.user2Id} > ${table.user1Id}`),
		check(
			'creator_is_in_relations',
			sql`${table.createdBy} = ${table.user1Id} OR ${table.createdBy} = ${table.user2Id}`,
		),
	],
)

export const friendshipsRelations = relations(friendships, ({ one }) => ({
	user1: one(users, {
		fields: [friendships.user1Id],
		references: [users.id],
	}),
	user2: one(users, {
		fields: [friendships.user2Id],
		references: [users.id],
	}),
}))

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

export const tournaments = sqliteTable('tournaments', {
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
export const tournamentsParticipants = sqliteTable('tournaments_participants', {
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

export const rounds = sqliteTable('rounds', {
	id: int().primaryKey({ autoIncrement: true }),
	player1Score: int().default(0),
	player2Score: int().default(0),
	matchId: int().references(() => matches.id),
	gamestates: text('', { mode: 'json' }),
	arenaSettings: text('', { mode: 'json' }),
})
