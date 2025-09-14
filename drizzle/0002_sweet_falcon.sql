PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_friendships` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user1Id` integer NOT NULL,
	`user2Id` integer NOT NULL,
	`state` text DEFAULT 'invited' NOT NULL,
	`createdBy` integer NOT NULL,
	`createdAt` integer DEFAULT '"2025-09-14T18:53:02.869Z"' NOT NULL,
	FOREIGN KEY (`user1Id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user2Id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "user1Id_lower_user2Id" CHECK("__new_friendships"."user2Id" > "__new_friendships"."user1Id"),
	CONSTRAINT "creator_is_in_relations" CHECK("__new_friendships"."createdBy" = "__new_friendships"."user1Id" OR "__new_friendships"."createdBy" = "__new_friendships"."user2Id")
);
--> statement-breakpoint
INSERT INTO `__new_friendships`("id", "user1Id", "user2Id", "state", "createdBy", "createdAt") SELECT "id", "user1Id", "user2Id", "state", "createdBy", "createdAt" FROM `friendships`;--> statement-breakpoint
DROP TABLE `friendships`;--> statement-breakpoint
ALTER TABLE `__new_friendships` RENAME TO `friendships`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `friendships_user1Id_user2Id_unique` ON `friendships` (`user1Id`,`user2Id`);--> statement-breakpoint
CREATE TABLE `__new_tournaments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`numberOfPlayers` integer NOT NULL,
	`state` text DEFAULT 'open' NOT NULL,
	`createdAt` integer DEFAULT '"2025-09-14T18:53:02.869Z"' NOT NULL,
	`createdBy` integer NOT NULL,
	FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_tournaments`("id", "numberOfPlayers", "state", "createdAt", "createdBy") SELECT "id", "numberOfPlayers", "state", "createdAt", "createdBy" FROM `tournaments`;--> statement-breakpoint
DROP TABLE `tournaments`;--> statement-breakpoint
ALTER TABLE `__new_tournaments` RENAME TO `tournaments`;--> statement-breakpoint
CREATE TABLE `__new_tournaments_participants` (
	`tournamentId` integer NOT NULL,
	`userId` integer NOT NULL,
	`joinedAt` integer DEFAULT '"2025-09-14T18:53:02.869Z"' NOT NULL,
	FOREIGN KEY (`tournamentId`) REFERENCES `tournaments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_tournaments_participants`("tournamentId", "userId", "joinedAt") SELECT "tournamentId", "userId", "joinedAt" FROM `tournaments_participants`;--> statement-breakpoint
DROP TABLE `tournaments_participants`;--> statement-breakpoint
ALTER TABLE `__new_tournaments_participants` RENAME TO `tournaments_participants`;--> statement-breakpoint
CREATE UNIQUE INDEX `tournaments_participants_tournamentId_userId_unique` ON `tournaments_participants` (`tournamentId`,`userId`);--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`passwordHash` text,
	`hasAvatar` integer DEFAULT false NOT NULL,
	`avatarPlaceholder` text NOT NULL,
	`createdAt` integer DEFAULT '"2025-09-14T18:53:02.868Z"' NOT NULL,
	`lastLogin` integer DEFAULT '"2025-09-14T18:53:02.868Z"' NOT NULL,
	`isActive` integer DEFAULT false NOT NULL,
	`numberOfMatches` integer DEFAULT 0 NOT NULL,
	`numberOfWin` integer DEFAULT 0 NOT NULL,
	`numberOfGoals` integer DEFAULT 0 NOT NULL,
	`isOAuth2` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "name", "passwordHash", "hasAvatar", "avatarPlaceholder", "createdAt", "lastLogin", "isActive", "numberOfMatches", "numberOfWin", "numberOfGoals", "isOAuth2") SELECT "id", "name", "passwordHash", "hasAvatar", "avatarPlaceholder", "createdAt", "lastLogin", "isActive", "numberOfMatches", "numberOfWin", "numberOfGoals", "isOAuth2" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
CREATE UNIQUE INDEX `users_name_unique` ON `users` (`name`);