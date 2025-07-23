import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod/v4'
import { getSchema, permission } from '../../utils/index.js'
import { searchUsersAsNotFriends } from './model.js'

export const usersRoute: FastifyPluginCallbackZod = (
	server,
	_options,
	done,
) => {
	server.get(
		'/',
		getSchema('/users', { search: z.string().default('') }),
		async (req, res) => {
			const user = permission.user(res)
			const users = await searchUsersAsNotFriends(user.id, req.query.search)
			return res.send({ data: users })
		},
	)

	done()
}
