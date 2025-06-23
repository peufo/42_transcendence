up:
	docker compose up -d

down:
	docker compose down

restart:
	docker compose down && docker compose up -d

build:
	pnpm install
	pnpm run build

build-server:
	pnpm run build:server

build-client:
	pnpm run build:client
