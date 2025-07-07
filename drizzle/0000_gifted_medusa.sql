CREATE TABLE `friendships` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user1Id` integer NOT NULL,
	`user2Id` integer NOT NULL,
	`state` text DEFAULT 'invited',
	`createdBy` integer NOT NULL,
	`createdAt` integer DEFAULT '"2025-07-07T09:21:06.931Z"' NOT NULL,
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
	`player1Id` integer NOT NULL,
	`player2Id` integer,
	`botDifficulty` text DEFAULT 'Kevin' NOT NULL,
	`finished` integer DEFAULT false NOT NULL,
	`pointsToWin` integer NOT NULL,
	FOREIGN KEY (`player1Id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`player2Id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `rounds` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`player1Score` integer DEFAULT 0,
	`player2Score` integer DEFAULT 0,
	`matchId` integer,
	`gamestates` text,
	`arenaSettings` text,
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
	`pointsToWin` integer NOT NULL,
	`botDifficulty` text DEFAULT 'Kevin' NOT NULL,
	`lobbyLocked` integer DEFAULT false NOT NULL,
	`createdAt` integer NOT NULL,
	`startedAt` integer NOT NULL,
	`finished` integer DEFAULT false
);
--> statement-breakpoint
CREATE TABLE `tournaments_participants` (
	`tournamentId` integer NOT NULL,
	`userId` integer NOT NULL,
	FOREIGN KEY (`tournamentId`) REFERENCES `tournaments`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`passwordHash` text NOT NULL,
	`avatar` text,
	`avatarPlaceholder` text NOT NULL,
	`createdAt` integer DEFAULT '"2025-07-07T09:21:06.929Z"' NOT NULL,
	`lastLogin` integer DEFAULT '"2025-07-07T09:21:06.929Z"' NOT NULL,
	`isActive` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_name_unique` ON `users` (`name`);--> statement-breakpoint
CREATE TABLE `versus` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`matchId` integer NOT NULL,
	`tournamentId` integer NOT NULL,
	`player1Id` integer NOT NULL,
	`player2Id` integer NOT NULL,
	`stage` integer NOT NULL,
	FOREIGN KEY (`matchId`) REFERENCES `matches`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tournamentId`) REFERENCES `tournaments`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`player1Id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`player2Id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `versus_matchId_unique` ON `versus` (`matchId`);--> statement-breakpoint
CREATE UNIQUE INDEX `versus_tournamentId_unique` ON `versus` (`tournamentId`);--> statement-breakpoint
CREATE UNIQUE INDEX `versus_player1Id_unique` ON `versus` (`player1Id`);--> statement-breakpoint
CREATE UNIQUE INDEX `versus_player2Id_unique` ON `versus` (`player2Id`);