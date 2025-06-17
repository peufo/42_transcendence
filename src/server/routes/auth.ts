import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod/v4'
import '../types.js'

const auth: FastifyPluginCallbackZod = (server, options, done) => {
	server.post(
		'/login',
		{
			schema: {
				body: z.object({
					name: z.string().min(3),
					password: z.string().min(8),
				}),
			},
		},
		(req, res) => {
			console.log(`To somthing with ${req.body.name}`)
			res.send('Hello')
		},
	)
	done()
}

export default auth
