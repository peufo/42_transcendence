import type { FastifyReply, FastifyRequest } from 'fastify'
import '../../types.js'
import { z } from 'zod'
import { searchUsersService } from './service.js'
import { requireUser } from '../../utils/auth.js'

export const searchQuerySchema = z.object({
	search: z.string().default(''),
})

type SearchQuery = z.infer<typeof searchQuerySchema>

export async function searchUsersController(
	req: FastifyRequest<{ Querystring: SearchQuery }>,
	res: FastifyReply,
) {
	const user = requireUser(req)
	const users = await searchUsersService(req.query.search, user.id)
	return res.send({ data: users })
}

