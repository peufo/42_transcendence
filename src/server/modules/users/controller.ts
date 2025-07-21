import type { FastifyReply, FastifyRequest } from 'fastify'
import '../../types.js'

import { z } from 'zod'
import { searchUsersService } from './service.js'

export const searchQuerySchema = z.object({
	search: z.string().default(''),
})

type SearchQuery = z.infer<typeof searchQuerySchema>

export async function searchUsersController(
	req: FastifyRequest<{ Querystring: SearchQuery }>,
	res: FastifyReply,
) {
	const user = res.locals?.user
	if (!user) return res.code(401).send()

	const users = await searchUsersService(req.query.search, user.id)
	return res.send({ data: users })
}
