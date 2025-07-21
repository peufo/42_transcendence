import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { searchQuerySchema, searchUsersController } from './controller.js'

export const usersRoute: FastifyPluginCallbackZod = (server, _opts, done) => {
	server.get(
		'/',
		{ schema: { querystring: searchQuerySchema } },
		searchUsersController,
	)
	done()
}
