import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { permission } from '../../utils/permission.js'
import { getSchema } from '../../utils/schema.js'
import { getMatches, getUsersSortedByGoals } from './model.js'

export const statsRoute: FastifyPluginCallbackZod = (
	server,
	_options,
	done,
) => {
	server.get('/me', getSchema('/stats/me', null), async (_req, res) => {
		const user = permission.user(res)
		const matches = await getMatches(user.id)
		return res.send({ data: matches })
	})
	server.get('/all', getSchema('/stats/all', null), async (_req, res) => {
		const usersOrdered = await getUsersSortedByGoals()
		return res.send({ data: usersOrdered })
	})
	done()
}
