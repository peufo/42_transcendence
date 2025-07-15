import { and, eq, isNotNull, or } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { db, matches } from '../db/index.js'
import '../types.js'

export const statsRoute: FastifyPluginCallbackZod = (server, options, done) => {
	server.get('/', async (req, res) => {
		const user = res.locals?.user
		if (!user) return res.code(401).send()
		const matches = await getMatches(user.id)
		return res.send({ data: matches })
	})
	done()
}

function getMatches(userId: number) {
	return db.query.matches.findMany({
		where: and(
			or(eq(matches.player1Id, userId), eq(matches.player2Id, userId)),
			isNotNull(matches.finishedAt),
		),
		with: {
			player1: { columns: { id: true, name: true } },
			player2: { columns: { id: true, name: true } },
		},
		limit: 5,
	})
}
