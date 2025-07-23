import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { permission } from '../../utils/permission.js'
import { getSchema } from '../../utils/schema.js'
import { getMatches } from './model.js'

export const statsRoute: FastifyPluginCallbackZod = (
	server,
	_options,
	done,
) => {
	server.get('/', getSchema('/userstats', null), async (_req, res) => {
		const user = permission.user(res)
		const matches = await getMatches(user.id)
		return res.send({ data: matches })
	})
	done()
}
