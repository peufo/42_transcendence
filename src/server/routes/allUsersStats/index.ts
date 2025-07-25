import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { getSchema } from '../../utils/schema.js'
import { getUsersSortedByGoals } from './model.js'

export const allUserStatsRoute: FastifyPluginCallbackZod = (
	server,
	_options,
	done,
) => {
	server.get('/', getSchema('/allusersstats', null), async (_req, res) => {
		const usersOrdered = await getUsersSortedByGoals()
		return res.send({ data: usersOrdered })
	})
	done()
}
