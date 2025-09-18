CREATE TABLE `friendships` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user1Id` integer NOT NULL,
	`user2Id` integer NOT NULL,
	`state` text DEFAULT 'invited' NOT NULL,
	`createdBy` integer NOT NULL,
	`createdAt` integer DEFAULT '"2025-09-18T19:30:36.109Z"' NOT NULL,
	FOREIGN KEY (`user1Id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user2Id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "user1Id_lower_user2Id" CHECK("friendships"."user2Id" > "friendships"."user1Id"),
	CONSTRAINT "creator_is_in_relations" CHECK("friendships"."createdBy" = "friendships"."user1Id" OR "friendships"."createdBy" = "friendships"."user2Id")
);
--> statement-breakpoint
CREATE UNIQUE INDEX `friendships_user1Id_user2Id_unique` ON `friendships` (`user1Id`,`user2Id`);--> statement-breakpoint
CREATE TABLE `matches` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`state` text DEFAULT 'awaiting' NOT NULL,
	`player1Id` integer,
	`player2Id` integer,
	`player1Score` integer DEFAULT 0 NOT NULL,
	`player2Score` integer DEFAULT 0 NOT NULL,
	`pointsToWin` integer DEFAULT 3 NOT NULL,
	`tournamentId` integer,
	`finishedAt` integer,
	FOREIGN KEY (`player1Id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`player2Id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tournamentId`) REFERENCES `tournaments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `rounds` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`scorer` text NOT NULL,
	`rallyCount` integer NOT NULL,
	`ballPositionY` integer NOT NULL,
	`matchId` integer,
	FOREIGN KEY (`matchId`) REFERENCES `matches`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` integer NOT NULL,
	`secretHash` blob NOT NULL,
	`lastVerifiedAt` integer NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tournaments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`numberOfPlayers` integer NOT NULL,
	`state` text DEFAULT 'open' NOT NULL,
	`createdAt` integer DEFAULT '"2025-09-18T19:30:36.109Z"' NOT NULL,
	`createdBy` integer NOT NULL,
	FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tournaments_participants` (
	`tournamentId` integer NOT NULL,
	`userId` integer NOT NULL,
	`joinedAt` integer DEFAULT '"2025-09-18T19:30:36.109Z"' NOT NULL,
	`isActive` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`tournamentId`) REFERENCES `tournaments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tournaments_participants_tournamentId_userId_unique` ON `tournaments_participants` (`tournamentId`,`userId`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`passwordHash` text,
	`hasAvatar` integer DEFAULT false NOT NULL,
	`avatarPlaceholder` text NOT NULL,
	`createdAt` integer DEFAULT '"2025-09-18T19:30:36.109Z"' NOT NULL,
	`lastLogin` integer DEFAULT '"2025-09-18T19:30:36.109Z"' NOT NULL,
	`isActive` integer DEFAULT false NOT NULL,
	`numberOfMatches` integer DEFAULT 0 NOT NULL,
	`numberOfWin` integer DEFAULT 0 NOT NULL,
	`numberOfGoals` integer DEFAULT 0 NOT NULL,
	`isOAuth2` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_name_unique` ON `users` (`name`);