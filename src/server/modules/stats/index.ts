import { and, eq, isNotNull, or } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { db, matches } from '../../db/index.js'
import { requireUser } from '../../utils/auth.js'
import '../../types.js'
import { HttpError } from '../../utils/HttpError.js'
export const statsRoute: FastifyPluginCallbackZod = (
	server,
	_options,
	done,
) => {
	server.get('/', async (req, res) => {
		const user = requireUser(req)
		const matches = await getMatches(user.id)
		if (!matches.length) {
			throw new HttpError('No matches found', 404)
		}

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
			player1: {
				columns: {
					id: true,
					name: true,
					avatar: true,
					avatarPlaceholder: true,
				},
			},
			player2: {
				columns: {
					id: true,
					name: true,
					avatar: true,
					avatarPlaceholder: true,
				},
			},
		},
	})
}

