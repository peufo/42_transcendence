import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod/v4'
import '../types.js'

const auth: FastifyPluginCallbackZod = (server, options, done) => {
	server.post(
		'/register',
		{
			schema: {
				body: z.object({
					name: z.string().nonempty(),
					password: z.string().min(8),
				}),
			},
		},
		(req, res) => {
			console.log(`To somthing with ${req.body.name}`)
		},
	)

	server.get('/login', (req, res) => {
		res.locals.user = 'Alice'
		res.send(`LOGIN ${res.locals.user}`)
	})
	done()
}

export default auth
