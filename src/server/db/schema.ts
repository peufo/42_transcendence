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
	passwordHash: text(),
	hasAvatar: int({ mode: 'boolean' }).notNull().default(false),
	avatarPlaceholder: text().notNull(),
	createdAt: int({ mode: 'timestamp' }).notNull().default(new Date()),
	lastLogin: int({ mode: 'timestamp' }).notNull().default(new Date()),
	isActive: int({ mode: 'boolean' }).notNull().default(false),
	numberOfMatches: int().notNull().default(0),
	numberOfWin: int().notNull().default(0),
	numberOfGoals: int().notNull().default(0),
	isOAuth2: int({ mode: 'boolean' }).notNull(),
})

export const usersRelations = relations(users, ({ many }) => ({
	friends: many(friendships),
	participations: many(tournamentsParticipants),
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

export const tournamentsParticipants = sqliteTable(
	'tournaments_participants',
	{
		tournamentId: int()
			.notNull()
			.references(() => tournaments.id, { onDelete: 'cascade' }),
		userId: int()
			.notNull()
			.references(() => users.id),
		joinedAt: int({ mode: 'timestamp' }).notNull().default(new Date()),
		isActive: int({ mode: 'boolean' }).notNull().default(true),
	},
	(table) => [unique().on(table.tournamentId, table.userId)],
)

export const tournamentRelations = relations(tournaments, ({ many, one }) => ({
	createdByUser: one(users, {
		fields: [tournaments.createdBy],
		references: [users.id],
	}),
	participants: many(tournamentsParticipants),
	matches: many(matches),
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

export const matches = sqliteTable('matches', {
	id: int().primaryKey({ autoIncrement: true }),
	state: text({ enum: ['ongoing', 'finished', 'awaiting'] })
		.default('awaiting')
		.notNull(),
	player1Id: int().references(() => users.id),
	player2Id: int().references(() => users.id),
	player1Score: int().default(0).notNull(),
	player2Score: int().default(0).notNull(),
	pointsToWin: int().default(3).notNull(),
	tournamentId: int().references(() => tournaments.id),
	finishedAt: int({ mode: 'timestamp' }),
})

export const matchesRelations = relations(matches, ({ one, many }) => ({
	player1: one(users, { fields: [matches.player1Id], references: [users.id] }),
	player2: one(users, { fields: [matches.player2Id], references: [users.id] }),
	tournament: one(tournaments, {
		fields: [matches.tournamentId],
		references: [tournaments.id],
	}),
	rounds: many(rounds),
}))

export const rounds = sqliteTable('rounds', {
	id: int().primaryKey({ autoIncrement: true }),
	scorer: text({ enum: ['p1', 'p2'] }).notNull(),
	rallyCount: int().notNull(),
	ballPositionY: int().notNull(),
	matchId: int().references(() => matches.id),
})

export const roundsRelations = relations(rounds, ({ one }) => ({
	match: one(matches, {
		fields: [rounds.matchId],
		references: [matches.id],
	}),
}))
