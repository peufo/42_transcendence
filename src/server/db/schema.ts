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
	numberOfGoals: int().notNull().default(0),
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
		state: text({ enum: ['invited', 'friend'] })
			.default('invited')
			.notNull(),
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
	player2Id: int()
		.notNull()
		.references(() => users.id),
	player1Score: int().default(0),
	player2Score: int().default(0),
	finishedAt: int({ mode: 'timestamp' }),
	pointsToWin: int().notNull(),
})

export const matchesRelations = relations(matches, ({ one, many }) => ({
	versus: one(versus),
	player1: one(users, { fields: [matches.player1Id], references: [users.id] }),
	player2: one(users, { fields: [matches.player2Id], references: [users.id] }),
	rounds: many(rounds),
}))

export const tournaments = sqliteTable('tournaments', {
	id: int().primaryKey({ autoIncrement: true }),
	numberOfPlayers: int().notNull(),
	state: text({ enum: ['open', 'ongoing', 'finished'] })
		.notNull()
		.default('open'),
	createdAt: int({ mode: 'timestamp' }).notNull().default(new Date()),
	createdBy: int()
		.notNull()
		.references(() => users.id),
})

// TODO: add relation type ? owner, etc..
export const tournamentsParticipants = sqliteTable(
	'tournaments_participants',
	{
		// state: text({ enum: ['waiting', 'inGame'] }),
		tournamentId: int()
			.notNull()
			.references(() => tournaments.id),
		userId: int()
			.notNull()
			.references(() => users.id),
	},
	(table) => [unique().on(table.tournamentId, table.userId)],
)

export const tournamentRelations = relations(tournaments, ({ many, one }) => ({
	createdByUser: one(users, {
		fields: [tournaments.createdBy],
		references: [users.id],
	}),
	participants: many(tournamentsParticipants),
}))

export const tournamentsParticipantsRelations = relations(
	tournamentsParticipants,
	({ one }) => ({
		user: one(users, {
			fields: [tournamentsParticipants.userId],
			references: [users.id],
		}),
		tournament: one(tournaments, {
			fields: [tournamentsParticipants.tournamentId],
			references: [tournaments.id],
		}),
	}),
)

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
	scorer: text({ enum: ['p1', 'p2'] }),
	rallyCount: int().notNull(),
	ballPositionY: int().notNull(),
	matchId: int().references(() => matches.id),
	gamestates: text('', { mode: 'json' }),
	arenaSettings: text('', { mode: 'json' }),
})

export const roundsRelations = relations(rounds, ({ one }) => ({
	match: one(matches, {
		fields: [rounds.matchId],
		references: [matches.id],
	}),
}))
