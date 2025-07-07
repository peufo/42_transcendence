import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { and, eq, or, isNotNull } from 'drizzle-orm'
import { db, matches } from '../db/index.js'

export const statsRoute: FastifyPluginCallbackZod = (server, options, done) => {
	server.get('/stats', async (req, res) => {
		const user = res.locals?.user
		if (!user) return res.code(401).send()
		const matches = await getMatches(user.id)
		return res.send({ data: matches })
	})
	done()
}

async function getMatches(userId: number) {
	const res = await db.query.matches.findMany({
		where: and(
			or(eq(matches.player1Id, userId), eq(matches.player2Id, userId)),
			isNotNull(matches.finishedAt),
		),
	})
	return res
}
