import { eq } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import type { Match } from '../../../lib/type.js'
import { db } from '../../db/index.js'
import { matches } from '../../db/schema.js'
import { permission } from '../../utils/permission.js'
import { postSchema } from '../../utils/schema.js'
import { matchIdSchema, scoreToWinSchema } from './schema.js'

export const remoteRoute: FastifyPluginCallbackZod = (
	server,
	_options,
	done,
) => {
	server.post(
		'/new',
		postSchema('/remote/new', scoreToWinSchema),
		async (req, res) => {
			const { scoreToWin } = req.body
			const [match] = await db
				.insert(matches)
				.values({ scoreToWin })
				.returning()
			return res.send({ success: true, matchId: match.id })
		},
	)

	server.post(
		'/join',
		postSchema('/remote/join', matchIdSchema),
		async (req, res) => {
			const { userId } = permission.session(res)
			const { matchId } = req.body
			const match = await db.query.matches.findFirst({
				where: eq(matches.id, matchId),
				with: { player1: true, player2: true, rounds: true },
			})
			if (!match) return res.forbidden(`Match doesn't exist`)
			if (match.state === 'finished') return res.forbidden('Match is finished')
			if (match.player1Id === userId || match.player2Id === userId)
				return res.send({ success: true, match })
			if (match.player1Id && match.player2Id)
				return res.forbidden('Match is full')
			await db
				.update(matches)
				.set({
					player1Id: match.player1Id || userId,
					player2Id: match.player1Id ? userId : null,
				})
				.where(eq(matches.id, matchId))
			const updatedMatch: Match | undefined = await db.query.matches.findFirst({
				where: eq(matches.id, matchId),
				with: { player1: true, player2: true, rounds: true },
			})
			res.send({ success: true, match: updatedMatch })
		},
	)

	done()
}
